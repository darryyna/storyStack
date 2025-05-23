const mongoose = require('mongoose');
const User = require('./src/shared/models/User');

async function seed() {
    try {
        await mongoose.connect('mongodb://localhost:27017/storyStackDb');
        await User.create({ username: 'daryna', password: '12345' });
        console.log('Seed complete');
        await mongoose.disconnect();
    } catch (error) {
        console.error('Seed error:', error);
    }
}

seed();