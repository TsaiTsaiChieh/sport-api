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
router.get(
  '/getFavoriteGod/:god_uid',
  verification.token,
  require('../controller/user/getFavoriteGodController')
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

/* 預測頁 */
// 玩家送出預測
router.post(
  '/predictions',
  verification.token_v2,
  require('../controller/user/predictMatchesController')
);
// 看預測比例
router.get(
  '/prediction_rate',
  verification.token_v2,
  require('../controller/user/predictionRateController')
);
/* ------------ 個人預測頁 ------------ */
// 我的預測
router.post(
  '/predict_info',
  verification.token,
  require('../controller/user/predictInfoController')
);
// 我的預測-刪除注單
router.delete(
  '/predictions',
  verification.token_v2,
  require('../controller/user/deletePredictsController')
);
// 預測結果
router.get(
  '/prediction_results',
  verification.token_v2,
  require('../controller/user/predictionResultsController')
);
// 他人主頁
router.get(
  '/others_profile',
  verification.token_v2,
  require('../controller/user/othersProfileController')
);
// 取售牌資訊
router.get(
  '/sell_information',
  verification.token_v2,
  require('../controller/user/getGodSellInformationController')
);
// 大神編輯售牌資訊
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
/* 銀行 */
router.post(
  '/bank',
  verification.token,
  require('../controller/user/bankController')
);
router.put(
  '/bank',
  verification.token,
  require('../controller/user/bankController')
);

router.put(
  '/purse',
  verification.token,
  require('../controller/user/purseController')
);

// router.post(
//   '/convert',
//   verification.token,
//   require('../controller/user/convertController')
// );
router.put(
  '/pay',
  verification.token,
  require('../controller/user/payController')
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
/* 轉換紀錄(新增或更新) */
router.put(
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
/* 最愛玩家(刪除) */
router.delete(
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
router.post(
  '/settle_win_list',
  verification.token,
  require('../controller/user/settleWinListController')
);
router.post(
  '/settle_god_title',
  verification.token,
  require('../controller/user/settleGodTitleController')
);

/* 大神結算 */
router.post(
  '/settle_god_rank',
  verification.token,
  require('../controller/user/settleGodRankController')
);

/* ------------ 個人會員頁 ------------ */
// 使用者資訊
router.get(
  '/profile',
  verification.token_v2,
  require('../controller/user/profileController')
);
module.exports = router;
