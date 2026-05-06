const folderRepo = require('../repositories/folder.repository');
const userBookRepo = require('../repositories/userBook.repository');
const logger = require('../configuration/logger');

exports.createFolder = async (req, res) => {
  try {
    const { name, description, colorLabel, parentId, bookIds } = req.body;
    const userId = req.userId;

    const folder = await folderRepo.create({
      name, description, colorLabel,
      userId,
      parentId: parentId || null
    });

    if (bookIds?.length > 0) {
      await userBookRepo.updateManyFolder(bookIds, userId, folder._id);
    }

    res.status(201).json(folder);
  } catch (error) {
    logger.error('Error creating folder:', error);
    res.status(500).json({ message: 'Error creating folder' });
  }
};

exports.getFolders = async (req, res) => {
  try {
    const folders = await folderRepo.findByUser(req.userId);
    res.json(folders);
  } catch (error) {
    logger.error('Error fetching folders:', error);
    res.status(500).json({ message: 'Error fetching folders' });
  }
};

exports.updateFolder = async (req, res) => {
  try {
    const { name, description, colorLabel, parentId } = req.body;
    const folder = await folderRepo.updateByUserAndId(req.userId, req.params.id, {
      name, description, colorLabel, parentId
    });

    if (!folder) return res.status(404).json({ message: 'Folder not found' });
    res.json(folder);
  } catch (error) {
    logger.error('Error updating folder:', error);
    res.status(500).json({ message: 'Error updating folder' });
  }
};

exports.deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const folder = await folderRepo.deleteByUserAndId(req.userId, id);
    if (!folder) return res.status(404).json({ message: 'Folder not found' });

    await userBookRepo.clearFolderFromBooks(id, req.userId);
    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    logger.error('Error deleting folder:', error);
    res.status(500).json({ message: 'Error deleting folder' });
  }
};

exports.addBooksToFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { bookIds } = req.body;
    const userId = req.userId;

    if (id !== 'null') {
      const folder = await folderRepo.findByUserAndId(userId, id);
      if (!folder) return res.status(404).json({ message: 'Folder not found' });
    }

    const targetFolderId = id === 'null' ? null : id;
    await userBookRepo.updateManyFolder(bookIds, userId, targetFolderId);

    res.json({ message: 'Books updated in folder successfully' });
  } catch (error) {
    logger.error('Error adding books to folder:', error);
    res.status(500).json({ message: 'Error adding books to folder' });
  }
};

exports.removeBooksFromFolder = async (req, res) => {
  try {
    await userBookRepo.updateManyFolder(req.body.bookIds, req.userId, null);
    res.json({ message: 'Books removed from folder successfully' });
  } catch (error) {
    logger.error('Error removing books from folder:', error);
    res.status(500).json({ message: 'Error removing books from folder' });
  }
};