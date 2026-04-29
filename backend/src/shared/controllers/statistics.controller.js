const UserBook = require('../models/UserBook.model');
const ReadingLog = require('../models/ReadingLog.model');
const UserGoal = require('../models/UserGoal.model');
const mongoose = require('mongoose');
const logger = require('../configuration/logger');

exports.getGeneralStats = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.userId);

        const [bookStats, achievedGoals] = await Promise.all([
            UserBook.aggregate([
                { $match: { userId } },
                {
                    $group: {
                        _id: null,
                        totalBooks: { $sum: 1 },
                        booksRead: {
                            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
                        },
                        avgRating: { $avg: "$rating" },
                        totalCurrentPages: { $sum: "$currentPage" }
                    }
                }
            ]),
            UserGoal.countDocuments({ userId, isAchieved: true })
        ]);

        const tagStats = await UserBook.aggregate([
            { $match: { userId } },
            { $unwind: "$tags" },
            { $group: { _id: "$tags", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        const result = bookStats[0] || {
            totalBooks: 0,
            booksRead: 0,
            avgRating: 0,
            totalCurrentPages: 0
        };

        res.json({
            ...result,
            achievedGoals,
            topTags: tagStats
        });
    } catch (error) {
        logger.error(`Get General Stats Error: ${error.message}`);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
};

exports.getGenreStats = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.userId);

        const genreStats = await UserBook.aggregate([
            { $match: { userId } },
            {
                $lookup: {
                    from: 'externalbookids',
                    localField: 'bookId',
                    foreignField: '_id',
                    as: 'bookDetails'
                }
            },
            { $unwind: "$bookDetails" },
            { $unwind: "$bookDetails.categories" },
            { $group: { _id: "$bookDetails.categories", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.json(genreStats);
    } catch (error) {
        logger.error(`Get Genre Stats Error: ${error.message}`);
        res.status(500).json({ error: 'Failed to fetch genre statistics' });
    }
};

exports.getAuthorStats = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.userId);

        const authorStats = await UserBook.aggregate([
            { $match: { userId } },
            {
                $lookup: {
                    from: 'externalbookids',
                    localField: 'bookId',
                    foreignField: '_id',
                    as: 'bookDetails'
                }
            },
            { $unwind: "$bookDetails" },
            { $unwind: "$bookDetails.authors" },
            { $group: { _id: "$bookDetails.authors", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.json(authorStats);
    } catch (error) {
        logger.error(`Get Author Stats Error: ${error.message}`);
        res.status(500).json({ error: 'Failed to fetch author statistics' });
    }
};

exports.getActivityStats = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.userId);
        const { period = 'month' } = req.query; // 'month' or 'year'

        const dateLimit = new Date();
        if (period === 'month') {
            dateLimit.setMonth(dateLimit.getMonth() - 1);
        } else {
            dateLimit.setFullYear(dateLimit.getFullYear() - 1);
        }

        const activity = await ReadingLog.aggregate([
            { $match: { userId, date: { $gte: dateLimit } } },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$date" }
                    },
                    pagesRead: { $sum: "$pagesRead" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json(activity);
    } catch (error) {
        logger.error(`Get Activity Stats Error: ${error.message}`);
        res.status(500).json({ error: 'Failed to fetch activity statistics' });
    }
};

exports.getBooksPerYearStats = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.userId);

        const stats = await UserBook.aggregate([
            { $match: { userId, status: 'completed', finishedAt: { $exists: true } } },
            {
                $group: {
                    _id: { $year: "$finishedAt" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json(stats);
    } catch (error) {
        logger.error(`Get Books Per Year Stats Error: ${error.message}`);
        res.status(500).json({ error: 'Failed to fetch books per year statistics' });
    }
};
