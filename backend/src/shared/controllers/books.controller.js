const booksService = require('../services/books.service');
const { isValidObjectId } = require('../helpers/idValidationCheck');
const logger = require('../configuration/logger');

exports.searchBooks = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Query parameter "q" is required' });

    const books = await booksService.searchBooks(q);
    res.json(books);
  } catch (error) {
    logger.error(`Search Books Error: ${error.message}`);
    res.status(500).json({ error: 'Failed to search books' });
  }
};

exports.addExternalBook = async (req, res) => {
  try {
    const { sourceId, title } = req.body;
    if (!sourceId || !title) {
      return res.status(400).json({ error: 'sourceId and title are required' });
    }

    const externalBook = await booksService.upsertExternalBook(req.body);
    res.json(externalBook);
  } catch (error) {
    logger.error(`Add External Book Error: ${error.message}`);
    res.status(500).json({ error: 'Failed to add external book' });
  }
};

exports.addUserBook = async (req, res) => {
  try {
    const { externalBookId } = req.body;
    if (!externalBookId) return res.status(400).json({ error: 'externalBookId is required' });
    if (!isValidObjectId(externalBookId)) return res.status(400).json({ error: 'Invalid externalBookId' });

    const result = await booksService.addUserBook(req.userId, req.body);

    if (result.notFound) return res.status(404).json({ error: 'External book not found' });
    if (result.conflict) return res.status(409).json({ error: 'Book already added to your library' });

    res.status(201).json(result.userBook);
  } catch (error) {
    logger.error(`Add User Book Error: ${error.message}`);
    res.status(500).json({ error: 'Failed to add book to user library' });
  }
};

exports.getUserBooks = async (req, res) => {
  try {
    const result = await booksService.getUserBooks(req.userId, req.query);
    res.json(result);
  } catch (error) {
    logger.error(`Get User Books Error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch user books' });
  }
};

exports.deleteUserBook = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid book ID' });

    const deleted = await booksService.deleteUserBook(req.userId, id);
    if (!deleted) return res.status(404).json({ error: 'Book not found in your library' });

    res.json({ message: 'Book successfully deleted from library' });
  } catch (error) {
    logger.error(`Delete User Book Error: ${error.message}`);
    res.status(500).json({ error: 'Failed to delete book from library' });
  }
};

exports.getUserBookById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid book ID' });

    const userBook = await booksService.getUserBookById(req.userId, id);
    if (!userBook) return res.status(404).json({ error: 'Book not found in library' });

    res.json(userBook);
  } catch (error) {
    logger.error(`Get User Book By Id Error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch user book' });
  }
};

exports.updateUserBook = async (req, res) => {
  try {
    const { id } = req.params;
    const userBook = await booksService.updateUserBook(req.userId, id, req.body);
    if (!userBook) return res.status(404).json({ error: 'Book not found in library' });

    res.json(userBook);
  } catch (error) {
    logger.error(`Update User Book Error: ${error.message}`);
    res.status(500).json({ error: 'Failed to update user book' });
  }
};

exports.getLatestNote = async (req, res) => {
  try {
    const latestBook = await booksService.getLatestNote(req.userId);
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

exports.updateReadingProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { pagesRead } = req.body;

    if (!Number.isInteger(pagesRead) || pagesRead <= 0) {
      return res.status(400).json({ error: 'pagesRead must be a positive integer' });
    }

    const result = await booksService.updateReadingProgress(req.userId, id, pagesRead);

    if (result.notFound) return res.status(404).json({ error: 'Book not found' });
    if (result.orphaned) return res.status(500).json({ error: 'Book metadata not found' });
    if (result.alreadyCompleted) return res.status(400).json({ error: 'Cannot update progress on a completed book' });

    res.json(result);
  } catch (error) {
    logger.error(`Update Reading Progress Error: ${error.message}`);
    res.status(500).json({ error: 'Failed to update reading progress' });
  }
};

exports.uploadCover = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ url: `/uploads/books/${req.file.filename}` });
  } catch (error) {
    logger.error(`Upload Cover Error: ${error.message}`);
    res.status(500).json({ error: 'Failed to upload cover' });
  }
};

exports.addManualBook = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const externalBook = await booksService.addManualBook(req.body);
    res.status(201).json(externalBook);
  } catch (error) {
    logger.error(`Add Manual Book Error: ${error.message}`);
    res.status(500).json({ error: 'Failed to add manual book' });
  }
};

exports.getRecommendations = async (req, res) => {
  try {
    const recommendations = await booksService.getRecommendations(req.userId);
    res.json(recommendations);
  } catch (error) {
    logger.error(`Get Recommendations Error: ${error.message}`);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
};