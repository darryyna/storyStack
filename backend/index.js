require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./src/app');
const { connectRedis } = require('./src/shared/services/redis.service');
const logger = require('./src/shared/configuration/logger');

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        logger.info('DB connected');

        await connectRedis();
        app.listen(PORT, () => {
            logger.info(`Server connected on port ${PORT}`);
        });
    })
    .catch(err => {
        logger.error(`DB error: ${err.message}`);
    });