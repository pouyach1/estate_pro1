const express = require('express');
const router = express.Router();
const { register, login, getProfile, toggleFavorite, getFavorites } = require('../controllers/userController');
const { protectUser } = require('../middleware/userAuth');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protectUser, getProfile);
router.post('/favorite/:propertyId', protectUser, toggleFavorite);
router.get('/favorites', protectUser, getFavorites);

module.exports = router;