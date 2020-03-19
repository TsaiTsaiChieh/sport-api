const modules = require('../util/modules');
const verification = require('../util/verification');
const router = modules.express.Router();
router.get(
  '/livescore/scheduled',
  require('../controller/livescore/scheduledController')
);
router.get(
  '/livescore/inprogress',
  require('../controller/livescore/inprogressController')
);
router.get(
  '/livescore/closed',
  require('../controller/livescore/closedController')
);

module.exports = router;
