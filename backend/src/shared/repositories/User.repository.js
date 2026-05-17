const User = require('../models/User.model');

class UserRepository {
  async findByUsername(username) {
    return User.findOne({ username });
  }

  async findByEmail(email) {
    return User.findOne({ email });
  }

  async findById(id) {
    return User.findById(id).select('username email');
  }

  async create(data) {
    return User.create(data);
  }

  async findByResetToken(token) {
    return User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
  }
}

module.exports = new UserRepository();