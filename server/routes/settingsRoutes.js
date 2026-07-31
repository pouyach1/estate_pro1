const express = require('express');
const router = express.Router();
const { getSettings, updateSettings, uploadBackground } = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public — site needs to read settings
router.get('/', getSettings);

// Protected
router.put('/', protect, updateSettings);
router.post('/background', protect, upload.single('image'), uploadBackground);

module.exports = router;