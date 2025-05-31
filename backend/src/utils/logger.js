const winston = require('winston');
const path = require('path');

const logFormat = winston.format.combine(
	winston.format.timestamp(),
	winston.format.printf(({ timestamp, level, message }) => {
		return `${timestamp} [${level.toUpperCase()}]: ${message}`;
	})
);

const logger = winston.createLogger({
	format: logFormat,
	transports: [
		new winston.transports.Console(),
		new winston.transports.File({
			filename: path.join('logs', 'error.log'),
			level: 'error'
		}),
		new winston.transports.File({
			filename: path.join('logs', 'combined.log')
		})
	]
});

module.exports = logger;
