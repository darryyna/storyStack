const mongoose = require('mongoose');

const ReadingLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userBookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserBook',
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    pagesRead: {
        type: Number,
        required: true,
        min: 1
    }
}, {
    timestamps: true
});

ReadingLogSchema.index({ userId: 1, date: -1 });
ReadingLogSchema.index({ userBookId: 1 });

ReadingLogSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

ReadingLogSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
    }
});

module.exports = mongoose.model('ReadingLog', ReadingLogSchema);
