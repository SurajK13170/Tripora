
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const db = require('./db');
const emailService = require('./services/emailService');

// Import routes
const authRoutes = require('./routes/auth.routes');
const placesRoutes = require('./routes/places.routes');
const userRoutes = require('./routes/user.routes');

// Import middleware
const { globalErrorHandler } = require('./middleware/errorHandler');

const PORT = process.env.PORT || 5000;

const app = express();

app.use(helmet());

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://yourdomain.com' 
    : ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Health Check Route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/places', placesRoutes);
app.use('/api/users', userRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler Middleware (must be last)
app.use(globalErrorHandler);

// Initialize Server
const initializeServer = async () => {
  try {
    // Test database connection
    const dbConnected = await db.testConnection();
    
    if (!dbConnected) {
      console.error('Failed to connect to database. Please check your database configuration.');
      process.exit(1);
    }

    // Test email service connection
    console.log('');
    const emailConnected = await emailService.verifyConnection();
    console.log('');
    
    if (!emailConnected) {
      console.warn('⚠️  Email service is not configured. OTP emails will not be sent.');
      console.warn('   Continue to debug email configuration when needed.');
      console.log('');
    }

    // Start Express Server
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
      console.log(`API URL: http://localhost:${PORT}`);
      console.log(`📚 API Docs: Check README.md for endpoint documentation`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error('Unhandled Rejection:', err);
      server.close(() => process.exit(1));
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err);
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Server initialization failed:', error);
    process.exit(1);
  }
};

// Start the server
initializeServer();

module.exports = app;
