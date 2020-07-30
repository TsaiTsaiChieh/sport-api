const verification = require('../util/verification');
const express = require('express');
const router = express.Router();

router.get('/mission', require('../controller/mission/missionController'));
router.get('/mission_l', verification.token_v2, require('../controller/mission/missionController'));
router.post('/mission_reward_receive', verification.token_v2, require('../controller/mission/missionRewardReceiveController'));

module.exports = router;