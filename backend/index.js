require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const authRoutes = require('./src/shared/routes/auth.routes');
const booksRoutes = require('./src/shared/routes/books.routes');
const goalRoutes = require('./src/shared/routes/goal.routes');
const statisticsRoutes = require('./src/shared/routes/statistics.routes');
const folderRoutes = require('./src/shared/routes/folder.routes');
const { connectRedis } = require('./src/shared/services/redis.service');
const logger = require('./src/shared/configuration/logger');


const app = express();
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;
const swaggerSpec = require('./src/shared/configuration/swagger');
const { serve, setup } = require('swagger-ui-express');
const cors = require('cors');
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true,
}));

app.use(morgan(':method :url :status :response-time ms', {
    stream: { write: (message) => logger.info(message.trim()) }
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api-docs', serve, setup(swaggerSpec));

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