const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT;
const MONGO_URI =  process.env.URI;

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB підключено');

        // Запуск сервера після підключення до бази
        app.listen(PORT, () => {
            console.log(`Сервер запущено на порті ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Помилка підключення до MongoDB', err);
    });