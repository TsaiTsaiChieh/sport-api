const express = require('express');
const router = express.Router();
const verification = require('../util/verification');

router.get('/godlists', require('../controller/home/godListsController') );
router.get('/winratelists', require('../controller/home/winRateListsController') );
router.get('/winbetslists', require('../controller/home/winBetsListsController') );

module.exports = router;
