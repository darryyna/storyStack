const folderRepo = require('../repositories/folder.repository');
const userBookRepo = require('../repositories/userBook.repository');
const logger = require('../configuration/logger');
const { NotFoundError } = require('../errorsHandling/errors');

exports.createFolder = async (req, res) => {
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
};

exports.getFolders = async (req, res) => {
  const folders = await folderRepo.findByUser(req.userId);
  res.json(folders);
};

exports.updateFolder = async (req, res) => {
  const { name, description, colorLabel, parentId } = req.body;
  const folder = await folderRepo.updateByUserAndId(req.userId, req.params.id, {
    name, description, colorLabel, parentId
  });

  if (!folder) throw new NotFoundError('Folder not found');
  res.json(folder);
};

exports.deleteFolder = async (req, res) => {
  const { id } = req.params;
  const folder = await folderRepo.deleteByUserAndId(req.userId, id);
  if (!folder) throw new NotFoundError('Folder not found');

  await userBookRepo.clearFolderFromBooks(id, req.userId);
  res.json({ message: 'Folder deleted successfully' });
};

exports.addBooksToFolder = async (req, res) => {
  const { id } = req.params;
  const { bookIds } = req.body;
  const userId = req.userId;

  if (id !== 'null') {
    const folder = await folderRepo.findByUserAndId(userId, id);
    if (!folder) throw new NotFoundError('Folder not found');
  }

  const targetFolderId = id === 'null' ? null : id;
  await userBookRepo.updateManyFolder(bookIds, userId, targetFolderId);

  res.json({ message: 'Books updated in folder successfully' });
};

exports.removeBooksFromFolder = async (req, res) => {
  await userBookRepo.updateManyFolder(req.body.bookIds, req.userId, null);
  res.json({ message: 'Books removed from folder successfully' });
};