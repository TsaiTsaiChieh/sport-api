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
  '/setFavoritePlayer',
  verification.token,
  require('../controller/user/setFavoritePlayerController')
);
router.get(
  '/getFavoritePlayer/:god_uid',
  verification.token,
  require('../controller/user/getFavoritePlayerController')
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
  '/servicedata',
  require('../controller/user/contactService_data')
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
/* ------------ 個人預測頁 ------------ */
// 我的預測
router.post(
  '/predict_info',
  verification.token_v2,
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
  verification.confirmLogin_v2,
  require('../controller/user/predictionResultsController')
);
// 歷史紀錄
router.get(
  '/prediction_history',
  verification.confirmLogin_v2,
  require('../controller/user/predictionHistoryController')
);
// 他人主頁
router.get(
  '/others_profile',
  verification.confirmLogin_v2,
  require('../controller/user/othersProfileController')
);
// 購買預測
router.post(
  '/purchase_predictions',
  verification.token_v2,
  require('../controller/user/purchasePredictionsController')
);
// 他人預測
router.post(
  '/others_predictions',
  require('../controller/user/othersPredictionsController')
);
// 他人預測
router.post(
  '/others_predictions_l',
  verification.token_v2,
  require('../controller/user/othersPredictionsController')
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
  verification.token_v2,
  require('../controller/user/settleMatchesController')
);
router.post(
  '/settle_win_list',
  verification.token_v2,
  require('../controller/user/settleWinListController')
);
router.post(
  '/settle_god_title',
  verification.token_v2,
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
// 顯示 預設聯盟 + 所有聯盟預設稱號 ( 稱號 (鑽金銀銅 Rank) + 預設成就(近幾過幾) )
router.get(
  '/god_league_rank_default_league',
  verification.token_v2,
  require('../controller/user/getGodLeagueRankDefaultLeagueController')
);
// 變更 預設顯示聯盟（稱號 (鑽金銀銅 Rank) + 成就(近幾過幾)）
router.post(
  '/god_league_rank_set_default_league',
  verification.token_v2,
  require('../controller/user/postGodLeagueRankSetDefaultLeagueController')
);
// 顯示 預設、所有聯盟稱號 + 所有聯盟成就 ( 稱號 (鑽金銀銅 Rank) + 所有成就(近幾過幾) )
router.get(
  '/god_league_rank_all_title',
  verification.token_v2,
  require('../controller/user/getGodLeagueRankAllTitleController')
);
// 變更 所有聯盟顯示稱號 + 預設所有顯示成就(近幾過幾)）
router.post(
  '/god_league_rank_set_all_league_title',
  verification.token_v2,
  require('../controller/user/postGodLeagueRankSetAllLeagueTitleController')
);
// 查詢大神稱號
router.get(
  '/god_league_rank',
  verification.token_v2,
  require('../controller/user/getGodLeagueRankController')
);
// 更新大神稱號已閱
router.post(
  '/god_league_rank_receive',
  verification.token_v2,
  require('../controller/user/postGodLeagueRankReceiveController')
);
// 更新大神稱號 回復未閱狀態
router.post(
  '/god_league_rank_receive_back',
  verification.token_v2,
  require('../controller/user/postGodLeagueRankReceiveBackController')
);
module.exports = router;

// 未讀訊息
router.post(
  '/unread',
  verification.token,
  require('../controller/user/unreadController')
);
// 新增未讀訊息
router.put(
  '/unread',
  verification.token,
  require('../controller/user/unreadController')
);
