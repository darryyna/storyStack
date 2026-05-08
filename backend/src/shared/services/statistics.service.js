const userBookRepo = require('../repositories/userBook.repository');
const readingLogRepo = require('../repositories/readingLog.repository');
const userGoalRepo = require('../repositories/userGoal.repository');
const ReadingLog = require('../models/ReadingLog.model');
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

  async getReadingRecord(userId) {
    const objectId = new mongoose.Types.ObjectId(userId);

    // best single day — aggregate ReadingLog by date
    const bestDay = await ReadingLog.aggregate([
      { $match: { userId: objectId } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          totalPages: { $sum: '$pagesRead' },
          userBookIds: { $addToSet: '$userBookId' },
          date: { $first: '$date' }
        }
      },
      { $sort: { totalPages: -1 } },
      { $limit: 1 }
    ]);

    if (!bestDay.length) return null;

    const record = bestDay[0];
    let bookTitle = null;

    // try to find which book was read the most on that day
    if (record.userBookIds.length > 0) {
      const topBookLog = await ReadingLog.aggregate([
        {
          $match: {
            userId: objectId,
            userBookId: { $in: record.userBookIds },
            date: {
              $gte: new Date(record._id + 'T00:00:00.000Z'),
              $lte: new Date(record._id + 'T23:59:59.999Z')
            }
          }
        },
        { $group: { _id: '$userBookId', pages: { $sum: '$pagesRead' } } },
        { $sort: { pages: -1 } },
        { $limit: 1 },
        {
          $lookup: {
            from: 'userbooks',
            localField: '_id',
            foreignField: '_id',
            as: 'ub'
          }
        },
        { $unwind: '$ub' },
        {
          $lookup: {
            from: 'externalbookids',
            localField: 'ub.bookId',
            foreignField: '_id',
            as: 'ext'
          }
        },
        { $unwind: '$ext' }
      ]);

      if (topBookLog.length) bookTitle = topBookLog[0].ext.title;
    }

    // average pages per active day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentLogs = await ReadingLog.find({ userId: objectId, date: { $gte: thirtyDaysAgo } });
    const uniqueDays = new Set(recentLogs.map(l => l.date.toISOString().split('T')[0])).size;
    const totalRecentPages = recentLogs.reduce((s, l) => s + l.pagesRead, 0);
    const avgPagesPerDay = uniqueDays > 0 ? Math.round(totalRecentPages / uniqueDays) : 0;

    return {
      maxPagesInDay: record.totalPages,
      maxPagesDate: record._id,
      bookTitle,
      avgPagesPerDay,
      activeDaysLast30: uniqueDays,
      totalPagesLast30: totalRecentPages,
    };
  }

  async getReadingStreak(userId) {
    const objectId = new mongoose.Types.ObjectId(userId);

    // get all unique reading dates sorted desc
    const allDates = await ReadingLog.aggregate([
      { $match: { userId: objectId } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    if (!allDates.length) {
      return { currentStreak: 0, longestStreak: 0, lastReadDate: null, recentDays: [] };
    }

    const dateSet = new Set(allDates.map(d => d._id));
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // current streak — starts from today or yesterday
    let currentStreak = 0;
    let checkDate = dateSet.has(today) ? today : (dateSet.has(yesterday) ? yesterday : null);

    if (checkDate) {
      let d = new Date(checkDate);
      while (dateSet.has(d.toISOString().split('T')[0])) {
        currentStreak++;
        d.setDate(d.getDate() - 1);
      }
    }

    // longest streak
    const sortedDates = [...dateSet].sort();
    let longestStreak = 0;
    let tempStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diff = (curr - prev) / 86400000;
      if (diff === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

    // last 14 days status for the calendar dots
    const recentDays = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
      recentDays.push({
        date: d,
        active: dateSet.has(d),
        isToday: d === today
      });
    }

    return {
      currentStreak,
      longestStreak,
      lastReadDate: allDates[0]?._id || null,
      recentDays,
    };
  }

  async getInsights(userId) {
    const objectId = new mongoose.Types.ObjectId(userId);

    const [bestMonthData, weekdayData, avgBookLength, topAuthor] = await Promise.all([
      // best month (by books completed)
      ReadingLog.aggregate([
        { $match: { userId: objectId } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
            totalPages: { $sum: '$pagesRead' }
          }
        },
        { $sort: { totalPages: -1 } },
        { $limit: 1 }
      ]),

      // most active weekday
      ReadingLog.aggregate([
        { $match: { userId: objectId } },
        {
          $group: {
            _id: { $dayOfWeek: '$date' }, // 1=Sun, 2=Mon ... 7=Sat
            totalPages: { $sum: '$pagesRead' },
            count: { $sum: 1 }
          }
        },
        { $sort: { totalPages: -1 } },
        { $limit: 1 }
      ]),

      // average book length
      userBookRepo.aggregateByUser(userId, [
        { $match: { status: 'completed' } },
        {
          $lookup: {
            from: 'externalbookids',
            localField: 'bookId',
            foreignField: '_id',
            as: 'ext'
          }
        },
        { $unwind: '$ext' },
        { $match: { 'ext.pageCount': { $gt: 0 } } },
        { $group: { _id: null, avgPages: { $avg: '$ext.pageCount' } } }
      ]),

      // top author
      userBookRepo.aggregateByUser(userId, [
        {
          $lookup: {
            from: 'externalbookids',
            localField: 'bookId',
            foreignField: '_id',
            as: 'ext'
          }
        },
        { $unwind: '$ext' },
        { $unwind: '$ext.authors' },
        { $group: { _id: '$ext.authors', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 }
      ])
    ]);

    const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const bestWeekday = weekdayData[0] ? WEEKDAYS[(weekdayData[0]._id - 1) % 7] : null;

    // format best month
    let bestMonthLabel = null;
    if (bestMonthData[0]) {
      const [y, m] = bestMonthData[0]._id.split('-');
      const date = new Date(Number(y), Number(m) - 1);
      bestMonthLabel = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }

    return {
      bestMonth: bestMonthLabel,
      bestMonthPages: bestMonthData[0]?.totalPages || 0,
      mostActiveDayOfWeek: bestWeekday,
      avgBookLength: avgBookLength[0] ? Math.round(avgBookLength[0].avgPages) : 0,
      topAuthor: topAuthor[0]?._id || null,
      topAuthorBooks: topAuthor[0]?.count || 0,
    };
  }
}

module.exports = new StatisticsService();