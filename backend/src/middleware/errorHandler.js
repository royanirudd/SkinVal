const multer = require('multer');
const logger = require('../utils/logger');

class AppError extends Error {
	constructor(statusCode, message) {
		super(message);
		this.statusCode = statusCode;
		this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
		this.isOperational = true;

		Error.captureStackTrace(this, this.constructor);
	}
}

const errorHandler = (err, req, res, next) => {
	console.error('Error details:', {
		message: err.message,
		stack: err.stack,
		status: err.status || 'error'
	});

	if (err instanceof multer.MulterError) {
		return res.status(400).json({
			success: false,
			message: 'File upload error: ' + err.message
		});
	}

	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error';

	res.status(err.statusCode).json({
		success: false,
		message: err.message,
		status: err.status,
		...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
	});
};

module.exports = {
	AppError,
	errorHandler
};
