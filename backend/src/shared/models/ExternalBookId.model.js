const mongoose = require('mongoose');

const BookIdSchema = new mongoose.Schema({
    sourceId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    title: {
        type: String,
        required: true
    },
    authors: [{
        type: String
    }],
    thumbnail: {
        type: String
    },
    description: {
        type: String
    }
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