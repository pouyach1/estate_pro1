const express = require('express');
const router = express.Router();
const {
  getProperties,
  getProperty,
  getSimilarProperties,
  getFeaturedProperty,
  getAdminProperties,
  getAdminProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  uploadPropertyImage
} = require('../controllers/propertyController');
const { protectAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes — no auth needed
router.get('/featured/home', getFeaturedProperty);
router.get('/:id/similar', getSimilarProperties);
router.get('/', getProperties);
router.get('/:id', getProperty);

// Protected routes — admin only
router.post('/', protectAdmin, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'images', maxCount: 10 }
]), createProperty);
router.put('/:id', protectAdmin, upload.single('image'), updateProperty);
router.delete('/:id', protectAdmin, deleteProperty);
router.post('/:id/image', protectAdmin, upload.single('image'), uploadPropertyImage);

module.exports = router;