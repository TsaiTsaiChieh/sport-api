const express = require('express');
const router = express.Router();
const verification = require('../util/verification');

/* ------------ 預測賽事 ------------ */
router.get('/', require('../controller/sport/getSports'));
// 賽事
router.get(
  '/matches',
  verification.confirmLogin_v2,
  require('../controller/sport/matchesController')
);
// 預測比例
router.get(
  '/prediction_rate',
  require('../controller/sport/predictionRateController')
);
module.exports = router;
