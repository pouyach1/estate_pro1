const express = require('express');
const router = express.Router();
const { getAgents, getAgent, createAgent, updateAgent, deleteAgent } = require('../controllers/agentController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getAgents);
router.get('/:id', getAgent);
router.post('/', protect, upload.single('photo'), createAgent);
router.put('/:id', protect, upload.single('photo'), updateAgent);
router.delete('/:id', protect, deleteAgent);

module.exports = router;