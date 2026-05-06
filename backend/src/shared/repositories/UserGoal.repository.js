const UserGoal = require('../models/UserGoal.model');

class UserGoalRepository {
  async findByUser(userId) {
    return UserGoal.find({ userId }).sort({ createdAt: -1 });
  }

  async findByUserAndId(userId, id) {
    return UserGoal.findOne({ _id: id, userId });
  }

  async create(data) {
    return UserGoal.create(data);
  }

  async deleteByUserAndId(userId, id) {
    return UserGoal.findOneAndDelete({ _id: id, userId });
  }

  async markAchieved(id) {
    return UserGoal.findByIdAndUpdate(id, { isAchieved: true });
  }

  async countAchieved(userId) {
    return UserGoal.countDocuments({ userId, isAchieved: true });
  }
}

module.exports = new UserGoalRepository();