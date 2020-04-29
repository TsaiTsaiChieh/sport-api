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
  '/predictions',
  verification.token_v2,
  require('../controller/user/_predictMatchesController')
);
router.get(
  '/prediction_rate',
  verification.token_v2,
  require('../controller/user/predictionRateController')
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
/* 消息通知 */
router.post(
  '/news',
  verification.token,
  require('../controller/user/newsController')
);
router.delete(
  '/news',
  verification.token,
  require('../controller/user/newsController')
);
/* 最愛玩家 */
router.post(
  '/favorite_player',
  verification.token,
  require('../controller/user/favoritePlayerController')
);

// 結算
router.post(
  '/settle_matches',
  verification.token,
  require('../controller/user/settleMatchesController')
);

module.exports = router;
