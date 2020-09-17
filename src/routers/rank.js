const express = require('express');
const router = express.Router();

router.get('/search_user/:display_name', require('../controller/rank/searchUserController'));
router.get('/search_user_detail/:uid', require('../controller/rank/searchUserDetailController'));
router.get('/default_league', require('../controller/rank/defaultLeagueController'));
router.get('/god_lists', require('../controller/rank/godListsController'));
router.get('/god_lists_leagues', require('../controller/rank/godListsLeaguesController'));
router.get('/win_lists', require('../controller/rank/winListsController'));

module.exports = router;
