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
module.exports = router;
