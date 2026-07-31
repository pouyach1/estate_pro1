const express = require('express');
const router = express.Router();
const { login, register, getProfile, updateProfile, getDashboardStats } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');

// Public
router.post('/login', login);

// Protected
router.post('/register', protect, register);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/dashboard', protect, getDashboardStats);

module.exports = router;