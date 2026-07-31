const express = require('express');
const router = express.Router();
const { register, login, getProfile, toggleFavorite, getFavorites } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.post('/favorite/:propertyId', protect, toggleFavorite);
router.get('/favorites', protect, getFavorites);

module.exports = router;