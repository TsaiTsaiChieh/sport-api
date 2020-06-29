const { dateUnixInfo, sliceTeamAndPlayer, groupBy, to } = require('../../util/modules');
const { checkUserRight } = require('../../util/databaseEngine');
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');

async function predictInfo(args) {
  // args.token 需求 token.uid
  // 1. 取得 使用者身份 例：大神、玩家 (users status： 1 normal 玩家  2 god 大神)
  // 2. 取得 使用者 未開賽 預測資料，該比賽必需是賽前，預測資料 排序以 開賽時間 (match_scheduled) 為主

  const userUid = args.token.uid;
  let predictionsInfoList = []; // 使用者預測資訊
  const response = {};

  // 1.
  const checkResult = await checkUserRight(userUid, [1, 2], '130825');
  if (checkResult.code) throw checkResult;

  // 2.
  const nowInfo = dateUnixInfo(new Date());
  const nowUnix = nowInfo.mdate.unix();

  // 使用者預測資訊
  // 賽前 (scheduled 開賽時間 > api呼叫時間)
  // 注意 percentage 目前先使用隨機數，將來有決定怎麼產生資料時，再處理

  // prediction 後面可以加上 force index(user__predictions_uid_match_scheduled) 確保 match_scheduled 有使用 index
  const [err, predictionsInfoDocs] = await to(db.sequelize.query(`
        select prediction.*, 
               spread.handicap spread_handicap, spread.home_tw, spread.away_tw,
               totals.handicap totals_handicap, totals.over_tw
          from (
                 select prediction.bets_id, match_scheduled, league.name league,
                        team_home.alias home_alias, team_home.alias_ch home_alias_ch,
                        team_away.alias away_alias, team_away.alias_ch away_alias_ch,
                        prediction.spread_id, prediction.spread_option, prediction.spread_bets,
                        prediction.totals_id, prediction.totals_option, prediction.totals_bets
                   from user__predictions prediction force index(user__predictions_uid_match_scheduled),
                        view__leagues league,
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
    replacements: {
      uid: userUid,
      now: nowUnix
    },
    limit: 30,
    type: db.sequelize.QueryTypes.SELECT
  }));
  if (err) {
    console.error('Error 2. in user/predictonInfoModell by YuHsien', err);
    throw errs.dbErrsMsg('404', '14050');
  }

  // 使用者 一開始尚未預測
  if (predictionsInfoDocs.length === 0) {
    return predictionsInfoList; // 回傳 空Array
  }

  // 一個使用者，一天只會有一筆記錄
  // if(predictionsInfoDocs.size > 1) {
  //   // console.error('Error 2. in user/predictonInfoModell by YuHsien');
  //   return reject(errs.errsMsg('404', '1304'));
  // }

  // 把賽事資料 重包裝格式
  groupBy(predictionsInfoDocs, 'league').forEach(function(data) { // 分聯盟陣列
    let league = '';
    data.forEach(function(ele) { // 取出 聯盟陣列中的賽事
      predictionsInfoList.push(
        repackage(ele)
      );
      league = ele.league;
    });
    response[league] = predictionsInfoList;
    predictionsInfoList = [];
  });

  return response;
}

function repackage(ele) {
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

  if (!(ele.spread_id == null)) { // 有讓分資料
    data.spread = {
      predict: ele.spread_option,
      spread_id: ele.spread_id,
      handicap: ele.spread_handicap,
      handicap_home_tw: ele.home_tw ? ele.home_tw : '',
      handicap_away_tw: ele.away_tw ? ele.away_tw : '',
      percentage: 0, // Math.floor(Math.random() * 50), // 目前先使用隨機數，將來有決定怎麼產生資料時，再處理
      bets: ele.spread_bets
    };
  }

  if (!(ele.totals_id == null)) { // 有大小資料
    data.totals = {
      predict: ele.totals_option,
      totals_id: ele.totals_id,
      handicap: ele.over_tw, // ele.totals_handicap,
      percentage: 0, // Math.floor(Math.random() * 50), // 目前先使用隨機數，將來有決定怎麼產生資料時，再處理
      bets: ele.totals_bets
    };
  }

  return data;
}

module.exports = predictInfo;
