
const modules = require('../../util/modules');
const AppErrors = require('../../util/AppErrors');
const db = require('../../util/dbUtil');
const settlement = {
  win: 1,
  fair: 0,
  loss: -1,
  unsettlement: -2,
  winOdd_v1: 0.95,
  winOdd_v2: 1,
  winHalfOdd: 0.5,
  fairOdd: 0,
  lossHalfOdd: -0.5,
  lossOdd: -1
};

function predictionResult(args) {
  return new Promise(async function(resolve, reject) {
    try {
      // begin 改為也會呈顯昨天的預測內容，所以需要扣一天
      const unix = {
        begin: modules.convertTimezone(args.date, {
          op: 'subtract',
          value: 1,
          unit: 'days'
        }),
        end:
          modules.convertTimezone(args.date, {
            op: 'add',
            value: 1,
            unit: 'days'
          }) - 1
      };
      const predictions = await queryUserPredictionWhichIsSettled(args, unix);
      return resolve(repackage(predictions));
    } catch (err) {
      return reject({
        code: modules.httpStatus.INTERNAL_SERVER_ERROR,
        error: `${err} by TsaiChieh`
      });
    }
  });
}

// 尋找已結算的預測單
function queryUserPredictionWhichIsSettled(args, unix) {
  return new Promise(async function(resolve, reject) {
    try {
      // index is range or eq_ref, taking 161ms
      // TODO index in league table is ALL
      const result = await db.sequelize.query(
        `SELECT prediction.*, 
                spread.handicap AS spread_handicap, spread.home_tw, spread.away_tw, 
                totals.handicap AS totals_handicap, totals.over_tw
           FROM 
                (
                 SELECT prediction.bets_id, 
                        league.name AS league, league.league_id,
                        home.team_id AS home_id, home.alias AS home_alias, home.alias_ch AS home_alias_ch, 
                        away.team_id AS away_id, away.alias AS away_alias, away.alias_ch AS away_alias_ch, 
                        prediction.spread_id, prediction.spread_option, prediction.spread_bets, prediction.spread_result_flag, prediction.totals_id, prediction.totals_option, prediction.totals_bets, prediction.totals_result_flag, 
                        matches.home_points, matches.away_points, matches.scheduled
                   FROM user__predictions AS prediction,
                        view__leagues AS league,
                        matches, 
                        match__teams AS home, 
                        match__teams AS away 
                  WHERE prediction.league_id = league.league_id
                    AND prediction.bets_id = matches.bets_id 
                    AND matches.home_id = home.team_id 
                    AND matches.away_id = away.team_id 
                    AND prediction.uid = '${args.token.uid}'
                    AND match_scheduled BETWEEN ${unix.begin} AND ${unix.end}
                    AND (spread_result_flag != ${settlement.unsettlement} OR totals_result_flag != ${settlement.unsettlement})
                ) 
             AS prediction
      LEFT JOIN match__spreads AS spread ON prediction.spread_id = spread.spread_id
      LEFT JOIN match__totals AS totals ON prediction.totals_id = totals.totals_id
       ORDER BY prediction.scheduled`,
        { type: db.sequelize.QueryTypes.SELECT }
      );
      return resolve(result);
    } catch (err) {
      console.error(err);
      return reject(new AppErrors.MysqlError(`${err.stack} by TsaiChieh`));
    }
  });
}

function repackage(predictions) {
  try {
    let temp = [];
    const data = {};
    // 根據聯盟分賽事
    modules.groupBy(predictions, 'league').forEach(function(groupByData) {
      let league;
      // 取出聯盟陣列中的賽事
      groupByData.forEach(function(ele) {
        temp.push(repackageMatch(ele));
        league = ele.league;
      });
      data[league] = temp;
      temp = [];
    });
    return data;
  } catch (err) {
    return new AppErrors.RepackageError(`${err.stack} by TsaiChieh`);
  }
}

function repackageMatch(ele) {
  try {
    const data = {
      id: ele.bets_id,
      scheduled: ele.scheduled,
      scheduled_tw: modules.convertTimezoneFormat(ele.scheduled, { format: 'A hh:mm' }),
      league_id: ele.league_id,
      home: {
        id: ele.home_id,
        alias: modules.sliceTeamAndPlayer(ele.home_alias).team,
        alias_ch: modules.sliceTeamAndPlayer(ele.home_alias_ch).team,
        player_name: modules.sliceTeamAndPlayer(ele.home_alias).player_name,
        points: ele.home_points
      },
      away: {
        id: ele.away_id,
        alias: modules.sliceTeamAndPlayer(ele.away_alias).team,
        alias_ch: modules.sliceTeamAndPlayer(ele.away_alias_ch).team,
        player_name: modules.sliceTeamAndPlayer(ele.away_alias).player_name,
        points: ele.away_points
      },
      spread: {
        id: ele.spread_id ? ele.spread_id : null,
        handicap: ele.spread_handicap !== null ? ele.spread_handicap : null,
        home_tw: ele.home_tw !== null ? ele.home_tw : null,
        away_tw: ele.away_tw !== null ? ele.home_tw : null,
        predict: ele.spread_option ? ele.spread_option : null,
        ori_bets: ele.spread_bets !== null ? ele.spread_bets : null,
        result: ele.spread_option !== null ? ele.spread_result_flag : null
      },
      totals: {
        id: ele.totals_id ? ele.totals_id : null,
        handicap: ele.totals_handicap !== null ? ele.totals_handicap : null,
        over_tw: ele.over_tw !== null ? ele.over_tw : null,
        predict: ele.totals_option ? ele.totals_option : null,
        ori_bets: ele.totals_bets !== null ? ele.totals_bets : null,
        result: ele.totals_option !== null ? ele.totals_result_flag : null
      }
    };
    repackageHandicap(ele, data, 'spread');
    repackageHandicap(ele, data, 'totals');
    return data;
  } catch (err) {
    console.error(`${err.stack} by TsaiChieh`);
    throw new AppErrors.RepackageError(`${err.stack} by TsaiChieh`);
  }
}

function repackageHandicap(ele, data, handicapType) {
  try {
    // 當有下注讓分時
    if (ele[`${handicapType}_option`]) {
      const handicap = data[handicapType];
      const result = ele[`${handicapType}_result_flag`];
      // 當過盤結果為 0.95 時
      if (result === settlement.winOdd_v1 || result === settlement.winOdd_v2) {
        handicap.end = settlement.win;
        // TODO * settlement.winOdd_v1 or * winOdd_v2 較好
        handicap.bets = handicap.ori_bets * settlement.win;
        // 當過盤結果為 0.5 時
      } else if (result === settlement.winHalfOdd) {
        handicap.end = settlement.win;
        handicap.bets = handicap.ori_bets * settlement.winHalfOdd;
        // 當過盤結果為 0 時
      } else if (result === settlement.fairOdd) {
        handicap.end = settlement.fair;
        handicap.bets = handicap.ori_bets * settlement.fairOdd;
        // 當過盤結果為 -0.5 時
      } else if (result === settlement.lossHalfOdd) {
        handicap.end = settlement.loss;
        handicap.bets = handicap.ori_bets * settlement.lossHalfOdd;
        // 當過盤結果為 -1 時
      } else if (result === settlement.lossOdd) {
        handicap.end = settlement.loss;
        handicap.bets = handicap.ori_bets * settlement.lossOdd;
      } else {
        handicap.end = null;
        handicap.bets = null;
      }
    }
  } catch (err) {
    console.error(`${err.stack} by TsaiChieh`);
    throw new AppErrors.RepackageError(`${err.stack} by TsaiChieh`);
  }
}
module.exports = predictionResult;
