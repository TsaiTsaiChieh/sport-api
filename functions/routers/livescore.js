const modules = require('../util/modules');
// const verification = require('../util/verification');
const router = modules.express.Router();
const verification = require('../util/verification');

router.get('/livescore/all', require('../controller/livescore/allController'));
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
router.get(
  '/livescore/detail/prematch',
  require('../controller/livescore/detailPrematchController')
);
router.get(
  '/livescore/detail/pbp',
  require('../controller/livescore/detailPBPController')
);
router.get(
  '/livescore/getCollect',
  verification.token_v2,
  require('../controller/livescore/getCollectController')
);
router.post(
  '/livescore/postCollect',
  verification.token_v2,
  require('../controller/livescore/postCollectController')
);
router.post(
  '/livescore/deleteCollect',
  verification.token_v2,
  require('../controller/livescore/deleteCollectController')
);
module.exports = router;
