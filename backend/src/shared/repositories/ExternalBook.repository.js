const ExternalBookId = require('../models/ExternalBookId.model');

class ExternalBookRepository {
  async findBySourceId(sourceId) {
    return ExternalBookId.findOne({ sourceId });
  }

  async findById(id) {
    return ExternalBookId.findById(id);
  }

  async create(data) {
    return ExternalBookId.create(data);
  }

  async updateById(id, data) {
    return ExternalBookId.findByIdAndUpdate(id, data, { new: true });
  }

  async findByTitleRegex(search) {
    return ExternalBookId.find({
      title: { $regex: search, $options: 'i' }
    }).select('_id');
  }
}

module.exports = new ExternalBookRepository();