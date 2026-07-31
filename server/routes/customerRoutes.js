const express = require('express');
const router = express.Router();
const { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer } = require('../controllers/customerController');
const { protectAdmin } = require('../middleware/auth');

// Public — anyone can submit contact form
router.post('/', createCustomer);

// Protected — admin only
router.get('/', protectAdmin, getCustomers);
router.get('/:id', protectAdmin, getCustomer);
router.put('/:id', protectAdmin, updateCustomer);
router.delete('/:id', protectAdmin, deleteCustomer);

module.exports = router;