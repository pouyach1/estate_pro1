const express = require('express');
const router = express.Router();
const { login, register, getProfile, updateProfile, getDashboardStats } = require('../controllers/adminController');
const { protectAdmin } = require('../middleware/auth');

// Public
router.post('/login', login);

// Protected
router.post('/register', protectAdmin, register);
router.get('/profile', protectAdmin, getProfile);
router.put('/profile', protectAdmin, updateProfile);
router.get('/dashboard', protectAdmin, getDashboardStats);

module.exports = router;