const ExternalBookId = require('../models/ExternalBookId.model');
const UserBook = require('../models/UserBook.model');
const { getCache, setCache, deleteCache } = require('../services/redis.service');
const { isValidObjectId } = require('../helpers/idValidationCheck');
const logger = require('../configuration/logger');
const { ReadingStatus } = require('../enums/BookEnums');
const mongoose = require('mongoose');

const googleBooksService = require('../services/googleBooks.service');
const openLibraryService = require('../services/openLibrary.service');
const geminiService = require('../services/gemini.service');


const SEARCH_CACHE_TTL = 600; // 10 minutes
const RECOMMENDATIONS_CACHE_TTL = 60 * 60 * 24; // 24 hours

exports.searchBooks = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const normalizedQuery = q.trim().toLowerCase();
    const cacheKey = `books:search:${normalizedQuery}`;

    const cached = await getCache(cacheKey);
    if (cached) {
      logger.info(`Cache hit for search query: "${q}"`);
      return res.json(cached);
    }

    // Primary: Google Books API
    let books = [];
    try {
      books = await googleBooksService.search(q);
      logger.info(`Google Books returned ${books.length} results for "${q}"`);
    } catch (googleError) {
      logger.warn(`Google Books API failed for "${q}", falling back to OpenLibrary: ${googleError.message}`);
    }

    // Fallback: OpenLibrary (if Google returned no results or errored)
    if (books.length === 0) {
      try {
        books = await openLibraryService.search(q);
        logger.info(`OpenLibrary returned ${books.length} results for "${q}"`);
      } catch (olError) {
        logger.error(`OpenLibrary API also failed for "${q}": ${olError.message}`);
      }
    }

    await setCache(cacheKey, books, SEARCH_CACHE_TTL);
    res.json(books);
  } catch (error) {
    logger.error(`Search Books Error: ${error.message}`);
    res.status(500).json({ error: 'Failed to search books' });
  }
};

exports.addExternalBook = async (req, res) => {
  try {
    const { sourceId, title, authors, thumbnail, description } = req.body;

    if (!sourceId || !title) {
      return res.status(400).json({ error: 'sourceId and title are required' });
    }

    let externalBook = await ExternalBookId.findOne({ sourceId });

    if (!externalBook) {
      externalBook = new ExternalBookId({
        sourceId,
        title,
        authors: authors || [],
        thumbnail,
        description
      });
      await externalBook.save();
    }

    res.json({
      id: externalBook.id,
      sourceId: externalBook.sourceId,
      title: externalBook.title,
      authors: externalBook.authors,
      thumbnail: externalBook.thumbnail,
      description: externalBook.description
    });
  } catch (error) {
    logger.error(`Add External Book Error: ${error.message}`);
    res.status(500).json({ error: 'Failed to add external book' });
  }
};

exports.addUserBook = async (req, res) => {
  try {
    const userId = req.userId;
    const { externalBookId, rating, notes } = req.body;
    const status = ReadingStatus.PLANNED;

    if (!externalBookId) {
      return res.status(400).json({ error: 'externalBookId is required' });
    }

    if (!isValidObjectId(externalBookId)) {
      return res.status(400).json({ error: 'Invalid externalBookId' });
    }

    const externalBook = await ExternalBookId.findById(externalBookId);
    if (!externalBook) {
      return res.status(404).json({ error: 'External book not found' });
    }

    const existingUserBook = await UserBook.findOne({ userId, bookId: externalBookId });
    if (existingUserBook) {
      return res.status(409).json({ error: 'Book already added to your library' });
    }

    const userBook = await UserBook.create({
      userId,
      bookId: externalBookId,
      status,
      rating,
      notes
    });
    res.status(201).json(userBook);
    await deleteCache(`books:recommendations:${userId}`);
  } catch (error) {
    logger.error(`Add User Book Error: ${error.message}`);
    res.status(500).json({ error: 'Failed to add book to user library' });
  }
};

exports.getUserBooks = async (req, res) => {
  try {
    const userId = req.userId;
    const { status, rating, tags, page = 1, limit = 10 } = req.query;

    const filter = { userId };
    if (status) filter.status = status;

    if (rating !== undefined) {
      const numRating = Number(rating);
      if (!isNaN(numRating)) filter.rating = numRating;
    }

    if (tags) {
      filter.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [totalCount, userBooks] = await Promise.all([
      UserBook.countDocuments(filter),
      UserBook.find(filter)
        .populate('bookId')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
    ]);
    const countsRaw = await UserBook.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    const countsByStatus = {};
    Object.values(ReadingStatus).forEach(s => {
      countsByStatus[s] = 0;
    });
    countsRaw.forEach(item => {
      if (item._id in countsByStatus) {
        countsByStatus[item._id] = item.count;
      }
    });

    res.json({
      books: userBooks,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      countsByStatus
    });
  } catch (error) {
    logger.error(`Get User Books Error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch user books' });
  }
};

exports.deleteUserBook = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid book ID' });
    }

    const result = await UserBook.findOneAndDelete({ _id: id, userId });

    if (!result) {
      return res.status(404).json({ error: 'Book not found in your library' });
    }

    res.json({ message: 'Book successfully deleted from library' });
    await deleteCache(`books:recommendations:${userId}`);
  } catch (error) {
    logger.error(`Delete User Book Error: ${error.message}`);
    res.status(500).json({ error: 'Failed to delete book from library' });
  }
};

exports.getLatestNote = async (req, res) => {
  try {
    const userId = req.userId;
    const latestBook = await UserBook.findOne({
      userId,
      notes: { $ne: null, $exists: true, $not: /^\s*$/ }
    })
      .sort({ updatedAt: -1 })
      .populate('bookId');

    if (!latestBook || !latestBook.bookId) {
      return res.status(404).json({ error: 'No books with notes found' });
    }

    res.json({
      bookId: latestBook._id,
      bookTitle: latestBook.bookId.title,
      lastNote: latestBook.notes,
      timestamp: latestBook.updatedAt
    });
  } catch (error) {
    logger.error(`Get Latest Note Error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch latest note' });
  }
};

exports.getUserBookById = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid book ID' });
    }

    const userBook = await UserBook.findOne({ _id: id, userId }).populate('bookId');

    if (!userBook) {
      return res.status(404).json({ error: 'Book not found in library' });
    }

    res.json(userBook);
  } catch (error) {
    logger.error(`Get User Book By Id Error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch user book' });
  }
};

exports.updateUserBook = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { status, rating, notes, tags, currentPage } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (rating !== undefined) updateData.rating = rating;
    if (notes !== undefined) updateData.notes = notes;
    if (tags !== undefined) updateData.tags = tags;
    if (currentPage !== undefined) updateData.currentPage = currentPage;

    const userBook = await UserBook.findOneAndUpdate(
      { _id: id, userId },
      { $set: updateData },
      { new: true }
    ).populate('bookId');

    if (!userBook) {
      return res.status(404).json({ error: 'Book not found in library' });
    }

    res.json(userBook);
  } catch (error) {
    logger.error(`Update User Book Error: ${error.message}`);
    res.status(500).json({ error: 'Failed to update user book' });
  }
};

exports.uploadCover = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const relativePath = `/uploads/books/${req.file.filename}`;
    res.json({ url: relativePath });
  } catch (error) {
    logger.error(`Upload Cover Error: ${error.message}`);
    res.status(500).json({ error: 'Failed to upload cover' });
  }
};

exports.addManualBook = async (req, res) => {
  try {
    const { title, authors, thumbnail, description } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const sourceId = `manual_${Date.now()}_${Math.round(Math.random() * 1E9)}`;

    const externalBook = new ExternalBookId({
      sourceId,
      title,
      authors: authors || [],
      thumbnail,
      description
    });
    await externalBook.save();

    res.status(201).json(externalBook);
  } catch (error) {
    logger.error(`Add Manual Book Error: ${error.message}`);
    res.status(500).json({ error: 'Failed to add manual book' });
  }
};

exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.userId;
    const cacheKey = `books:recommendations:${userId}`;

    const cached = await getCache(cacheKey);
    if (cached) {
      logger.info(`Cache hit for recommendations: user ${userId}`);
      return res.json(cached);
    }

    const userBooks = await UserBook.find({ userId })
      .populate('bookId')
      .lean();

    if (userBooks.length === 0) {
      return res.json([]);
    }

    const authors = [...new Set(userBooks.flatMap(b => b.bookId?.authors ?? []))];
    const titles = userBooks.map(b => b.bookId?.title).filter(Boolean);
    const descriptions = userBooks.map(b => b.bookId?.description).filter(Boolean);
    const tags = [...new Set(userBooks.flatMap(b => b.tags ?? []))];

    const recommendations = await geminiService.getBookRecommendations({
      authors, titles, descriptions, tags
    });

    await setCache(cacheKey, recommendations, RECOMMENDATIONS_CACHE_TTL);
    res.json(recommendations);
  } catch (error) {
    logger.error(`Get Recommendations Error: ${error.message}`);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
};