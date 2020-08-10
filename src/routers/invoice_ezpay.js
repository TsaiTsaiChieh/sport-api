const express = require('express');
const verification = require('../util/verification');
const router = express.Router();
/* MPG 付款頁面 */
router.get(
  '/mpg',
  //   verification.token,
  require('../controller/invoice_ezpay/mpgController')
);
router.post(
  '/mpg',
  verification.token,
  require('../controller/invoice_ezpay/mpgController')
);

/* MPG 付款成功通知頁面 */
// router.get(
//   '/mpg_notify',
//   require('../controller/cashflow_neweb/mpgNotifyController')
// );
// router.post(
//   '/mpg_notify',
//   require('../controller/cashflow_neweb/mpgNotifyController')
// );
module.exports = router;
