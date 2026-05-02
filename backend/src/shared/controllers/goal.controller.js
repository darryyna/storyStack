const UserGoal = require('../models/UserGoal.model');
const UserBook = require('../models/UserBook.model');
const ReadingLog = require('../models/ReadingLog.model');
const logger = require('../configuration/logger');
const geminiService = require('../services/gemini.service');

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


exports.getGoalPrediction = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const goal = await UserGoal.findOne({ _id: id, userId });
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    let currentCount = 0;
    if (goal.goalType === 'BOOKS_COUNT') {
      currentCount = await UserBook.countDocuments({
        userId,
        status: 'completed',
        finishedAt: { $gte: goal.startDate, $lte: goal.endDate }
      });
    } else {
      const logs = await ReadingLog.find({
        userId,
        date: { $gte: goal.startDate, $lte: goal.endDate }
      });
      currentCount = logs.reduce((sum, l) => sum + l.pagesRead, 0);
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const ninetyDaysAgo = new Date(now);
    ninetyDaysAgo.setDate(now.getDate() - 90);

    const logsLast30 = await ReadingLog.find({
      userId,
      date: { $gte: thirtyDaysAgo }
    });
    const logsLast90 = await ReadingLog.find({
      userId,
      date: { $gte: ninetyDaysAgo }
    });

    const uniqueDaysLast30 = new Set(
      logsLast30.map(l => l.date.toISOString().split('T')[0])
    ).size;

    const totalPagesLast30 = logsLast30.reduce((s, l) => s + l.pagesRead, 0);
    const avgPagesPerDay = uniqueDaysLast30 > 0
      ? Math.round(totalPagesLast30 / uniqueDaysLast30)
      : 0;
    const activeDaysPerWeek = Math.round((uniqueDaysLast30 / 30) * 7 * 10) / 10;

    const booksLast90 = await UserBook.countDocuments({
      userId,
      status: 'completed',
      finishedAt: { $gte: ninetyDaysAgo }
    });
    const avgBooksPerMonth = Math.round((booksLast90 / 3) * 10) / 10;

    const achievedGoalsCount = await UserGoal.countDocuments({ userId, isAchieved: true });

    const daysUntilEnd = Math.max(0, Math.ceil((new Date(goal.endDate) - now) / (1000 * 60 * 60 * 24)));

    const prediction = await geminiService.getGoalPrediction({
      goal,
      readingStats: {
        avgPagesPerDay,
        avgBooksPerMonth,
        activeDaysPerWeek,
        totalPagesLast30Days: totalPagesLast30,
        totalBooksLast90Days: booksLast90,
        achievedGoalsCount,
        daysUntilEnd,
        currentCount,
        targetCount: goal.targetCount,
        goalType: goal.goalType,
        goalPeriod: goal.type,
        goalName: goal.name,
      }
    });

    res.json({
      prediction,
      stats: {
        avgPagesPerDay,
        avgBooksPerMonth,
        activeDaysPerWeek,
        currentCount,
        daysUntilEnd,
      }
    });

  } catch (error) {
    logger.error(`Get Goal Prediction Error: ${error.message}`);
    res.status(500).json({ error: 'Failed to get goal prediction' });
  }
};