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
router.post(
  '/favoriteGod',
  verification.token,
  require('../controller/user/favoriteGodController')
);
router.post(
  '/contactService',
  verification.getToken,
  require('../controller/user/contactServiceController')
);
router.get( // 後台完成後移至後台
  '/servicedata',
  require('../controller/user/contactService_data')
);
router.get(
  '/getTitlesAndSignature/:uid',
  require('../controller/user/getTitlesAndSignatureController')
);
router.get('/getClaim/:uid', require('../controller/user/getClaimController'));

// 預測頁
router.post(
  '/predictions',
  verification.token_v2,
  require('../Deprecated/predictMatchesController')
);
router.get(
  '/prediction_rate',
  verification.token_v2,
  require('../controller/user/predictionRateController')
);
router.get(
  '/sell_information',
  verification.token_v2,
  require('../controller/user/getGodSellInformationController')
);
router.post(
  '/sell_information',
  verification.token_v2,
  require('../controller/user/postGodSellInformationController')
);
router.post(
  '/predict_info',
  verification.token,
  require('../controller/user/predictInfoController')
);
/* 錢包 */
router.post(
  '/purse/:uid',
  verification.token,
  require('../controller/user/purseController')
);
/* 購牌紀錄 */
router.post(
  '/buy/:uid',
  verification.token,
  require('../controller/user/buyController')
);
/* 轉換紀錄 */
router.post(
  '/transfer/:uid',
  verification.token,
  require('../controller/user/transferController')
);
/* 榮譽戰績 */
router.post(
  '/honor/:uid',
  verification.token,
  require('../controller/user/honorController')
);

// 結算
router.post(
  '/settle_matches',
  verification.token,
  require('../controller/user/settleMatchesController')
);

module.exports = router;
