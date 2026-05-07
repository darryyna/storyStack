const express = require('express');
const router = express.Router();
const folderController = require('../controllers/folder.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { asyncHandler } = require('../middlewares/errorHandler.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { createFolderSchema, updateFolderSchema, bookIdsSchema } = require('../validation/folder.schema');

router.use(authMiddleware);

router.post('/', validate(createFolderSchema), asyncHandler(folderController.createFolder));
router.get('/', asyncHandler(folderController.getFolders));
router.put('/:id', validate(updateFolderSchema), asyncHandler(folderController.updateFolder));
router.delete('/:id', asyncHandler(folderController.deleteFolder));
router.post('/:id/books', validate(bookIdsSchema), asyncHandler(folderController.addBooksToFolder));
router.delete('/:id/books', validate(bookIdsSchema), asyncHandler(folderController.removeBooksFromFolder));

module.exports = router;
