const express = require('express');
const router = express.Router();

router.get('/period', require('../test/testPeriod'));
// 賽事

module.exports = router;
