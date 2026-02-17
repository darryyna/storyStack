const express = require('express');
const router = express.Router();
const booksController = require('../controllers/books.controller');
const auth = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /api/books/search:
 *   get:
 *     summary: Search for books
 *     description: Search for books using Google Books API.
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query
 *     responses:
 *       200:
 *         description: List of books matching query
 *       500:
 *         description: Server error
 */
router.get('/search', booksController.searchBooks);

/**
 * @swagger
 * /api/books/external:
 *   post:
 *     summary: Add external book
 *     description: Add a book from Google Books to the internal external books cache.
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sourceId
 *               - title
 *             properties:
 *               sourceId:
 *                 type: string
 *                 description: Google Books ID
 *               title:
 *                 type: string
 *               authors:
 *                 type: array
 *                 items:
 *                   type: string
 *               thumbnail:
 *                 type: string
 *     responses:
 *       200:
 *         description: External book added/retrieved successfully
 */
router.post('/external', booksController.addExternalBook);

/**
 * @swagger
 * /api/books/user-books:
 *   post:
 *     summary: Add book to user library
 *     description: Add a book to the authenticated user's library.
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - externalBookId
 *             properties:
 *               externalBookId:
 *                 type: string
 *                 description: ID of the ExternalBook
 *               status:
 *                 type: string
 *                 enum: [planned, reading, completed, onHold, dropped]
 *               rating:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Book added to library
 *       409:
 *         description: Book already in library
 *       401:
 *         description: Unauthorized
 */
router.post('/user-books', auth, booksController.addUserBook);

/**
 * @swagger
 * /api/books/user-books:
 *   get:
 *     summary: Get user library
 *     description: Retrieve all books in the authenticated user's library.
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user books
 *       401:
 *         description: Unauthorized
 */
router.get('/user-books', auth, booksController.getUserBooks);

module.exports = router;
