const modules = require('../util/modules');
const verification = require('../util/verification');
const router = modules.express.Router();

router.get(
  '/test',
  verification.token,
  verification.admin,
  function(req, res) {
    res.json({});
  }
);
router.get(
  '/getAdminProfile',
  verification.token,
  verification.admin,
  require('../controller/admin/getAdminProfileController')
);
router.get(
  '/home/getHomeBanner',
  verification.token,
  verification.admin,
  require('../controller/admin/home/getHomeBannerController')
);
router.post(
  '/home/setHomeBanner',
  verification.token,
  verification.admin,
  require('../controller/admin/home/setHomeBannerController')
);
router.post(
  '/home/newHomeBanner',
  verification.token,
  verification.admin,
  require('../controller/admin/home/newHomeBannerController')
);
router.post(
  '/home/delHomeBanner',
  verification.token,
  verification.admin,
  require('../controller/admin/home/delHomeBannerController')
);
router.post(
  '/home/updateHomeBanner',
  verification.token,
  verification.admin,
  require('../controller/admin/home/updateHomeBannerController')
);

/// 以下為原本的
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

// can comment out verification.admin, if auth is not allowed
router.post(
  '/setClaim',
  verification.token,
  verification.admin,
  require('../controller/admin/setClaimController')
);

module.exports = router;
