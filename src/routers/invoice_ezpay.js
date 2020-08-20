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

/* 使用者 新增/更新 發票載具 */
router.post(
  '/carrier',
  verification.token,
  require('../controller/invoice_ezpay/carrierController')
);

module.exports = router;
