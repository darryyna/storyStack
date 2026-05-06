const Folder = require('../models/Folder.model');

class FolderRepository {
  async findByUser(userId) {
    return Folder.find({ userId });
  }

  async findByUserAndId(userId, id) {
    return Folder.findOne({ _id: id, userId });
  }

  async create(data) {
    return new Folder(data).save();
  }

  async updateByUserAndId(userId, id, data) {
    return Folder.findOneAndUpdate(
      { _id: id, userId },
      data,
      { new: true }
    );
  }

  async deleteByUserAndId(userId, id) {
    return Folder.findOneAndDelete({ _id: id, userId });
  }
}

module.exports = new FolderRepository();