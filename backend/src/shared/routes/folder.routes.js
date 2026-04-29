const express = require('express');
const router = express.Router();
const folderController = require('../controllers/folder.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.post('/', folderController.createFolder);
router.get('/', folderController.getFolders);
router.put('/:id', folderController.updateFolder);
router.delete('/:id', folderController.deleteFolder);
router.post('/:id/books', folderController.addBooksToFolder);

module.exports = router;
