const modules = require('../util/modules');
const router = modules.express.Router();
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
module.exports = router;
