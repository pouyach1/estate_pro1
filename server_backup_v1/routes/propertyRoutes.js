const express = require('express');
const router = express.Router();
const {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  uploadPropertyImage
} = require('../controllers/propertyController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes — no auth needed
router.get('/', getProperties);
router.get('/:id', getProperty);

// Protected routes — admin only
router.post('/', protect, upload.array('images', 10), createProperty);
router.put('/:id', protect, upload.single('image'), updateProperty);
router.delete('/:id', protect, deleteProperty);
router.post('/:id/image', protect, upload.single('image'), uploadPropertyImage);

module.exports = router;