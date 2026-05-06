const booksService = require('../services/books.service');
const { isValidObjectId } = require('../helpers/idValidationCheck');
const logger = require('../configuration/logger');
const { ValidationError, NotFoundError, ConflictError, AppError } = require('../errorsHandling/errors');

exports.searchBooks = async (req, res) => {
  const { q } = req.query;
  if (!q) throw new ValidationError('Query parameter "q" is required');

  const books = await booksService.searchBooks(q);
  res.json(books);
};

exports.addExternalBook = async (req, res) => {
  const { sourceId, title } = req.body;
  if (!sourceId || !title) {
    throw new ValidationError('sourceId and title are required');
  }

  const externalBook = await booksService.upsertExternalBook(req.body);
  res.json(externalBook);
};

exports.addUserBook = async (req, res) => {
  const { externalBookId } = req.body;
  if (!externalBookId) throw new ValidationError('externalBookId is required');
  if (!isValidObjectId(externalBookId)) throw new ValidationError('Invalid externalBookId');

  const result = await booksService.addUserBook(req.userId, req.body);

  if (result.notFound) throw new NotFoundError('External book not found');
  if (result.conflict) throw new ConflictError('Book already added to your library');

  res.status(201).json(result.userBook);
};

exports.getUserBooks = async (req, res) => {
  const result = await booksService.getUserBooks(req.userId, req.query);
  res.json(result);
};

exports.deleteUserBook = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new ValidationError('Invalid book ID');

  const deleted = await booksService.deleteUserBook(req.userId, id);
  if (!deleted) throw new NotFoundError('Book not found in your library');

  res.json({ message: 'Book successfully deleted from library' });
};

exports.getUserBookById = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new ValidationError('Invalid book ID');

  const userBook = await booksService.getUserBookById(req.userId, id);
  if (!userBook) throw new NotFoundError('Book not found in library');

  res.json(userBook);
};

exports.updateUserBook = async (req, res) => {
  const { id } = req.params;
  const userBook = await booksService.updateUserBook(req.userId, id, req.body);
  if (!userBook) throw new NotFoundError('Book not found in library');

  res.json(userBook);
};

exports.getLatestNote = async (req, res) => {
  const latestBook = await booksService.getLatestNote(req.userId);
  if (!latestBook || !latestBook.bookId) {
    throw new NotFoundError('No books with notes found');
  }

  res.json({
    bookId: latestBook._id,
    bookTitle: latestBook.bookId.title,
    lastNote: latestBook.notes,
    timestamp: latestBook.updatedAt
  });
};

exports.updateReadingProgress = async (req, res) => {
  const { id } = req.params;
  const { pagesRead } = req.body;

  if (!Number.isInteger(pagesRead) || pagesRead <= 0) {
    throw new ValidationError('pagesRead must be a positive integer');
  }

  const result = await booksService.updateReadingProgress(req.userId, id, pagesRead);

  if (result.notFound) throw new NotFoundError('Book not found');
  if (result.orphaned) throw new AppError('Book metadata not found', 500);
  if (result.alreadyCompleted) throw new ValidationError('Cannot update progress on a completed book');

  res.json(result);
};

exports.uploadCover = async (req, res) => {
  if (!req.file) throw new ValidationError('No file uploaded');
  res.json({ url: `/uploads/books/${req.file.filename}` });
};

exports.addManualBook = async (req, res) => {
  const { title } = req.body;
  if (!title) throw new ValidationError('Title is required');

  const externalBook = await booksService.addManualBook(req.body);
  res.status(201).json(externalBook);
};

exports.getRecommendations = async (req, res) => {
  const recommendations = await booksService.getRecommendations(req.userId);
  res.json(recommendations);
};