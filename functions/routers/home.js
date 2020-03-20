const express = require('express');
const router = express.Router();
const verification = require('../util/verification');

router.get('/god_lists', require('../controller/home/godListsController') );
router.get('/win_rate_lists', require('../controller/home/winRateListsController') );
router.get('/win_bets_lists', require('../controller/home/winBetsListsController') );

module.exports = router;
