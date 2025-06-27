require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const authRoutes = require('./src/shared/routes/auth.routes');


const app = express();
const PORT = process.env.PORT;
const MONGO_URI =  process.env.MONGO_URI;
const swaggerSpec = require('./src/shared/configs/swagger');
const { serve, setup } = require('swagger-ui-express');
app.use(express.json());
app.use(cookieParser());


app.use('/api/auth', authRoutes);
app.use('/api-docs', serve, setup(swaggerSpec));

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