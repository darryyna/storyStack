const userBookRepo = require('../repositories/userBook.repository');
const readingLogRepo = require('../repositories/readingLog.repository');
const userGoalRepo = require('../repositories/userGoal.repository');
const mongoose = require('mongoose');

class StatisticsService {
  async getGeneralStats(userId) {
    const [bookStats, achievedGoals, tagStats] = await Promise.all([
      userBookRepo.aggregateByUser(userId, [
        {
          $group: {
            _id: null,
            totalBooks: { $sum: 1 },
            booksRead: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            avgRating: { $avg: '$rating' },
            totalCurrentPages: { $sum: '$currentPage' }
          }
        }
      ]),
      userGoalRepo.countAchieved(userId),
      userBookRepo.aggregateByUser(userId, [
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    const result = bookStats[0] || { totalBooks: 0, booksRead: 0, avgRating: 0, totalCurrentPages: 0 };
    return { ...result, achievedGoals, topTags: tagStats };
  }

  async getGenreStats(userId) {
    return userBookRepo.aggregateByUser(userId, [
      {
        $lookup: {
          from: 'externalbookids',
          localField: 'bookId',
          foreignField: '_id',
          as: 'bookDetails'
        }
      },
      { $unwind: '$bookDetails' },
      { $unwind: '$bookDetails.categories' },
      { $group: { _id: '$bookDetails.categories', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
  }

  async getAuthorStats(userId) {
    return userBookRepo.aggregateByUser(userId, [
      {
        $lookup: {
          from: 'externalbookids',
          localField: 'bookId',
          foreignField: '_id',
          as: 'bookDetails'
        }
      },
      { $unwind: '$bookDetails' },
      { $unwind: '$bookDetails.authors' },
      { $group: { _id: '$bookDetails.authors', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
  }

  async getActivityStats(userId, period = 'month') {
    const dateLimit = new Date();
    if (period === 'month') {
      dateLimit.setMonth(dateLimit.getMonth() - 1);
    } else {
      dateLimit.setFullYear(dateLimit.getFullYear() - 1);
    }

    const objectId = new mongoose.Types.ObjectId(userId);
    return readingLogRepo.aggregateByDate(objectId, dateLimit);
  }

  async getBooksPerYearStats(userId) {
    return userBookRepo.aggregateByUser(userId, [
      { $match: { status: 'completed', finishedAt: { $exists: true } } },
      { $group: { _id: { $year: '$finishedAt' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
  }
}

module.exports = new StatisticsService();