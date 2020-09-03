const verification = require('../util/verification');
const express = require('express');
const router = express.Router();

router.get(
  '/',
  function(req, res) {
    res.json({});
  }
);
router.get(
  '/getAdminProfile',
  verification.admin,
  require('../controller/admin/getAdminProfileController')
);
router.get(
  '/home/getHomeBanner',
  verification.admin,
  require('../controller/admin/home/getHomeBannerController')
);
router.post(
  '/home/setHomeBanner',
  verification.admin,
  verification.adminlog, // 加了這個會把request的內容等等的東西log
  require('../controller/admin/home/setHomeBannerController')
);
router.post(
  '/home/newHomeBanner',
  verification.admin,
  verification.adminlog,
  require('../controller/admin/home/newHomeBannerController')
);
router.post(
  '/home/delHomeBanner',
  verification.admin,
  verification.adminlog,
  require('../controller/admin/home/delHomeBannerController')
);
router.post(
  '/home/updateHomeBanner',
  verification.admin,
  verification.adminlog,
  require('../controller/admin/home/updateHomeBannerController')
);
router.post(
  '/topics/setViewCount',
  verification.admin,
  verification.adminlog,
  require('../controller/admin/topics/setViewCountController')
);
router.post(
  '/user/getUsers',
  verification.admin,
  require('../controller/admin/user/getUsersController')
);
router.post(
  '/user/editUser',
  verification.admin,
  verification.adminlog,
  require('../controller/admin/user/editUserController')
);
router.post(
  '/user/getUserBlockLog',
  verification.admin,
  require('../controller/admin/user/getUserBlockLogController')
);
router.post(
  '/user/unblockUser',
  verification.admin,
  verification.adminlog,
  require('../controller/admin/user/unblockUserController')
);
router.get(
  '/user/getNews',
  verification.admin,
  require('../controller/admin/user/getNewsController')
);
router.post(
  '/user/editNews',
  verification.admin,
  verification.adminlog,
  require('../controller/admin/user/editNewsController')
);
router.post(
  '/service/getReports',
  verification.token,
  verification.admin,
  require('../controller/admin/service/getReportsController')
);
router.post(
  '/service/deal',
  verification.admin,
  verification.adminlog,
  require('../controller/admin/service/dealController')
);
router.post(
  '/payment/getTransList',
  verification.admin,
  require('../controller/admin/payment/getTransListController')
);
router.post(
  '/payment/setTransResult',
  verification.admin,
  verification.adminlog,
  require('../controller/admin/payment/setTransResultController')
);
router.post(
  '/manager/getLogs',
  verification.admin,
  require('../controller/admin/manager/getLogsController')
);

/// 以下為原本的
router.post(
  '/muted',
  verification.admin,
  require('../controller/admin/mutedController')
);
router.post(
  '/givePoints',
  verification.admin,
  require('../controller/admin/givePointsController')
);

// can comment out verification.admin, if auth is not allowed
router.post(
  '/setClaim',
  verification.admin,
  require('../controller/admin/setClaimController')
);

router.post(
  '/redisdel',
  verification.admin,
  require('../controller/admin/redisDelController')
);

module.exports = router;