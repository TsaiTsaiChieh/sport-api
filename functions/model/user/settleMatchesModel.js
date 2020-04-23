const modules = require('../../util/modules');
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');

function settleMatches (args) {

  return new Promise(async function (resolve, reject) {
    // 1. 管理者才能進行 API 呼叫
    // 2. 該場賽事結算
    // 3. 該場賽事-使用者有下預測單結算

    const userUid = args.token.uid;
    const bets_id = args.bets_id;

    // 1.  
    try{
      const memberInfo = await db.User.findOne({ where: { uid: userUid } });

      if(memberInfo === null) {
        // console.error('Error 1. in user/predictonInfoModell by YuHsien');
        return reject(errs.errsMsg('404', '1301')); // ${userUid}
      }

// !!!! 記得改成 9 
      if (!([1,2].includes(memberInfo.status))) { // 不是 管理者
        // console.error('Error 1. in user/predictonInfoModell by YuHsien');
        return reject(errs.errsMsg('404', '1308'));
      }

      // 改用 modules.userStatusCodebook 這支程式建議 要寫死，不要有 Default 值，因為一般使用者也有一堆權限
      console.log("memberInfo status of statusSwitch: %o", modules.userStatusCodebook(memberInfo.status));
    } catch (err) {
      console.error('Error 1. in user/settleMatchesModel by YuHsien', err);
      return reject(errs.errsMsg('500', '500', err));
    }


    // 2.
    try {
      const matchInfo = await db.sequelize.query(`
        select *
          from matches
         where bets_id = :bets_id
      `, { 
        replacements:{
          bets_id: bets_id
        },
        type: db.sequelize.QueryTypes.SELECT 
      });
console.log(matchInfo)

    } catch (err) {
      console.error('Error 2. in user/settleMatchesModel by YuHsien', err);
      return reject(errs.errsMsg('500', '500', err));
    }


    // 3.
    try {

    } catch (err) {
      console.error('Error 3. in user/settleMatchesModel by YuHsien', err);
      return reject(errs.errsMsg('500', '500', err));
    }

    let predictionsInfoList = []; // 使用者預測資訊
    let response = {};

    // 2.
    try {
      const now_YYYYMMDD = modules.moment().utcOffset(8).format('YYYYMMDD'); // 今天 年月日
      //const tomorrow_YYYYMMDD = modules.moment().add(1, 'days').utcOffset(8).format('YYYYMMDD'); // 今天 年月日
      const now = modules.moment(now_YYYYMMDD).unix(); // * 1000;
      // const tomorrow = modules.moment(now_YYYYMMDD).add(2, 'days').unix() * 1000;

      // 使用者預測資訊
      // 賽前 (scheduled 開賽時間 > api呼叫時間)
      // 注意 percentage 目前先使用隨機數，將來有決定怎麼產生資料時，再處理
      
      // prediction 後面可以加上 force index(user__predictions_uid_match_scheduled) 確保 match_scheduled 有使用 index 
      const predictionsInfoDocs = await db.sequelize.query(`
        select prediction.*, 
               spread.handicap spread_handicap,
               totals.handicap totals_handicap
          from (
                 select prediction.bets_id, match_scheduled, league.name league,
                        team_home.alias home_alias, team_home.alias_ch home_alias_ch,
                        team_away.alias away_alias, team_away.alias_ch away_alias_ch,
                        prediction.spread_id, prediction.spread_option, prediction.spread_bets,
                        prediction.totals_id, prediction.totals_option, prediction.totals_bets
                   from user__predictions prediction force index(user__predictions_uid_match_scheduled),
                        match__leagues league,
                        matches,
                        match__teams team_home,
                        match__teams team_away
                  where prediction.league_id = league.league_id
                    and prediction.bets_id = matches.bets_id
                    and matches.home_id = team_home.team_id
                    and matches.away_id = team_away.team_id
                    and prediction.uid = :uid
                    and prediction.match_scheduled > :now
               ) prediction
          left join match__spreads spread
            on prediction.spread_id = spread.spread_id
          left join match__totals totals
            on prediction.totals_id = totals.totals_id
      `, { 
        replacements:{
          uid: userUid,
          now: now
        },
        limit: 30, 
        type: db.sequelize.QueryTypes.SELECT 
      });

      // 使用者 一開始尚未預測
      if(predictionsInfoDocs.length == 0) {
        // return reject(errs.errsMsg('404', '1303'));
        return resolve(predictionsInfoList); // 回傳 空Array
      }

      // 一個使用者，一天只會有一筆記錄
      // if(predictionsInfoDocs.size > 1) {
      //   // console.error('Error 2. in user/predictonInfoModell by YuHsien');
      //   return reject(errs.errsMsg('404', '1304'));
      // }

      // 把賽事資料 重包裝格式
      groupBy(predictionsInfoDocs, 'league').forEach(function(data) { // 分聯盟陣列
        let league = '';
        data.forEach(function (ele) { // 取出 聯盟陣列中的賽事
          predictionsInfoList.push(
            repackage(ele)
          );
          league = ele.league;
        });
        response[league] = predictionsInfoList;
        predictionsInfoList = [];
      });
    } catch (err) {
      console.error('Error 2. in user/predictonInfoModell by YuHsien', err);
      return reject(errs.errsMsg('500', '500', err));
    }

    return resolve(response);
  });
}

function groupBy(arr, prop) { // 將陣列裡面的 object 依照 attrib 來進行分類成 array
  const map = new Map(Array.from(arr, obj => [obj[prop], []]));
  arr.forEach(obj => map.get(obj[prop]).push(obj));
  return Array.from(map.values());
}

function repackage (ele) {
  const data = {
    bets_id: ele.bets_id,
    scheduled: ele.match_scheduled, // 開賽時間
    league: ele.league,
    home: ele.home_alias,
    home_ch: ele.home_alias_ch,
    away: ele.away_alias,
    away_ch: ele.away_alias_ch,
    spread: {},
    totals: {}
  };

  if ( !(ele.spread_id == null) ) { // 有讓分資料
    data['spread'] = {
      predict: ele.spread_option,
      spread_id: ele.spread_id,
      handicap: ele.spread_handicap,
      percentage: Math.floor(Math.random()*50), // 目前先使用隨機數，將來有決定怎麼產生資料時，再處理
      bets: ele.spread_bets
    }
  }

  if( !(ele.totals_id == null) ) { // 有大小資料
    data['totals'] = {
      predict: ele.totals_option,
      totals_id: ele.totals_id,
      handicap: ele.totals_handicap,
      percentage: Math.floor(Math.random()*50), // 目前先使用隨機數，將來有決定怎麼產生資料時，再處理
      bets: ele.totals_bets
    }
  }

  return data;
}

module.exports = settleMatches;
