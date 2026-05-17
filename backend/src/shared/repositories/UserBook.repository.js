const UserBook = require('../models/UserBook.model');
const mongoose = require('mongoose');
const { ReadingStatus } = require('../enums/BookEnums');

class UserBookRepository {
  async findByUserWithFilters(userId, filter, { skip, limit }) {
    return UserBook.find(filter)
      .populate('bookId')
      .populate('folderId')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  async countByUser(userId, filter) {
    return UserBook.countDocuments(filter);
  }

  async countsByStatus(userId) {
    const countsRaw = await UserBook.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const countsByStatus = {};
    Object.values(ReadingStatus).forEach(s => { countsByStatus[s] = 0; });
    countsRaw.forEach(item => {
      if (item._id in countsByStatus) countsByStatus[item._id] = item.count;
    });
    return countsByStatus;
  }

  async findByUserAndId(userId, id) {
    return UserBook.findOne({ _id: id, userId }).populate('bookId');
  }

  async findByUserAndBookId(userId, bookId) {
    return UserBook.findOne({ userId, bookId });
  }

  async findAllByUser(userId) {
    return UserBook.find({ userId }).populate('bookId').lean();
  }

  async findWithNote(userId) {
    return UserBook.findOne({
      userId,
      notes: { $ne: null, $exists: true, $not: /^\s*$/ }
    })
      .sort({ updatedAt: -1 })
      .populate('bookId');
  }

  async create(data) {
    return UserBook.create(data);
  }

  async updateById(id, userId, updateData) {
    return UserBook.findOneAndUpdate(
      { _id: id, userId },
      { $set: updateData },
      { new: true }
    ).populate('bookId');
  }

  async deleteByIdAndUser(id, userId) {
    return UserBook.findOneAndDelete({ _id: id, userId });
  }

  // progress-specific: update only if not completed
  async updateProgressAtomic(id, userId, update) {
    return UserBook.findOneAndUpdate(
      { _id: id, userId, status: { $ne: ReadingStatus.COMPLETED } },
      update,
      { new: true }
    ).populate('bookId');
  }

  async countCompleted(userId, startDate, endDate) {
    return UserBook.countDocuments({
      userId,
      status: ReadingStatus.COMPLETED,
      finishedAt: { $gte: startDate, $lte: endDate }
    });
  }

  async findCompletedInRange(userId, startDate, endDate) {
    return UserBook.find({
      userId,
      status: ReadingStatus.COMPLETED,
      finishedAt: { $gte: startDate, $lte: endDate }
    }).populate('bookId');
  }

  async findByIds(ids, userId) {
    return UserBook.find({ _id: { $in: ids }, userId }).populate('bookId');
  }

  async updateManyFolder(bookIds, userId, folderId) {
    return UserBook.updateMany(
      { _id: { $in: bookIds }, userId },
      { $set: { folderId } }
    );
  }

  async clearFolderFromBooks(folderId, userId) {
    return UserBook.updateMany({ folderId, userId }, { folderId: null });
  }

  // stats aggregations
  async aggregateByUser(userId, pipeline) {
    return UserBook.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      ...pipeline
    ]);
  }


  async countCompletedByCategory(userId, startDate, endDate, category) {
    const result = await UserBook.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          status: ReadingStatus.COMPLETED,
          finishedAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $lookup: {
          from: 'externalbookids',
          localField: 'bookId',
          foreignField: '_id',
          as: 'bookDetails'
        }
      },
      { $unwind: '$bookDetails' },
      { $match: { 'bookDetails.categories': category } },
      { $count: 'total' }
    ]);
    return result[0]?.total ?? 0;
  }

  async countCompletedSince(userId, since) {
    return UserBook.countDocuments({
      userId,
      status: ReadingStatus.COMPLETED,
      finishedAt: { $gte: since }
    });
  }
}

module.exports = new UserBookRepository();