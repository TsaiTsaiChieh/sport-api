const modules = require('../../util/modules');
const AppErrors = require('../../util/AppErrors');
const db = require('../../util/dbUtil');
// 幾勝幾敗 win-lose
async function teamHandicap(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const teamHandicap = await queryTeamHandicap(args);
      const result = await repackage(args, teamHandicap);
      resolve(result);
    } catch (err) {
      reject(err);
    }
  });
}

function queryTeamHandicap(args) {
  return new Promise(async function(resolve, reject) {
    try {
      // take 168ms in mysql
      // take 2619ms in firebase serve
      // TODO season.start_date 可能要手動輸入

      const queries = await db.sequelize.query(
        `(
          SELECT bets_id, home_id, away_id, spread_result, totals_result, spread.handicap AS spread, total.handicap AS total
            FROM matches game,
                 match__seasons season,
                 match__spreads spread,
                 match__totals  total
           WHERE (game.home_id = '${args.team_id}' OR game.away_id = '${
          args.team_id
        }')
             AND season.league_id = '${modules.leagueCodebook(args.league).id}'
             AND game.scheduled BETWEEN UNIX_TIMESTAMP(season.start_date) AND UNIX_TIMESTAMP(season.end_date)
             AND game.spread_id = spread.spread_id
             AND game.totals_id = total.totals_id
         )`,
        {
          type: db.sequelize.QueryTypes.SELECT,
          replacements: {
            team_id: args.team_id,
            league: args.league
          }
        }
      );

      return resolve(queries);
    } catch (err) {
      return reject(`${err.stack} by DY`);
    }
  });
}

async function repackage(args, teamHandicap) {
  try {
    // 判斷過盤紀錄 對應zeplin 的 9宮格
    const fraction = [0, 0, 0, 0, 0, 0, 0, 0, 0]; // 分子 [為客且讓、為主且讓、為客受讓、為主受讓、為客大分、為主大分]
    const denominator = [0, 0, 0, 0, 0, 0, 0, 0, 0]; // 分母
    for (let i = 0; i < teamHandicap.length; i++) {
      const ele = teamHandicap[i];
      if (args.team_id === ele.home_id) {
        denominator[8] = denominator[8] + 1;
        // 計算該隊在主隊的過盤
        if (ele.spread >= 0) {
          // 9宮格右上
          denominator[2] = denominator[2] + 1;
          if (
            ele.spread_result === 'home' ||
            ele.spread_result === 'fair|home'
          ) {
            fraction[2] = fraction[2] + 1;
          }
        } else {
          // 9宮格中右
          denominator[5] = denominator[5] + 1;
          if (
            ele.spread_result === 'home' ||
            ele.spread_result === 'fair|home'
          ) {
            fraction[5] = fraction[5] + 1;
          }
        }
        // 計算為主時大分過盤
        if (ele.totals_result === 'over' || ele.totals_result === 'fair|over') {
          fraction[8] = fraction[8] + 1;
        }
      } else if (args.team_id === ele.away_id) {
        denominator[7] = denominator[7] + 1;
        // 計算該隊在客隊的過盤
        if (ele.spread < 0) {
          // 9宮格中上
          denominator[1] = denominator[1] + 1;
          if (
            ele.spread_result === 'away' ||
            ele.spread_result === 'fair|away'
          ) {
            fraction[1] = fraction[1] + 1;
          }
        } else {
          // 9宮格中
          denominator[4] = denominator[4] + 1;
          if (
            ele.spread_result === 'away' ||
            ele.spread_result === 'fair|away'
          ) {
            fraction[4] = fraction[4] + 1;
          }
        }
        // 計算為客時大分過盤
        if (ele.totals_result === 'over' || ele.totals_result === 'fair|over') {
          fraction[7] = fraction[7] + 1;
        }
      } else {
      }
    }
    for (let i = 0; i < 9; i = i + 3) {
      fraction[i] = fraction[i + 1] + fraction[i + 2];
      denominator[i] = denominator[i + 1] + denominator[i + 2];
    }
    const data = [];
    for (let i = 0; i < 9; i++) {
      const temp = {
        fraction: fraction[i],
        denominator: denominator[i] - fraction[i],
        percent: isNaN(Number((fraction[i] / denominator[i]) * 100).toFixed(2))
          ? '0'
          : Number((fraction[i] / denominator[i]) * 100).toFixed(2)
      };
      data.push(temp);
    }
    return data;
  } catch (err) {
    console.error(`${err.stack} by DY`);
    throw AppErrors.RepackageError(`${err.stack} by DY`);
  }
}
module.exports = teamHandicap;
