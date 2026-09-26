const express = require('express');

const {
    getDashboard
} = require('../controllers/dashboardController');

const router = express.Router();

router.get('/:user_id', getDashboard);

module.exports = router;