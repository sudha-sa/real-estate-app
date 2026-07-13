const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const visitRoutes = require('./routes/visitRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Real Estate API is running', timestamp: new Date().toISOString() });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const { MongoMemoryServer } = require('mongodb-memory-server');
const seedDatabase = require('./seed/seedData');

// Connect to MongoDB
const startServer = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;
    let isMemoryDb = false;

    if (!mongoUri || mongoUri.includes('cluster0.mongodb.net') || process.env.USE_MEMORY_DB === 'true') {
      console.log('ℹ️  Starting in-memory MongoDB server...');
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      isMemoryDb = true;
      console.log('✅ In-memory MongoDB server started');
    }

    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB Connected');

    if (isMemoryDb) {
      console.log('🌱 Seeding in-memory database...');
      await seedDatabase(mongoUri);
    }

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 API Base URL: http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error('❌ Server startup error:', err.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
