const userBookRepo = require('../repositories/userBook.repository');
const externalBookRepo = require('../repositories/externalBook.repository');
const readingLogRepo = require('../repositories/readingLog.repository');
const googleBooksService = require('./googleBooks.service');
const openLibraryService = require('./openLibrary.service');
const geminiService = require('./gemini.service');
const logger = require('../configuration/logger');
const { getCache, setCache, deleteCache } = require('./redis.service');
const { ReadingStatus } = require('../enums/BookEnums');

const SEARCH_CACHE_TTL = 600;
const RECOMMENDATIONS_CACHE_TTL = 60 * 60 * 24;

class BooksService {
  async searchBooks(query) {
    const normalizedQuery = query.trim().toLowerCase();
    const cacheKey = `books:search:${normalizedQuery}`;

    const cached = await getCache(cacheKey);
    if (cached) {
      logger.info(`Cache hit for search query: "${query}"`);
      return cached;
    }

    let books = [];
    try {
      books = await googleBooksService.search(query);
      logger.info(`Google Books returned ${books.length} results for "${query}"`);
    } catch (googleError) {
      logger.warn(`Google Books API failed for "${query}", falling back to OpenLibrary: ${googleError.message}`);
    }

    if (books.length === 0) {
      try {
        books = await openLibraryService.search(query);
        logger.info(`OpenLibrary returned ${books.length} results for "${query}"`);
      } catch (olError) {
        logger.error(`OpenLibrary API also failed for "${query}": ${olError.message}`);
      }
    }

    await setCache(cacheKey, books, SEARCH_CACHE_TTL);
    return books;
  }

  async upsertExternalBook({ sourceId, title, authors, thumbnail, description, pageCount, categories }) {
    let externalBook = await externalBookRepo.findBySourceId(sourceId);

    if (!externalBook) {
      externalBook = await externalBookRepo.create({
        sourceId, title,
        authors: authors || [],
        thumbnail, description, pageCount,
        categories: categories || []
      });
    } else {
      let needsUpdate = false;
      if (pageCount && !externalBook.pageCount) { externalBook.pageCount = pageCount; needsUpdate = true; }
      if (categories && (!externalBook.categories || externalBook.categories.length === 0)) {
        externalBook.categories = categories; needsUpdate = true;
      }
      if (needsUpdate) await externalBook.save();
    }

    return externalBook;
  }

  async addUserBook(userId, { externalBookId, rating, notes }) {
    const externalBook = await externalBookRepo.findById(externalBookId);
    if (!externalBook) return { notFound: true };

    const existing = await userBookRepo.findByUserAndBookId(userId, externalBookId);
    if (existing) return { conflict: true };

    const userBook = await userBookRepo.create({
      userId,
      bookId: externalBookId,
      status: ReadingStatus.PLANNED,
      rating,
      notes
    });

    await deleteCache(`books:recommendations:${userId}`);
    return { userBook };
  }

  async getUserBooks(userId, { status, rating, tags, search, page = 1, limit = 10 }) {
    const filter = { userId };

    if (search) {
      const matchingBooks = await externalBookRepo.findByTitleRegex(search);
      filter.bookId = { $in: matchingBooks.map(b => b._id) };
    }

    if (status) {
      if (status.startsWith('folder:')) {
        const folderId = status.split(':')[1];
        filter.folderId = folderId === 'null' ? null : folderId;
      } else {
        filter.status = status;
      }
    }

    if (rating !== undefined) {
      const numRating = Number(rating);
      if (!isNaN(numRating)) filter.rating = numRating;
    }

    if (tags) {
      filter.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [totalCount, userBooks, countsByStatus] = await Promise.all([
      userBookRepo.countByUser(userId, filter),
      userBookRepo.findByUserWithFilters(userId, filter, { skip, limit: parseInt(limit) }),
      userBookRepo.countsByStatus(userId)
    ]);

    return {
      books: userBooks,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      countsByStatus
    };
  }

  async deleteUserBook(userId, id) {
    const result = await userBookRepo.deleteByIdAndUser(id, userId);
    if (!result) return false;
    await deleteCache(`books:recommendations:${userId}`);
    return true;
  }

  async updateUserBook(userId, id, { status, rating, notes, tags, currentPage, bookId }) {
    const updateData = {};
    if (status) updateData.status = status;
    if (rating !== undefined) updateData.rating = rating;
    if (notes !== undefined) updateData.notes = notes;
    if (tags !== undefined) updateData.tags = tags;
    if (currentPage !== undefined) updateData.currentPage = currentPage;

    // update external book pageCount if provided
    if (bookId?.pageCount !== undefined) {
      const currentUB = await userBookRepo.findByUserAndId(userId, id);
      if (currentUB) {
        await externalBookRepo.updateById(currentUB.bookId, { pageCount: bookId.pageCount });
      }
    }

    return userBookRepo.updateById(id, userId, updateData);
  }

  async updateReadingProgress(userId, id, pagesRead) {
    const userBook = await userBookRepo.findByUserAndId(userId, id);
    if (!userBook) return { notFound: true };
    if (!userBook.bookId) return { orphaned: true };
    if (userBook.status === ReadingStatus.COMPLETED) return { alreadyCompleted: true };

    const totalPages = userBook.bookId.pageCount || 0;
    const currentProgress = userBook.currentPage || 0;
    const newPage = currentProgress + pagesRead;

    const update = {};
    if (totalPages > 0 && newPage >= totalPages) {
      update.$set = {
        currentPage: totalPages,
        status: ReadingStatus.COMPLETED,
        finishedAt: new Date()
      };
    } else {
      update.$inc = { currentPage: pagesRead };
    }

    const updatedUserBook = await userBookRepo.updateProgressAtomic(id, userId, update);
    if (!updatedUserBook) return { alreadyCompleted: true };

    const log = await readingLogRepo.upsertForToday(userId, id, pagesRead);
    return { userBook: updatedUserBook, log };
  }

  async getRecommendations(userId) {
    const cacheKey = `books:recommendations:${userId}`;

    const cached = await getCache(cacheKey);
    if (cached) {
      logger.info(`Cache hit for recommendations: user ${userId}`);
      return cached;
    }

    const userBooks = await userBookRepo.findAllByUser(userId);
    if (userBooks.length === 0) return [];

    const authors = [...new Set(userBooks.flatMap(b => b.bookId?.authors ?? []))];
    const titles = userBooks.map(b => b.bookId?.title).filter(Boolean);
    const descriptions = userBooks.map(b => b.bookId?.description).filter(Boolean);
    const tags = [...new Set(userBooks.flatMap(b => b.tags ?? []))];

    const recommendations = await geminiService.getBookRecommendations({
      authors, titles, descriptions, tags
    });

    await setCache(cacheKey, recommendations, RECOMMENDATIONS_CACHE_TTL);
    return recommendations;
  }

  async addManualBook({ title, authors, thumbnail, description, pageCount, categories }) {
    const sourceId = `manual_${Date.now()}_${Math.round(Math.random() * 1E9)}`;
    return externalBookRepo.create({
      sourceId, title,
      authors: authors || [],
      thumbnail, description, pageCount,
      categories: categories || []
    });
  }

  async getLatestNote(userId) {
    return userBookRepo.findWithNote(userId);
  }

  async getUserBookById(userId, id) {
    return userBookRepo.findByUserAndId(userId, id);
  }
}

module.exports = new BooksService();