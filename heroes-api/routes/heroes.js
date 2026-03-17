const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/heroController');

router.get('/', ctrl.getAll);
router.post('/', ctrl.create);
router.get('/:id/incidents', ctrl.getIncidents);

module.exports = router;