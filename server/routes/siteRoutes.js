const express = require('express');
const { getSiteMeta } = require('../controllers/siteController');

const router = express.Router();

router.get('/site', getSiteMeta);

module.exports = router;
