const axios = require('axios');
const ExternalBookId = require('../models/ExternalBookId.model');
const UserBook = require('../models/UserBook.model');
const { getCache, setCache } = require('../services/redis.service');

const googleApiUrl = process.env.GOOGLE_BOOKS_API_URL;
const SEARCH_CACHE_TTL = 600; // 10 minutes

exports.searchBooks = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ error: 'Query parameter "q" is required' });
        }

        const normalizedQuery = q.trim().toLowerCase();
        const cacheKey = `books:search:${normalizedQuery}`;

        const cached = await getCache(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        const response = await axios.get(googleApiUrl, {
            params: { q }
        });

        const books = response.data.items || [];
        await setCache(cacheKey, books, SEARCH_CACHE_TTL);
        res.json(books);
    } catch (error) {
        console.error('Google Books API Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch books from Google API' });
    }
};

exports.addExternalBook = async (req, res) => {
    try {
        const { sourceId, title, authors, thumbnail } = req.body;

        if (!sourceId || !title) {
            return res.status(400).json({ error: 'sourceId and title are required' });
        }

        let externalBook = await ExternalBookId.findOne({ sourceId });

        if (!externalBook) {
            externalBook = new ExternalBookId({
                sourceId,
                title,
                authors: authors || [],
                thumbnail
            });
            await externalBook.save();
        }

        res.json({
            id: externalBook.id,
            sourceId: externalBook.sourceId,
            title: externalBook.title,
            authors: externalBook.authors,
            thumbnail: externalBook.thumbnail
        });
    } catch (error) {
        console.error('Add External Book Error:', error);
        res.status(500).json({ error: 'Failed to add external book' });
    }
};

exports.addUserBook = async (req, res) => {
    try {
        const userId = req.userId;
        const { externalBookId, rating, notes } = req.body;
        const status = 'planned'; // always force 'planned' status for newly added books

        if (!externalBookId) {
            return res.status(400).json({ error: 'externalBookId is required' });
        }

        const existingUserBook = await UserBook.findOne({ userId, bookId: externalBookId });
        if (existingUserBook) {
            return res.status(409).json({ error: 'Book already added to your library' });
        }

        const userBook = new UserBook({
            userId,
            bookId: externalBookId,
            status,
            rating,
            notes
        });

        await userBook.save();

        res.status(201).json(userBook);
    } catch (error) {
        console.error('Add User Book Error:', error);
        res.status(500).json({ error: 'Failed to add book to user library' });
    }
};

exports.getUserBooks = async (req, res) => {
    try {
        const userId = req.userId;
        const { status, rating, tags } = req.query;

        const filter = { userId };

        if (status) {
            filter.status = status;
        }

        if (rating) {
            filter.rating = Number(rating);
        }

        if (tags) {
            filter.tags = { $in: Array.isArray(tags) ? tags : [tags] };
        }

        const userBooks = await UserBook.find(filter).populate('bookId');
        res.json(userBooks);
    } catch (error) {
        console.error('Get User Books Error:', error);
        res.status(500).json({ error: 'Failed to fetch user books' });
    }
};

exports.deleteUserBook = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const result = await UserBook.findOneAndDelete({ _id: id, userId });

        if (!result) {
            return res.status(404).json({ error: 'Book not found in your library' });
        }

        res.json({ message: 'Book successfully deleted from library' });
    } catch (error) {
        console.error('Delete User Book Error:', error);
        res.status(500).json({ error: 'Failed to delete book from library' });
    }
};

exports.getLatestNote = async (req, res) => {
    try {
        const userId = req.userId;
        const latestBook = await UserBook.findOne({
            userId,
            notes: { $ne: null, $exists: true, $not: /^\s*$/ }
        })
            .sort({ updatedAt: -1 })
            .populate('bookId');

        if (!latestBook) {
            return res.status(404).json({ error: 'No books with notes found' });
        }

        res.json({
            bookId: latestBook._id,
            bookTitle: latestBook.bookId.title,
            lastNote: latestBook.notes,
            timestamp: latestBook.updatedAt
        });
    } catch (error) {
        console.error('Get Latest Note Error:', error);
        res.status(500).json({ error: 'Failed to fetch latest note' });
    }
};

exports.getUserBookById = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const userBook = await UserBook.findOne({ _id: id, userId }).populate('bookId');

        if (!userBook) {
            return res.status(404).json({ error: 'Book not found in library' });
        }

        res.json(userBook);
    } catch (error) {
        console.error('Get User Book By Id Error:', error);
        res.status(500).json({ error: 'Failed to fetch user book' });
    }
};

exports.updateUserBook = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const { status, rating, notes, tags, currentPage } = req.body;

        const updateData = {};
        if (status) updateData.status = status;
        if (rating !== undefined) updateData.rating = rating;
        if (notes !== undefined) updateData.notes = notes;
        if (tags !== undefined) updateData.tags = tags;
        if (currentPage !== undefined) updateData.currentPage = currentPage;

        const userBook = await UserBook.findOneAndUpdate(
            { _id: id, userId },
            { $set: updateData },
            { new: true }
        ).populate('bookId');

        if (!userBook) {
            return res.status(404).json({ error: 'Book not found in library' });
        }

        res.json(userBook);
    } catch (error) {
        console.error('Update User Book Error:', error);
        res.status(500).json({ error: 'Failed to update user book' });
    }
};
