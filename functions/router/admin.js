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
  require('../controller/admin/givePointsController.js')
);
module.exports = router;
