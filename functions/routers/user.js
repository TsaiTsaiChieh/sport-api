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
  '/reportTopic',
  verification.token,
  require('../controller/user/reportTopicController')
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
  '/predictions',
  verification.token_v2,
  require('../controller/user/predictMatchesController')
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
router.delete(
  '/predictions',
  verification.token_v2,
  require('../controller/user/deletePredictsController')
);
// 大神售牌資訊
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
/* 錢包 */
router.post(
  '/purse',
  verification.token,
  require('../controller/user/purseController')
);

router.put(
  '/purse',
  verification.token,
  require('../controller/user/purseController')
);
/* 購牌紀錄 */
router.post(
  '/buy',
  verification.token,
  require('../controller/user/buyController')
);
/* 轉換紀錄 */
router.post(
  '/transfer',
  verification.token,
  require('../controller/user/transferController')
);
/* 榮譽戰績 */
router.post(
  '/honor',
  verification.token,
  require('../controller/user/honorController')
);
/* 消息通知(讀取) */
router.post(
  '/news',
  verification.token,
  require('../controller/user/newsController')
);
/* 消息通知(更新或新增) */
router.put(
  '/news',
  verification.token,
  require('../controller/user/newsController')
);
/* 消息通知(刪除) */
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

/* 大神結算 */
router.post(
  '/settle_god_list',
  verification.token,
  require('../controller/user/settleGodListController')
);

module.exports = router;
