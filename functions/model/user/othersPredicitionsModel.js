/* eslint-disable prefer-const */
const {
  getTitlesPeriod, moment, convertTimezone, convertTimezoneFormat, sliceTeamAndPlayer, groupBy, getTitles
} = require('../../util/modules');
// const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');

async function othersPredictions(args) {
  // "依據 uid 撈取所有聯盟的預測。依據付費狀態有不同呈現項目
  // 1. 購買付費狀態（免費 / 未付費 / 已付費）
  // 2. 今日預測：同「我的預測」
  // 3. 宣傳資訊：大神排行、頭銜、介紹文章、武功祕技
  // 4. 付費資訊：價格、回饋紅利、購買人數"
  // 免費預測：完整預測內容，沒有武功秘笈、介紹文
  // 未付費：有項目 (大小分、讓分) 沒有結果 (大分、客讓)。有引言、沒有秘笈
  // 已付費：完整預測內容。有引言、武功祕技

  // ================================
  // 一般玩家、大神(免費預測牌組) 顯示基本內容相同
  //   聯盟、開賽時間、賽事編號、賽事資訊、主隊、客隊

  // 一般玩家、大神( "免費" 預測牌組) 顯示基本內容相同
  // 聯盟、開賽時間、賽事編號、賽事資訊、主隊資料、客隊資料
  // 下注內容：讓分(主客)和注數、大小(主客)和注數

  // 一般玩家和大神差異部份：
  //   1. 沒有武功秘笈、沒有介紹文
  // 免費 情況下 是不會顯示 武功秘笈、介紹文

  // 大神 "有販售" 預測牌組
  // 顯示基本內容 ：聯盟、開賽時間、賽事編號、賽事資訊、主隊資料、客隊資料
  // 下注內容：讓分(主客)和注數、大小(主客)和注數

  // 1. 未登入：有項目 (大小分、讓分) 沒有結果 (大分、客讓)。有引言、沒有秘笈
  // 2. 已登入
  //   1. 未購牌：同未登入情況
  //   2. 已購牌：完整預測內容。有引言、武功祕技

  // 要區分 未登入、已登入
  const userUid = args.token === undefined ? null : args.token.uid; // 需要判斷 有登入的話，判斷有沒有購牌

  const othersUid = args.othersUid;
  const period = getTitlesPeriod(Date.now()).period;
  // const now = moment(Date.now()).unix(); // * 1000;
  // 昨天
  const begin = convertTimezone(moment().utcOffset(8).format('YYYY-MM-DD'),
    { op: 'subtract', value: 1, unit: 'days' });
  // 明天
  const end = convertTimezone(moment().utcOffset(8).format('YYYY-MM-DD'),
    { op: 'add', value: 1, unit: 'days' }) - 1;

  let predictionsInfoList = []; // 使用者/大神 預測資訊
  let predictionsLeagueInfoList = {}; // 預測資訊 所屬聯盟 相關資訊
  let result = {};

  // 該使用者預測資料，時間以  本期  今日  為主
  // outer join
  //   售牌資訊 user__prediction__descriptions  有可能是一般使用者不能售牌 或 大神未售牌
  //   大神成就 titles  有可能是一般使用者 未有大神成就
  //   賽事盤口 讓分、大小  有可能 讓分 或 大小 其中一個沒有
  //
  // !!! 日期目前先註解掉，正式上線要打開
  //
  const predictionsInfoDocs = await db.sequelize.query(`
        select prediction.*, 
               spread.handicap spread_handicap, spread.home_tw, spread.away_tw,
               totals.handicap totals_handicap, totals.over_tw,
               users.status, users.default_god_league_rank,
               titles.rank_id, titles.default_title,
               titles.continue, titles.predict_rate1, titles.predict_rate2, titles.predict_rate3,
               titles.win_bets_continue, titles.matches_rate1, titles.matches_rate2, titles.matches_continue,
               buys.uid buys_uid, buys.god_uid
          from (
                 select prediction.bets_id, sell, match_scheduled, 
                        prediction.league_id, league.name league,
                        prediction.uid,
                        team_home.alias home_alias, team_home.alias_ch home_alias_ch,
                        team_away.alias away_alias, team_away.alias_ch away_alias_ch,
                        prediction.spread_id, prediction.spread_option, prediction.spread_bets,
                        prediction.totals_id, prediction.totals_option, prediction.totals_bets,
                        prediction_desc.description, prediction_desc.tips
                   from view__leagues league,
                        matches,
                        match__teams team_home,
                        match__teams team_away,
                        user__predictions prediction force index(user__predictions_uid_match_scheduled)
                   left join user__prediction__descriptions prediction_desc
                     on prediction.uid = prediction_desc.uid
                    and prediction.league_id = prediction_desc.league_id
                  where prediction.league_id = league.league_id
                    and prediction.bets_id = matches.bets_id
                    and matches.home_id = team_home.team_id
                    and matches.away_id = team_away.team_id
                    and prediction.uid = :otherUid
                   -- and prediction.match_scheduled between :begin and :end
                   -- and prediction_desc.day = :begin
               ) prediction
         inner join users
            on prediction.uid = users.uid
          left join match__totals totals
            on prediction.totals_id = totals.totals_id
          left join match__spreads spread
            on prediction.spread_id = spread.spread_id
          left join titles
            on prediction.uid = titles.uid
           and prediction.league_id = titles.league_id
          left join user__buys buys
            on prediction.uid = buys.uid
           and prediction.league_id = buys.league_id
         where titles.period = :period
          -- and buys.matches_date = :begin
          -- and buys.uid = :buy_id
      `, {
    replacements: {
      buy_id: userUid,
      otherUid: othersUid,
      begin: begin,
      end: end,
      period: period
    },
    type: db.sequelize.QueryTypes.SELECT
  });

  if (predictionsInfoDocs.length === 0) return { }; // 回傳 空Array

  result = { // 初始化 為了固定 json 位置
    begin: begin,
    end: end
  };

  // 把賽事資料 重包裝格式
  groupBy(predictionsInfoDocs, 'league').forEach(function(data) { // 分聯盟陣列
    let league = '';

    data.forEach(function(ele) { // 取出 聯盟陣列中的賽事
      // 先確定 paidType 情況
      const info_datetime = convertTimezoneFormat(ele.match_scheduled);
      let paidType;

      // 目前開發階段，有可能 大神預測牌組販售，但該牌組內可能混合著其他 free 的情況，所以目前產出資料無法完全正確
      // 理論上正式上線後，大神預測牌組免費或販售後，該牌組內只會只有一種情情況，不會有混合在一起的情況
      const nowPaidType = getPaidType({ sell: ele.sell, uid: userUid, buyId: ele.buys_uid });

      // if (paidType !== undefined && paidType !== nowPaidType) {
      //   throw errs.errsMsg('404', '13610', { custMsg: `大神預測牌組中有當天賽事的販售情況(PaidType)不一致，需要進行確認 目前販售: ${nowPaidType}  原本販售: ${paidType}  賽事id: ${ele.bets_id}  購買牌組id: ${ele.buys_uid}` });
      // }
      paidType = nowPaidType;

      // 開始處理 result
      league = ele.league;

      predictionsInfoList.push(repackage(ele, paidType));

      predictionsLeagueInfoList[info_datetime] = repackageInfo(ele, paidType);

      result[league] = {
        info: predictionsLeagueInfoList,
        predictions: predictionsInfoList
      };
    });

    predictionsInfoList = [];
    predictionsLeagueInfoList = {};
  });

  // // 處理 league info
  // for (const [key, value] of Object.entries(result)) {
  //   // 去除 begin、end
  //   if (key === 'begin' || key === 'end') continue;
  //   result[key] = { info: [] };

  //   value.predictions.forEach(function(ele) {
  //     const info_datetime = convertTimezoneFormat(ele.scheduled);
  //     let paidType;

  //     // 目前開發階段，有可能 大神預測牌組販售，但該牌組內可能混合著其他 free 的情況，所以目前產出資料無法完全正確
  //     // 理論上正式上線後，大神預測牌組免費或販售後，該牌組內只會只有一種情情況，不會有混合在一起的情況
  //     const nowPaidType = getPaidType({ sell: ele.sell, uid: userUid, buyId: ele.buys_uid });

  //     if (paidType !== undefined && paidType !== nowPaidType) {
  //       throw errs.errsMsg('404', '13610', { custMsg: `大神預測牌組中有當天賽事的販售情況(PaidType)不一致，需要進行確認 目前販售: ${nowPaidType}  原本販售: ${paidType}  賽事id: ${ele.bets_id}  購買牌組id: ${ele.buys_uid}` });
  //     }
  //     paidType = nowPaidType;

  //     // unpaid (未付費)  沒有結果 (大分、客讓)。有引言、沒有秘笈
  //     // 免費、已付費 才能看到 下注內容：讓分(主客)和注數、大小(主客)和注數
  //     if (paidType === 'unpaid') {
  //       if (ele.spread_id !== null) {
  //         temp.spread.predict = '';
  //         // temp.spread.bets = '';
  //       }

  //       if (ele.spread_id !== null) {
  //         temp.totals.predict = '';
  //         // temp.totals.bets = '';
  //       }
  //     }
  //     console.log('======ele:', ele);
  //     // 處理 引言(描述)、武功祕技 是否顯示
  //     // free 免費預測：完整預測內容，沒有武功秘笈、介紹文
  //     // paid 需要區分登入、未登入，getPaidType() 已做處理產生 unpaid(未付費)、paid(已付費) 兩種情況
  //     // unpaid(未付費) = 未登入 和 已登入 未購買
  //     // paid(已付費) = 已登入 有購買
  //     result[key].info.push({
  //       [info_datetime]: {
  //         paid_type: paidType,
  //         info: paidType === 'free' ? '' : ele.description, // unpaid (未付費)、paid (已付費) 會出現
  //         tips: paidType === 'paid' ? ele.tips : '', // 只有 已付費才會出現
  //         rank: ele.rank_id,
  //         title: getTitles(ele, ele.default_title)
  //       }
  //     });
  //   });
  // };

  return result;
}

// free / unpaid / paid （免費 / 未付費 / 已付費）
function getPaidType(info) {
  const { sell, uid, buyId } = info;
  switch (sell) {
    case -1:
    case 0:
      return 'free';
    case 1:
      return checkBuyGodPredictions(uid, buyId) ? 'paid' : 'unpaid';
  }
}

function checkBuyGodPredictions(uid, buyId) {
  if (uid === null) return false; // 代表未登入，回傳 未付費
  if (buyId === null) return false; // 代表登入 未購買，回傳 未付費
  return true; // 已付費
}

function repackageInfo(ele, paidType) {
  // 處理 引言(描述)、武功祕技 是否顯示
  // free 免費預測：完整預測內容，沒有武功秘笈、介紹文
  // paid 需要區分登入、未登入，getPaidType() 已做處理產生 unpaid(未付費)、paid(已付費) 兩種情況
  // unpaid(未付費) = 未登入 和 已登入 未購買
  // paid(已付費) = 已登入 有購買
  return {
    paid_type: paidType,
    info: paidType === 'free' ? '' : ele.description, // unpaid (未付費)、paid (已付費) 會出現
    tips: paidType === 'paid' ? ele.tips : '', // 只有 已付費才會出現
    rank: ele.rank_id,
    title: getTitles(ele, ele.default_title)
  };
}

function repackage(ele, paidType) {
  const data = {
    bets_id: ele.bets_id,
    scheduled: ele.match_scheduled, // 開賽時間
    league: ele.league,
    home: {
      team_name: ele.home_alias,
      alias: sliceTeamAndPlayer(ele.home_alias).team,
      alias_ch: sliceTeamAndPlayer(ele.home_alias_ch).team,
      player_name: sliceTeamAndPlayer(ele.home_alias).player_name
    },
    away: {
      team_name: ele.away_alias,
      alias: sliceTeamAndPlayer(ele.away_alias).team,
      alias_ch: sliceTeamAndPlayer(ele.away_alias_ch).team,
      player_name: sliceTeamAndPlayer(ele.away_alias).player_name
    },
    spread: {},
    totals: {}
  };

  // unpaid (未付費)  沒有結果 (大分、客讓)。有引言、沒有秘笈
  // 免費、已付費 才能看到 下注內容：讓分(主客)和注數、大小(主客)和注數
  if (!(ele.spread_id == null)) { // 有讓分資料
    data.spread = {
      predict: (paidType === 'unpaid') ? '' : ele.spread_option,
      spread_id: ele.spread_id,
      handicap: ele.spread_handicap,
      handicap_home_tw: ele.home_tw ? ele.home_tw : '',
      handicap_away_tw: ele.away_tw ? ele.away_tw : '',
      percentage: 0, // Math.floor(Math.random() * 50), // 目前先使用隨機數，將來有決定怎麼產生資料時，再處理
      bets: ele.spread_bets
    };
  }

  // unpaid (未付費)  沒有結果 (大分、客讓)。有引言、沒有秘笈
  // 免費、已付費 才能看到 下注內容：讓分(主客)和注數、大小(主客)和注數
  if (!(ele.totals_id == null)) { // 有大小資料
    data.totals = {
      predict: (paidType === 'unpaid') ? '' : ele.totals_option,
      totals_id: ele.totals_id,
      handicap: ele.over_tw, // ele.totals_handicap,
      percentage: 0, // Math.floor(Math.random() * 50), // 目前先使用隨機數，將來有決定怎麼產生資料時，再處理
      bets: ele.totals_bets
    };
  }

  return data;
}

module.exports = othersPredictions;
