const express = require('express');
const router = express.Router();
const verification = require('../util/verification');

router.get('/godlists', require('../controller/home/godListsController') );
router.get('/winratelists', require('../controller/home/winrateListsController') );
router.get('/profitlists', require('../controller/home/profitListsController') );
router.get('/hotTopics', require('../controller/home/hotTopicsController') );

module.exports = router;
