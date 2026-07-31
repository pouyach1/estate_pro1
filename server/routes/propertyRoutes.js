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
const { protectAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes — no auth needed
router.get('/', getProperties);
router.get('/:id', getProperty);

// Protected routes — admin only
router.post('/', protectAdmin, upload.array('images', 10), createProperty);
router.put('/:id', protectAdmin, upload.single('image'), updateProperty);
router.delete('/:id', protectAdmin, deleteProperty);
router.post('/:id/image', protectAdmin, upload.single('image'), uploadPropertyImage);

module.exports = router;