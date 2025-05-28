const mongoose = require('mongoose');

const currentYear = new Date().getFullYear();
const UserGoalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    year: {
        type: Number,
        required: true,
        min: 1900,
        max: currentYear + 3
    },
    goal: {
        type: Number,
        required: true,
        min: 1
    },
    completed: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserBook'
    }],
    isAchieved: {
        type: Boolean,
        default: false
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