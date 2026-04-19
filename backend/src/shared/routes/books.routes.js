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
 * /api/books/user-books/recommendations:
 *   get:
 *     summary: Get AI-powered book recommendations
 *     description: >
 *       Returns 5 personalized book recommendations based on the user's reading history,
 *       favorite authors, tags, and book descriptions. Results are cached for 24 hours
 *       and invalidated when the user adds or removes a book.
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of recommended books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: gemini_rec1
 *                   title:
 *                     type: string
 *                     example: The Name of the Wind
 *                   authors:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["Patrick Rothfuss"]
 *                   description:
 *                     type: string
 *                     example: A fantasy novel about a legendary wizard...
 *                   thumbnail:
 *                     type: string
 *                     example: ""
 *                   sourceId:
 *                     type: string
 *                     example: gemini_rec1
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to get recommendations
 */
router.get('/user-books/recommendations', auth, booksController.getRecommendations);

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
 * /api/books/user-books/{id}/progress:
 *   patch:
 *     summary: Update reading progress
 */
router.patch('/user-books/:id/progress', auth, booksController.updateReadingProgress);

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
