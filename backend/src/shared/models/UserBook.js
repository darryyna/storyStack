const mongoose = require('mongoose');
const { BookEnums } = require('../enums/BookEnums');

const UserBookSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ExternalBookId',
        required: true
    },
    status: {
        type: String,
        enum: BookEnums.ReadingStatusEnum,
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    notes: {
        type: String,
        trim: true
    },
    quotes: [{
        type: String,
        trim: true
    }],
    tags: [{
        type: String,
        trim: true
    }],
    startedAt: {
        type: Date
    },
    finishedAt: {
        type: Date
    },
    currentPage: {
        type: Number,
        min: 0
    },
}, {
    timestamps: true
});

UserBookSchema.index({ userId: 1, bookId: 1 }, { unique: true });

UserBookSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

UserBookSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
    }
});

module.exports = mongoose.model('UserBook', UserBookSchema);