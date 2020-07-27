const modules = require('../util/modules');
const router = modules.express.Router();
const verification = require('../util/verification');

router.get(
  '/mpg',
  // verification.token,
  require('../controller/cashflow_api/mpgController')
);
router.post(
  '/mpg',
  verification.token,
  require('../controller/cashflow_api/mpgController')
);

/* 信用卡支付(回覆通知) */
router.post(
  '/ccard_notify',
  require('../controller/cashflow_api/ccardNotifyController')
);

module.exports = router;
