const mongoose = require('mongoose');

const BookIdSchema = new mongoose.Schema({
    sourceId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
});

BookIdSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

BookIdSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
    }
});

module.exports = mongoose.model('ExternalBookId', BookIdSchema);