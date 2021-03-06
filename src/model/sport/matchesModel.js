const modules = require('../../util/modules');
const { leagueCodebook, league2Sport, MATCH_STATUS, USER_SELL } = require('../../util/leagueUtil');
const { SCHEDULED, INPLAY, END, VALID } = MATCH_STATUS;
const db = require('../../util/dbUtil');
const AppErrors = require('../../util/AppErrors');
const ignoreLeagueId = '22000';

function getMatches(args) {
  return new Promise(async function(resolve, reject) {
    try {
      let godPredictions = [];
      const matches = await getMatchesWithDate(args);
      if (isGodBelongToLeague(args)) {
        godPredictions = await returnGodUserPrediction(args);
      }
      return resolve(await repackageMatches(matches, args, godPredictions));
    } catch (err) {
      return reject(err);
    }
  });
}

function getMatchesWithDate(args) {
  return new Promise(async function(resolve, reject) {
    const { league } = args;
    const begin = modules.convertTimezone(args.date);
    const end =
      modules.convertTimezone(args.date, {
        op: 'add',
        value: 1,
        unit: 'days'
      }) - 1;
    try {
      // index is range, eq_ref, taking 170 ms
      const results = await db.sequelize.query(
        `SELECT game.bets_id AS id, game.scheduled, game.status, game.league_id, game.spread_id, game.totals_id, 
                game.home_points, game.away_points, game.spread_result, game.totals_result, 
                game.home_name, game.home_alias_ch, game.home_alias, game.home_image_id, 
                game.away_name, game.away_alias_ch, game.away_alias, game.away_image_id, 
                spread.handicap AS spread_handicap, spread.home_tw AS spread_home_tw, spread.away_tw AS spread_away_tw,
                totals.handicap AS totals_handicap, totals.over_tw AS totals_over_tw,
                league.name_ch, league.ori_league_id
          FROM
              (
                SELECT game.*,
                       home.name AS home_name, home.alias_ch AS home_alias_ch, home.alias AS home_alias, home.image_id AS home_image_id,
                       away.name AS away_name, away.alias_ch AS away_alias_ch, away.alias AS away_alias, away.image_id AS away_image_id
                  FROM matches AS game, 
                       match__teams AS home, 
                       match__teams AS away
                 WHERE game.flag_prematch = ${VALID}
                   AND scheduled BETWEEN ${begin} AND ${end}
                   AND game.league_id = '${leagueCodebook(league).id}'
                   AND game.home_id = home.team_id 
                   AND game.away_id = away.team_id
                   AND (game.status = ${SCHEDULED} OR game.status = ${INPLAY} OR game.status = ${END})
              ) AS game
     LEFT JOIN match__spreads AS spread ON (game.bets_id = spread.match_id AND game.spread_id = spread.spread_id)
     LEFT JOIN match__totals AS totals ON (game.bets_id = totals.match_id AND game.totals_id = totals.totals_id)
    INNER JOIN match__leagues AS league ON game.ori_league_id = league.ori_league_id
      ORDER BY game.scheduled`,
        {
          type: db.sequelize.QueryTypes.SELECT
        });

      return resolve(results);
    } catch (err) {
      return reject(new AppErrors.MysqlError(`${err.stack} by TsaiChieh`));
    }
  });
}

function returnGodUserPrediction(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const begin = modules.convertTimezone(args.date);
      const end =
        modules.convertTimezone(args.date, {
          op: 'add',
          value: 1,
          unit: 'days'
        }) - 1;
      // index is range, taking 165ms
      const results = await db.sequelize.query(
        `SELECT bets_id, sell, spread_id, spread_option, totals_id, totals_option
           FROM user__predictions
          WHERE uid = :uid 
            AND match_scheduled BETWEEN ${begin} AND ${end}
            AND league_id = '${leagueCodebook(args.league).id}'`,
        {
          type: db.sequelize.QueryTypes.SELECT,
          replacements: { uid: args.token.uid }
        }
      );
      return resolve(results);
    } catch (err) {
      return reject(new AppErrors.MysqlError(`${err.stack} by TsaiChieh`));
    }
  });
}

function isGodBelongToLeague(args) {
  if (args.token) {
    if (args.token.customClaims.titles.includes(args.league)) {
      return true;
    }
  } else return false;
}

function repackageMatches(results, args, godPredictions) {
  try {
    const data = {
      sell: USER_SELL.NORMAL,
      scheduled: [],
      inplay: [],
      end: []
    };

    for (let i = 0; i < results.length; i++) {
      const ele = results[i];

      const temp = {
        id: ele.id,
        scheduled: ele.scheduled,
        scheduled_tw: modules.convertTimezoneFormat(ele.scheduled, { format: 'hh:mm A' }),
        status: ele.status,
        sport: league2Sport(args.league).sport,
        league: args.league,
        league_ch: ele.name_ch,
        league_id: ele.league_id,
        ori_league_id: ele.ori_league_id,
        home: {
          id: ele.home_id,
          team_name: ele.home_alias,
          alias: modules.sliceTeamAndPlayer(ele.home_alias).team,
          alias_ch: modules.sliceTeamAndPlayer(ele.home_alias_ch).team,
          player_name: modules.sliceTeamAndPlayer(ele.home_alias).player_name,
          image_id: ele.home_image_id
        },
        away: {
          id: ele.away_id,
          team_name: ele.away_alias,
          alias: modules.sliceTeamAndPlayer(ele.away_alias).team,
          alias_ch: modules.sliceTeamAndPlayer(ele.away_alias_ch).team,
          player_name: modules.sliceTeamAndPlayer(ele.away_alias).player_name,
          image_id: ele.away_image_id
        },
        spread: {
          id: ele.spread_id,
          handicap: ele.spread_handicap,
          home_tw: ele.spread_home_tw,
          away_tw: ele.spread_away_tw,
          disable: !!((ele.spread_id === null || ele.spread_handicap === null))
        },
        totals: {
          id: ele.totals_id,
          handicap: ele.totals_handicap,
          over_tw: ele.totals_over_tw,
          disable: !!((ele.totals_id === null || ele.totals_handicap === null))
        }
      };

      // ignore eSoccer league when spread & totals are null
      if (temp.league_id === ignoreLeagueId && !temp.spread.id && !temp.totals.id) continue;

      if (godPredictions.length) {
        data.sell = godPredictions[0].sell;
        isHandicapDisable(ele, temp, godPredictions);
      }
      if (ele.home_points || ele.home_points === 0) temp.home.points = ele.home_points;
      if (ele.away_points || ele.away_points === 0) temp.away.points = ele.away_points;
      // 中分洞要亮原本顯示的盤口，否則亮過盤結果
      if (ele.spread_result) {
        if (ele.spread_result === 'fair2') {
          temp.spread.result = ele.spread_result;
          if (ele.spread_home_tw) temp.spread.result = 'home';
          else if (ele.spread_away_tw) temp.spread.result = 'away';
        } else if (ele.spread_result === 'fair|home') temp.spread.result = 'home';
        else if (ele.spread_result === 'fair|away') temp.spread.result = 'away';
        else temp.spread.result = ele.spread_result;
      }
      if (ele.totals_result) {
        if (ele.totals_result === 'fair2' || ele.totals_result === 'fair|over') temp.totals.result = 'over';
        else if (ele.totals_result === 'fair|under') temp.totals.result = 'under';
        else temp.totals.result = ele.totals_result;
      }
      if (ele.status === SCHEDULED) {
        // FIXME -- 由於 betsAPI 會有已開盤，但賽事狀態又改為未開打的情況。未來若導入 statScore API 無此情況發生可移除此邏輯
        // const disableFlag = blockInvalidMatch(ele);
        // temp.spread.disable = disableFlag.spreadFlag;
        // temp.totals.disable = disableFlag.totalsFlag;
        // --
        data.scheduled.push(temp);
      } else if (ele.status === INPLAY) {
        temp.spread.disable = true;
        temp.totals.disable = true;
        data.inplay.push(temp);
      } else if (ele.status === END) {
        temp.spread.disable = true;
        temp.totals.disable = true;
        data.end.push(temp);
      }
    }
    return data;
  } catch (err) {
    throw new AppErrors.RepackageError(err.stack);
  }
}

// function blockInvalidMatch(ele) {
//   if ((ele.spread_result || ele.totals_result)) return { spreadFlag: true, totalsFlag: true };
//   else if (!ele.spread_result && !ele.totals_result) return { spreadFlag: true, totalsFlag: true };
//   else if (!ele.spread_result && ele.totals_result) return { spreadFlag: false, totalsFlag: true };
//   else if (ele.spread_result && !ele.totals_result) return { spreadFlag: true, totalsFlag: false };
//   else return { spreadFlag: false, totalsFlag: false };
// }

// 將大神預測單的資料作顯示上的處理
function isHandicapDisable(ele, temp, predictions) {
  for (let i = 0; i < predictions.length; i++) {
    if (ele.id === predictions[i].bets_id) {
      if (predictions[i].spread_id) {
        temp.spread.predict = predictions[i].spread_option;
        temp.spread.disable = true;
      }
      if (predictions[i].totals_id) {
        temp.totals.predict = predictions[i].totals_option;
        temp.totals.disable = true;
      }
    }
  }
}

module.exports = getMatches;
