const express = require('express');
const router = express.Router();
const { getAgents, getAgent, createAgent, updateAgent, deleteAgent } = require('../controllers/agentController');
const { protectAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getAgents);
router.get('/:id', getAgent);
router.post('/', protectAdmin, upload.single('photo'), createAgent);
router.put('/:id', protectAdmin, upload.single('photo'), updateAgent);
router.delete('/:id', protectAdmin, deleteAgent);

module.exports = router;