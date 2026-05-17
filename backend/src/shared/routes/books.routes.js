const express = require('express');
const router = express.Router();
const booksController = require('../controllers/books.controller');
const auth = require('../middlewares/auth.middleware');
const upload = require('../configuration/multer.config');
const { asyncHandler } = require('../middlewares/errorHandler.middleware');
const { validate } = require('../middlewares/validate.middleware');
const {
  addExternalBookSchema,
  addUserBookSchema,
  updateUserBookSchema,
  updateProgressSchema,
  addManualBookSchema,
  searchQuerySchema,
} = require('../validation/books.schema');

router.use(auth);
/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Book management and searching
 */

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
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: List of books found
 */
router.get('/search', validate(searchQuerySchema, 'query'), asyncHandler(booksController.searchBooks));

/**
 * @swagger
 * /api/books/external:
 *   post:
 *     summary: Add external book
 *     description: Add a book to user's library from an external source (like Google Books).
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Book added successfully
 */
router.post('/external', validate(addExternalBookSchema), asyncHandler(booksController.addExternalBook));

/**
 * @swagger
 * /api/books/user-books/latest-note:
 *   get:
 *     summary: Get latest user book note
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: The most recent note created by the user
 */
router.get('/user-books/latest-note', asyncHandler(booksController.getLatestNote));

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
router.get('/user-books/recommendations', asyncHandler(booksController.getRecommendations));

/**
 * @swagger
 * /api/books/user-books/cabinet-preview:
 *   get:
 *     summary: Get cabinet preview data
 *     description: Returns data needed for the personal cabinet dashboard.
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: Cabinet preview data
 */
router.get('/user-books/cabinet-preview', asyncHandler(booksController.getCabinetPreview));

/**
 * @swagger
 * /api/books/user-books/{id}:
 *   get:
 *     summary: Get single user book
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User book details
 */
router.get('/user-books/:id', asyncHandler(booksController.getUserBookById));

/**
 * @swagger
 * /api/books/user-books/{id}:
 *   patch:
 *     summary: Update book in user library
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Book updated successfully
 */
router.patch('/user-books/:id', validate(updateUserBookSchema), asyncHandler(booksController.updateUserBook));

/**
 * @swagger
 * /api/books/user-books/{id}/progress:
 *   patch:
 *     summary: Update reading progress
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPage:
 *                 type: number
 *     responses:
 *       200:
 *         description: Progress updated successfully
 */
router.patch('/user-books/:id/progress', validate(updateProgressSchema), asyncHandler(booksController.updateReadingProgress));

/**
 * @swagger
 * /api/books/user-books/{id}:
 *   delete:
 *     summary: Delete book from user library
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Book deleted successfully
 */
router.delete('/user-books/:id', asyncHandler(booksController.deleteUserBook));

/**
 * @swagger
 * /api/books/user-books:
 *   get:
 *     summary: Get user library
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: List of user books
 */
router.get('/user-books', asyncHandler(booksController.getUserBooks));

/**
 * @swagger
 * /api/books/user-books:
 *   post:
 *     summary: Add a book to user library
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Book added successfully
 */
router.post('/user-books', validate(addUserBookSchema), asyncHandler(booksController.addUserBook));

/**
 * @swagger
 * /api/books/upload-cover:
 *   post:
 *     summary: Upload book cover image
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: Cover uploaded successfully
 */
router.post('/upload-cover', upload.single('cover'), asyncHandler(booksController.uploadCover));

/**
 * @swagger
 * /api/books/manual:
 *   post:
 *     summary: Add manual book entry
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Book added successfully
 */
router.post('/manual', validate(addManualBookSchema), asyncHandler(booksController.addManualBook));

module.exports = router;
