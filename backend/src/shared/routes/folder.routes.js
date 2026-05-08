const express = require('express');
const router = express.Router();
const folderController = require('../controllers/folder.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { asyncHandler } = require('../middlewares/errorHandler.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { createFolderSchema, updateFolderSchema, bookIdsSchema } = require('../validation/folder.schema');

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Folders
 *   description: Folder management for organizing books
 */

/**
 * @swagger
 * /api/folders:
 *   post:
 *     summary: Create a new folder
 *     tags: [Folders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       201:
 *         description: Folder created successfully
 */
router.post('/', validate(createFolderSchema), asyncHandler(folderController.createFolder));

/**
 * @swagger
 * /api/folders:
 *   get:
 *     summary: Get all user folders
 *     tags: [Folders]
 *     responses:
 *       200:
 *         description: List of folders
 */
router.get('/', asyncHandler(folderController.getFolders));

/**
 * @swagger
 * /api/folders/{id}:
 *   put:
 *     summary: Update a folder
 *     tags: [Folders]
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
 *         description: Folder updated successfully
 */
router.put('/:id', validate(updateFolderSchema), asyncHandler(folderController.updateFolder));

/**
 * @swagger
 * /api/folders/{id}:
 *   delete:
 *     summary: Delete a folder
 *     tags: [Folders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Folder deleted successfully
 */
router.delete('/:id', asyncHandler(folderController.deleteFolder));

/**
 * @swagger
 * /api/folders/{id}/books:
 *   post:
 *     summary: Add books to a folder
 *     tags: [Folders]
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
 *               bookIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Books added to folder successfully
 */
router.post('/:id/books', validate(bookIdsSchema), asyncHandler(folderController.addBooksToFolder));

/**
 * @swagger
 * /api/folders/{id}/books:
 *   delete:
 *     summary: Remove books from a folder
 *     tags: [Folders]
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
 *               bookIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Books removed from folder successfully
 */
router.delete('/:id/books', validate(bookIdsSchema), asyncHandler(folderController.removeBooksFromFolder));

module.exports = router;
