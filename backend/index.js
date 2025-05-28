const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT;
const MONGO_URI =  process.env.URI;

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('DB connected');

        app.listen(PORT, () => {
            console.log(`Server connected on ${PORT}`);
        });
    })
    .catch(err => {
        console.error('DB error', err);
    });