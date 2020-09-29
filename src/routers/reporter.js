// const verification = require('../util/verification');
const express = require('express');
const router = express.Router();

router.post('/ingot', require('../controller/reporter/IngotController'));
router.post('/coin', require('../controller/reporter/CoinController'));
router.post('/dividend', require('../controller/reporter/DividendController'));

module.exports = router;
