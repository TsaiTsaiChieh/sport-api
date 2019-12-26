const modules = require('../util/modules');
const verification = require('../util/verification');
const router = modules.express.Router();

router.post(
  '/muted',
  verification.token,
  verification.admin,
  require('../controller/admin/mutedController')
);
router.post(
  '/givePoints',
  verification.token,
  verification.admin,
  require('../controller/admin/givePointsController')
);
router.post(
  '/giveTitle',
  verification.token,
  verification.admin,
  require('../controller/admin/giveTitleController')
);
router.delete(
  '/deleteTitle',
  verification.token,
  verification.admin,
  require('../controller/admin/deleteTitleController')
);
router.post(
  '/setClaims',
  verification.token,
  require('../controller/admin/setClaimsController')
);

module.exports = router;
