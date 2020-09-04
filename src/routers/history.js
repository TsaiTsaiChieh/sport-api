const express = require('express');
const router = express.Router();
// const verification = require('../util/verification');

router.get('/teams', require('../controller/history/teamController'));

router.get(
  '/teamhandicap',
  require('../controller/history/teamHandicapController')
);

router.get('/teamevent', require('../controller/history/teamEventController'));

router.get(
  '/eventscheduled',
  require('../controller/history/eventScheduledController')
);

router.get('/fivefight', require('../controller/history/fiveFightController'));

router.get(
  '/getseasondate',
  require('../controller/history/getSeasonDateController')
);

router.get(
  '/seasonrecord',
  require('../controller/history/seasonRecordController')
);

router.get(
  '/seasonhandicap',
  require('../controller/history/seasonHandicapController')
);

// 進階資料
router.get(
  '/probable_pitcher',
  require('../controller/history/probablePitcherController')
);

router.get(
  '/probable_pitcher_past_game',
  require('../controller/history/probablePitcherPastGameController')
);

router.get(
  '/team_batting_information',
  require('../controller/history/teamBattingInformationController')
);

module.exports = router;
