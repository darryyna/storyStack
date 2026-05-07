const ReadingLog = require('../models/ReadingLog.model');
const mongoose = require('mongoose');

class ReadingLogRepository {
  async upsertForToday(userId, userBookId, pagesRead) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    return ReadingLog.findOneAndUpdate(
      { userId, userBookId, date: { $gte: startOfDay } },
      {
        $inc: { pagesRead },
        $setOnInsert: { userId, userBookId, date: new Date() }
      },
      { upsert: true, new: true }
    );
  }

  async findByUserInRange(userId, startDate, endDate) {
    return ReadingLog.find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    });
  }

  async findByUserSince(userId, since) {
    return ReadingLog.find({ userId, date: { $gte: since } });
  }

  async aggregateByDate(userId, since) {
    return ReadingLog.aggregate([
      { $match: { userId, date: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          pagesRead: { $sum: '$pagesRead' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
  }

  async sumPagesByCategory(userId, startDate, endDate, category) {
    const result = await ReadingLog.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $lookup: {
          from: 'userbooks',
          localField: 'userBookId',
          foreignField: '_id',
          as: 'userBook'
        }
      },
      { $unwind: '$userBook' },
      {
        $lookup: {
          from: 'externalbookids',
          localField: 'userBook.bookId',
          foreignField: '_id',
          as: 'bookDetails'
        }
      },
      { $unwind: '$bookDetails' },
      { $match: { 'bookDetails.categories': category } },
      {
        $group: {
          _id: null,
          totalPages: { $sum: '$pagesRead' }
        }
      }
    ]);
    return result[0]?.totalPages ?? 0;
  }
}

module.exports = new ReadingLogRepository();