const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const cors = require('cors');
const authRoutes = require('./shared/routes/auth.routes');
const booksRoutes = require('./shared/routes/books.routes');
const goalRoutes = require('./shared/routes/goal.routes');
const statisticsRoutes = require('./shared/routes/statistics.routes');
const folderRoutes = require('./shared/routes/folder.routes');
const logger = require('./shared/configuration/logger');
const swaggerSpec = require('./shared/configuration/swagger');
const { serve, setup } = require('swagger-ui-express');
const { errorHandler } = require('./shared/middlewares/errorHandler.middleware');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true,
}));

app.use(morgan(':method :url :status :response-time ms', {
    stream: { write: (message) => logger.info(message.trim()) }
}));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api-docs', serve, setup(swaggerSpec));

app.use(errorHandler);

module.exports = app;
