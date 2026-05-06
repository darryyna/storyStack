const ReadingLog = require('../models/ReadingLog.model');

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
}

module.exports = new ReadingLogRepository();