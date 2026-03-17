const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/statController');

// obsluguje get /api/v1/stats
router.get('/', ctrl.getStats);

module.exports = router;