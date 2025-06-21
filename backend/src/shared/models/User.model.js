const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6

    },
}, {
    timestamps: true // createdAt && updatedAt fields
});

module.exports = mongoose.model('User', UserSchema);