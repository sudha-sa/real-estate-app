const express = require('express');
const router = express.Router();
const {
  getProperties, getFeaturedProperties, getPropertyById,
  saveProperty, unsaveProperty, getSavedProperties
} = require('../controllers/propertyController');
const { protect } = require('../middleware/auth');

// Optional auth middleware (adds user context if token present)
const optionalAuth = async (req, res, next) => {
  try {
    const jwt = require('jsonwebtoken');
    const User = require('../models/User');
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    }
    next();
  } catch {
    next();
  }
};

router.get('/featured', optionalAuth, getFeaturedProperties);
router.get('/saved', protect, getSavedProperties);
router.get('/', optionalAuth, getProperties);
router.get('/:id', optionalAuth, getPropertyById);
router.post('/:id/save', protect, saveProperty);
router.delete('/:id/save', protect, unsaveProperty);

module.exports = router;
