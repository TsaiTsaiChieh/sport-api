const express = require('express');
const router = express.Router();
// const verification = require('../util/verification');

router.get('/acceptLeague', require('../controller/general/acceptLeagueController'));

module.exports = router;
