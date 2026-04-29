const UserGoal = require('../models/UserGoal.model');
const UserBook = require('../models/UserBook.model');
const ReadingLog = require('../models/ReadingLog.model');
const mongoose = require('mongoose');
const logger = require('../configuration/logger');

exports.createGoal = async (req, res) => {
    try {
        const userId = req.userId;
        const { name, type, goalType, startDate, endDate, targetCount, category } = req.body;

        const goal = await UserGoal.create({
            userId,
            name,
            type,
            goalType,
            startDate,
            endDate,
            targetCount,
            category
        });

        res.status(201).json(goal);
    } catch (error) {
        logger.error(`Create Goal Error: ${error.message}`);
        res.status(500).json({ error: 'Failed to create goal' });
    }
};

exports.getGoals = async (req, res) => {
    try {
        const userId = req.userId;
        const goals = await UserGoal.find({ userId }).sort({ createdAt: -1 });

        const goalsWithProgress = await Promise.all(goals.map(async (goal) => {
            let currentCount = 0;

            if (goal.goalType === 'BOOKS_COUNT') {
                const filter = {
                    userId,
                    status: 'completed',
                    finishedAt: { $gte: goal.startDate, $lte: goal.endDate }
                };
                if (goal.category) {
                    const books = await UserBook.find(filter).populate('bookId');
                    currentCount = books.filter(b => 
                        b.bookId.categories && b.bookId.categories.includes(goal.category)
                    ).length;
                } else {
                    currentCount = await UserBook.countDocuments(filter);
                }
            } else if (goal.goalType === 'PAGES_COUNT') {
                const logs = await ReadingLog.find({
                    userId,
                    date: { $gte: goal.startDate, $lte: goal.endDate }
                });
                
                if (goal.category) {
                    const logBookIds = [...new Set(logs.map(l => l.userBookId))];
                    const books = await UserBook.find({ _id: { $in: logBookIds } }).populate('bookId');
                    const categoryBookIds = books
                        .filter(b => b.bookId.categories && b.bookId.categories.includes(goal.category))
                        .map(b => b._id.toString());
                    
                    currentCount = logs
                        .filter(l => categoryBookIds.includes(l.userBookId.toString()))
                        .reduce((sum, log) => sum + log.pagesRead, 0);
                } else {
                    currentCount = logs.reduce((sum, log) => sum + log.pagesRead, 0);
                }
            }

            const goalObj = goal.toJSON();
            goalObj.currentCount = currentCount;
            goalObj.progressPercent = Math.min(100, Math.round((currentCount / goal.targetCount) * 100));
            if (currentCount >= goal.targetCount && !goal.isAchieved) {
                await UserGoal.findByIdAndUpdate(goal._id, { isAchieved: true });
                goalObj.isAchieved = true;
            }

            return goalObj;
        }));

        res.json(goalsWithProgress);
    } catch (error) {
        logger.error(`Get Goals Error: ${error.message}`);
        res.status(500).json({ error: 'Failed to fetch goals' });
    }
};

exports.deleteGoal = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const result = await UserGoal.findOneAndDelete({ _id: id, userId });
        if (!result) {
            return res.status(404).json({ error: 'Goal not found' });
        }

        res.json({ message: 'Goal deleted successfully' });
    } catch (error) {
        logger.error(`Delete Goal Error: ${error.message}`);
        res.status(500).json({ error: 'Failed to delete goal' });
    }
};
