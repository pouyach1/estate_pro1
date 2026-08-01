const express = require('express');
const router = express.Router();
const { login, register, getProfile, updateProfile, getDashboardStats } = require('../controllers/adminController');
const { protectAdmin, requireOwner } = require('../middleware/auth');

// Public
router.post('/login', login);

// Protected
router.post('/register', protectAdmin, requireOwner, register);
router.get('/profile', protectAdmin, getProfile);
router.put('/profile', protectAdmin, updateProfile);
router.get('/dashboard', protectAdmin, requireOwner, getDashboardStats);

module.exports = router;