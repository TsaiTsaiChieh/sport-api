const express = require('express');
const router = express.Router();
const verification = require('../util/verification');

router.get('/getRanks/', require('../controller/user/getRanks'));

router.post(
  '/getUserProfile',
  verification.token,
  require('../controller/user/getUserProfile')
);

router.post(
  '/modifyUserProfile',
  verification.token,
  require('../controller/user/modifyUserProfile')
);
router.post('/checkUnique/', require('../controller/user/checkUnique'));
router.post(
  '/accuse/',
  verification.token,
  require('../controller/user/accuseUser')
);
router.get(
  '/getTitlesAndSignature/:uid',
  require('../controller/user/getTitlesAndSignatureController')
);
router.get('/getClaim/:uid', require('../controller/user/getClaimController'));

// 預測頁
router.post(
  '/predict_matches',
  verification.token,
  require('../controller/user/predictMatchesController')
);
router.post(
  '/predict_matches_v2',
  verification.token,
  require('../controller/user/_predictMatchesController')
);
router.post(
  '/predict_info',
  verification.token,
  require('../controller/user/predictInfoController')
);

module.exports = router;
