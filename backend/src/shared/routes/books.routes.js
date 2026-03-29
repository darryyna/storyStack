const express = require('express');
const router = express.Router();
const booksController = require('../controllers/books.controller');
const auth = require('../middlewares/auth.middleware');
const upload = require('../configuration/multer.config');

/**
 * @swagger
 * /api/books/search:
 *   get:
 *     summary: Search for books
 *     description: Search for books using Google Books API.
 */
router.get('/search', auth, booksController.searchBooks);

/**
 * @swagger
 * /api/books/external:
 *   post:
 *     summary: Add external book
 */
router.post('/external', auth, booksController.addExternalBook);

/**
 * @swagger
 * /api/books/user-books/latest-note:
 *   get:
 *     summary: Get latest user book note
 */
router.get('/user-books/latest-note', auth, booksController.getLatestNote);

/**
 * @swagger
 * /api/books/user-books/{id}:
 *   get:
 *     summary: Get single user book
 */
router.get('/user-books/:id', auth, booksController.getUserBookById);

/**
 * @swagger
 * /api/books/user-books/{id}:
 *   patch:
 *     summary: Update book in user library
 */
router.patch('/user-books/:id', auth, booksController.updateUserBook);

/**
 * @swagger
 * /api/books/user-books/{id}:
 *   delete:
 *     summary: Delete book from user library
 */
router.delete('/user-books/:id', auth, booksController.deleteUserBook);

/**
 * @swagger
 * /api/books/user-books:
 *   get:
 *     summary: Get user library
 */
router.get('/user-books', auth, booksController.getUserBooks);

router.post('/user-books', auth, booksController.addUserBook);

/**
 * @swagger
 * /api/books/upload-cover:
 *   post:
 *     summary: Upload book cover image
 */
router.post('/upload-cover', auth, upload.single('cover'), booksController.uploadCover);

/**
 * @swagger
 * /api/books/manual:
 *   post:
 *     summary: Add manual book entry
 */
router.post('/manual', auth, booksController.addManualBook);

module.exports = router;
