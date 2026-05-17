const mongoose = require('mongoose');

const UserGoalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['MONTH', 'QUARTER', 'HALF_YEAR', 'YEAR'],
        required: true
    },
    goalType: {
        type: String,
        enum: ['BOOKS_COUNT', 'PAGES_COUNT'],
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    targetCount: {
        type: Number,
        required: true,
        min: 1
    },
    category: {
        type: String,
        trim: true
    },
    isAchieved: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true          // indexed — queries filter by this frequently
    },
    deactivatedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

UserGoalSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

UserGoalSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
    }
});

module.exports = mongoose.model('UserGoal', UserGoalSchema);