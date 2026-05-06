const UserGoal = require('../models/UserGoal.model');

class UserGoalRepository {
  // only active goals (default list view)
  async findByUser(userId) {
    return UserGoal.find({ userId, isActive: true }).sort({ createdAt: -1 });
  }

  // only deactivated goals (archived view)
  async findDeactivatedByUser(userId) {
    return UserGoal.find({ userId, isActive: false }).sort({ deactivatedAt: -1 });
  }

  async findByUserAndId(userId, id) {
    return UserGoal.findOne({ _id: id, userId });
  }

  async create(data) {
    return UserGoal.create(data);
  }

  async deactivateByUserAndId(userId, id) {
    return UserGoal.findOneAndUpdate(
      { _id: id, userId },
      { isActive: false, deactivatedAt: new Date() },
      { new: true }
    );
  }

  async reactivateByUserAndId(userId, id) {
    return UserGoal.findOneAndUpdate(
      { _id: id, userId, isActive: false },
      { isActive: true, deactivatedAt: null },
      { new: true }
    );
  }

  async deleteByUserAndId(userId, id) {
    return UserGoal.findOneAndDelete({ _id: id, userId });
  }

  async markAchieved(id) {
    return UserGoal.findByIdAndUpdate(id, { isAchieved: true });
  }

  async countAchieved(userId) {
    return UserGoal.countDocuments({ userId, isAchieved: true, isActive: true });
  }
}

module.exports = new UserGoalRepository();