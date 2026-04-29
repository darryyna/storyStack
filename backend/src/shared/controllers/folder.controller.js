const Folder = require('../models/Folder.model');
const UserBook = require('../models/UserBook.model');
const logger = require('../configuration/logger');

exports.createFolder = async (req, res) => {
    try {
        const { name, description, colorLabel, parentId, bookIds } = req.body;
        const userId = req.userId;

        const folder = new Folder({
            name,
            description,
            colorLabel,
            userId,
            parentId: parentId || null
        });

        await folder.save();

        if (bookIds && Array.isArray(bookIds) && bookIds.length > 0) {
            await UserBook.updateMany(
                { _id: { $in: bookIds }, userId },
                { folderId: folder._id }
            );
        }

        res.status(201).json(folder);
    } catch (error) {
        logger.error('Error creating folder:', error);
        res.status(500).json({ message: 'Error creating folder' });
    }
};

exports.getFolders = async (req, res) => {
    try {
        const userId = req.userId;
        const folders = await Folder.find({ userId });
        res.json(folders);
    } catch (error) {
        logger.error('Error fetching folders:', error);
        res.status(500).json({ message: 'Error fetching folders' });
    }
};

exports.updateFolder = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, colorLabel, parentId } = req.body;
        const userId = req.userId;

        const folder = await Folder.findOneAndUpdate(
            { _id: id, userId },
            { name, description, colorLabel, parentId },
            { new: true }
        );

        if (!folder) {
            return res.status(404).json({ message: 'Folder not found' });
        }

        res.json(folder);
    } catch (error) {
        logger.error('Error updating folder:', error);
        res.status(500).json({ message: 'Error updating folder' });
    }
};

exports.deleteFolder = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const folder = await Folder.findOneAndDelete({ _id: id, userId });

        if (!folder) {
            return res.status(404).json({ message: 'Folder not found' });
        }

        // Remove folderId from books in this folder
        await UserBook.updateMany({ folderId: id, userId }, { folderId: null });

        res.json({ message: 'Folder deleted successfully' });
    } catch (error) {
        logger.error('Error deleting folder:', error);
        res.status(500).json({ message: 'Error deleting folder' });
    }
};

exports.addBooksToFolder = async (req, res) => {
    try {
        const { id } = req.params; // folderId
        const { bookIds } = req.body;
        const userId = req.userId;

        let folder = null;
        if (id !== 'null') {
            folder = await Folder.findOne({ _id: id, userId });
            if (!folder) {
                return res.status(404).json({ message: 'Folder not found' });
            }
        }

        const targetFolderId = id === 'null' ? null : id;
        
        logger.info(`Adding/Removing books from folder. FolderId: ${targetFolderId}, BookIds: ${bookIds}`);

        const result = await UserBook.updateMany(
            { _id: { $in: bookIds }, userId },
            { $set: { folderId: targetFolderId } }
        );

        logger.info(`Update result: ${JSON.stringify(result)}`);

        res.json({ message: 'Books updated in folder successfully' });
    } catch (error) {
        logger.error('Error adding books to folder:', error);
        res.status(500).json({ message: 'Error adding books to folder' });
    }
};
