const ExternalBookId = require('../models/ExternalBookId.model');
const UserBook = require('../models/UserBook.model');
const { getCache, setCache } = require('../services/redis.service');
const googleBooksService = require('../services/googleBooks.service');
const openLibraryService = require('../services/openLibrary.service');
const { isValidObjectId } = require('../helpers/idValidationCheck');
const logger = require('../configuration/logger');

const SEARCH_CACHE_TTL = 600; // 10 minutes

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
    const status = 'planned'; // always force 'planned' status for newly added books

    if (!externalBookId) {
      return res.status(400).json({
        error: 'externalBookId is required'
      });
    }

    if (!isValidObjectId(externalBookId)) {
      return res.status(400).json({
        error: 'Invalid externalBookId'
      });
    }

    const externalBook = await ExternalBookId.findById(externalBookId);
    if (!externalBook) {
      return res.status(404).json({
        error: 'External book not found'
      });
    }

    const existingUserBook = await UserBook.findOne({
      userId,
      bookId: externalBookId
    });

    if (existingUserBook) {
      return res.status(409).json({
        error: 'Book already added to your library'
      });
    }

    const userBook = await UserBook.create({
      userId,
      bookId: externalBookId,
      status,
      rating,
      notes
    });
    res.status(201).json(userBook);

  } catch (error) {
    logger.error(`Add User Book Error: ${error.message}`);
    res.status(500).json({
      error: 'Failed to add book to user library'
    });
  }
};

exports.getUserBooks = async (req, res) => {
    try {
        const userId = req.userId;
        const { status, rating, tags, page = 1, limit = 10 } = req.query;

        const filter = { userId };

        if (status) {
            filter.status = status;
        }
        if (rating !== undefined) {
          const numRating = Number(rating);
          if (isNaN(numRating)) {
            return res.status(400).json({ error: 'rating must be a number' });
          }
          filter.rating = numRating;
        }

        if (tags) {
            filter.tags = { $in: Array.isArray(tags) ? tags : [tags] };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Fetch total count for pagination metadata
        const totalCount = await UserBook.countDocuments(filter);
        
        const userBooks = await UserBook.find(filter)
            .populate('bookId')
            .sort({ updatedAt: -1 }) // Show latest first
            .skip(skip)
            .limit(parseInt(limit));

        res.json({
            books: userBooks,
            totalCount,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalCount / parseInt(limit))
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
