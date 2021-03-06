const verification = require('../util/verification');
const express = require('express');
const router = express.Router();
/* ------------ 即時比分頁 ------------ */
router.get('/all', require('../controller/livescore/allController'));
router.get(
  '/scheduled',
  require('../controller/livescore/scheduledController')
);
router.get(
  '/inprogress',
  require('../controller/livescore/inprogressController')
);
router.get('/closed', require('../controller/livescore/closedController'));
router.get(
  '/detail/prematch',
  require('../controller/livescore/detailPrematchController')
);
router.get(
  '/detail/pbp',
  require('../controller/livescore/detailPBPController')
);
router.get(
  '/getCollect',
  verification.token_v2,
  require('../controller/livescore/getCollectController')
);
router.post(
  '/postCollect',
  verification.token_v2,
  require('../controller/livescore/postCollectController')
);
router.post(
  '/deleteCollect',
  verification.token_v2,
  require('../controller/livescore/deleteCollectController')
);
// 我的預測
router.get(
  '/my_predictions',
  verification.token_v2,
  require('../controller/livescore/myPredictionsController')
);
// 棒球賽前數據
router.get('/prematch_baseball',
  require('../controller/livescore/prematchBaseballController'));

// 籃球賽前數據
router.get('/prematch_basketball',
  require('../controller/livescore/prematchBasketballController'));
module.exports = router;
