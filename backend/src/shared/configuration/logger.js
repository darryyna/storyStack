const winston = require('winston');

const { combine, timestamp, printf, colorize, align } = winston.format;

const logger = winston.createLogger({
    level: 'info',
    format: combine(
        colorize({ all: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        align(),
        printf(({ timestamp, level, message }) => `[${timestamp}] ${level}: ${message}`)
    ),
    transports: [
        new winston.transports.Console()
    ]
});

module.exports = logger;
