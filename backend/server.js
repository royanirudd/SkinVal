require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const logger = require('./src/utils/logger');
const { errorHandler } = require('./src/middleware/errorHandler');
const apiRoutes = require('./src/routes');
const tf = require('@tensorflow/tfjs-node');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Configure TensorFlow
tf.engine().startScope();
tf.setBackend('tensorflow');
tf.enableProdMode();

// Configure memory management
tf.ENV.set('WEBGL_DELETE_TEXTURE_THRESHOLD', 0);
tf.ENV.set('WEBGL_FORCE_F16_TEXTURES', false);

// Serve static files
app.use(express.static(path.join(__dirname, 'public'), {
	setHeaders: (res, path) => {
		if (path.endsWith('.js')) {
			res.setHeader('Content-Type', 'application/javascript');
		}
	}
}));

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	if (req.url.endsWith('.js')) {
		res.setHeader('Content-Type', 'application/javascript');
	}
	next();
});

// Health check route
app.get('/api/health', (req, res) => {
	logger.info('Health check endpoint hit');
	res.status(200).json({ status: 'OK', timestamp: new Date() });
});

app.use('/api', apiRoutes);

// Error handling middleware
app.use(errorHandler);

// Handle 404
app.use('*', (req, res) => {
	res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
	logger.info(`Server is running on port ${PORT}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
	logger.error('Uncaught Exception:', error);
	process.exit(1);
});

// Handle unhandled rejections
process.on('unhandledRejection', (error) => {
	logger.error('Unhandled Rejection:', error);
	process.exit(1);
});

module.exports = app;
