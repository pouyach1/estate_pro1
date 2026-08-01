const express = require('express');
const router = express.Router();
const { getSettings, updateSettings, uploadBackground } = require('../controllers/settingsController');
const { protectAdmin, requireOwner } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public — site needs to read settings
router.get('/', getSettings);

// Protected
router.put('/', protectAdmin, requireOwner, updateSettings);
router.post('/background', protectAdmin, requireOwner, upload.single('image'), uploadBackground);

module.exports = router;