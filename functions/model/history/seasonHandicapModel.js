const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
const AppErrors = require('../../util/AppErrors');

async function seasonHandicap(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const homeEvents = await queryHomeEvents(args);
      const awayEvents = await queryAwayEvents(args);
      const twoTeamsEvents = await queryTwoTeamsEvents(args);
      const result = await repackage(
        args,
        homeEvents,
        awayEvents,
        twoTeamsEvents
      );
      resolve(result);
    } catch (err) {
      reject(err);
    }
  });
}

function queryHomeEvents(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const queries = await db.sequelize.query(
        // take 169 ms
        `(
          SELECT game.home_id AS aim_home_id, game.away_id AS aim_away_id,
                 historygame.bets_id AS id, historygame.scheduled AS scheduled,  historygame.home_id AS history_home_id, historygame.away_id AS history_away_id,
                 historygame.spread_result AS history_spread_result, historygame.totals_result AS history_totals_result, spread.handicap AS spread_handicap, totals.handicap AS totals_handicap
            FROM matches AS game,
                 matches AS historygame,
                 match__seasons AS season,
                 match__spreads AS spread,
                 match__totals AS totals
           WHERE game.bets_id = :event_id
             AND historygame.status = ${modules.MATCH_STATUS.END}
             AND game.league_id = :leagueID
             AND season.league_id = :leagueID
             AND (game.home_id = historygame.home_id OR game.home_id = historygame.away_id) 
             AND game.scheduled BETWEEN UNIX_TIMESTAMP(season.start_date) AND (UNIX_TIMESTAMP(season.end_date)+86400)
             AND historygame.bets_id = spread.match_id
             AND historygame.spread_id = spread.spread_id
             AND historygame.bets_id = totals.match_id
             AND historygame.totals_id = totals.totals_id
        ORDER BY historygame.scheduled      
        )`,
        {
          replacements: {
            leagueID: modules.leagueCodebook(args.league).id,
            event_id: args.event_id
          },
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      return resolve(await queries);
    } catch (err) {
      return reject(`${err.stack} by DY`);
    }
  });
}

function queryAwayEvents(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const queries = await db.sequelize.query(
        // take 169 ms
        `(
        SELECT game.home_id AS aim_home_id, game.away_id AS aim_away_id,
               historygame.bets_id AS id, historygame.scheduled AS scheduled,  historygame.home_id AS history_home_id, historygame.away_id AS history_away_id,
               historygame.spread_result AS history_spread_result, historygame.totals_result AS history_totals_result, spread.handicap AS spread_handicap, totals.handicap AS totals_handicap
          FROM matches AS game,
               matches AS historygame,
               match__seasons AS season,
               match__spreads AS spread,
               match__totals AS totals
         WHERE game.bets_id = :event_id
           AND historygame.status = ${modules.MATCH_STATUS.END}
           AND game.league_id = :leagueID
           AND season.league_id = :leagueID
           AND (game.away_id = historygame.home_id OR game.away_id = historygame.away_id) 
           AND game.scheduled BETWEEN UNIX_TIMESTAMP(season.start_date) AND (UNIX_TIMESTAMP(season.end_date)+86400)
           AND historygame.bets_id = spread.match_id
           AND historygame.spread_id = spread.spread_id
           AND historygame.bets_id = totals.match_id
           AND historygame.totals_id = totals.totals_id
      ORDER BY historygame.scheduled        
        )`,
        {
          replacements: {
            leagueID: modules.leagueCodebook(args.league).id,
            event_id: args.event_id
          },
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      return resolve(await queries);
    } catch (err) {
      return reject(`${err.stack} by DY`);
    }
  });
}

function queryTwoTeamsEvents(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const queries = await db.sequelize.query(
        // take 169 ms
        `(
          SELECT game.home_id AS aim_home_id, game.away_id AS aim_away_id,
                 historygame.bets_id AS id, historygame.scheduled AS scheduled,  historygame.home_id AS history_home_id, historygame.away_id AS history_away_id,
                 historygame.spread_result AS history_spread_result, historygame.totals_result AS history_totals_result, spread.handicap AS spread_handicap, totals.handicap AS totals_handicap
            FROM matches AS game,
                 matches AS historygame,
                 match__seasons AS season,
                 match__spreads AS spread,
                 match__totals AS totals
           WHERE game.bets_id = :event_id
             AND historygame.status = ${modules.MATCH_STATUS.END}
             AND game.league_id = :leagueID
             AND season.league_id = :leagueID
             AND (game.home_id = historygame.home_id OR game.away_id = historygame.home_id) 
             AND (game.home_id = historygame.away_id OR game.away_id = historygame.away_id)
             AND game.scheduled BETWEEN UNIX_TIMESTAMP(season.start_date) AND (UNIX_TIMESTAMP(season.end_date)+86400)
             AND historygame.bets_id = spread.match_id
             AND historygame.spread_id = spread.spread_id
             AND historygame.bets_id = totals.match_id
             AND historygame.totals_id = totals.totals_id
        ORDER BY historygame.scheduled            
        )`,
        {
          replacements: {
            leagueID: modules.leagueCodebook(args.league).id,
            event_id: args.event_id
          },
          type: db.sequelize.QueryTypes.SELECT
        }
      );
      return resolve(await queries);
    } catch (err) {
      return reject(`${err.stack} by DY`);
    }
  });
}

async function repackage(args, homeEvents, awayEvents, twoTeamsEvents) {
  try {
    let homeAtGivePass = 0;
    let homeAtGiveFail = 0;
    let homeAtGiveFair = 0;
    let homeAtBeGivenPass = 0;
    let homeAtBeGivenFail = 0;
    let homeAtBeGivenFair = 0;
    let awayAtGivePass = 0;
    let awayAtGiveFail = 0;
    let awayAtGiveFair = 0;
    let awayAtBeGivenPass = 0;
    let awayAtBeGivenFail = 0;
    let awayAtBeGivenFair = 0;
    let homeAtOverPass = 0;
    let homeAtOverFail = 0;
    let homeAtOverFair = 0;
    let awayAtOverPass = 0;
    let awayAtOverFail = 0;
    let awayAtOverFair = 0;
    let vsHomeAtGivePass = 0;
    let vsHomeAtGiveFail = 0;
    let vsHomeAtGiveFair = 0;
    let vsHomeAtBeGivenPass = 0;
    let vsHomeAtBeGivenFail = 0;
    let vsHomeAtBeGivenFair = 0;
    let vsHomeAtOverPass = 0;
    let vsHomeAtOverFail = 0;
    let vsHomeAtOverFair = 0;
    for (let i = 0; i < homeEvents.length; i++) {
      const ele = homeEvents[i];
      if (ele.aim_home_id === ele.history_home_id) {
        if (ele.spread_handicap > 0) {
          // 主隊讓分
          if (
            ele.history_spread_result === 'home' ||
            ele.history_spread_result === 'fair|home'
          ) {
            // 主讓分且贏
            homeAtGivePass = homeAtGivePass + 1;
          } else if (
            ele.history_spread_result === 'away' ||
            ele.history_spread_result === 'fair|away'
          ) {
            // 主讓分且輸
            homeAtGiveFail = homeAtGiveFail + 1;
          } else {
            // 主讓分結果為平
            homeAtGiveFair = homeAtGiveFair + 1;
          }
        } else if (ele.spread_handicap < 0) {
          // 主隊被讓分
          if (
            ele.history_spread_result === 'home' ||
            ele.history_spread_result === 'fair|home'
          ) {
            // 主受讓分且贏
            homeAtBeGivenPass = homeAtBeGivenPass + 1;
          } else if (
            ele.history_spread_result === 'away' ||
            ele.history_spread_result === 'fair|away'
          ) {
            // 主受讓分且輸
            homeAtBeGivenFail = homeAtBeGivenFail + 1;
          } else {
            // 主受讓分結果為平
            homeAtBeGivenFair = homeAtBeGivenFair + 1;
          }
        } else {
        }
      }
      if (ele.aim_home_id === ele.history_away_id) {
        if (ele.spread_handicap > 0) {
          // 主受讓
          if (
            ele.history_spread_result === 'home' ||
            ele.history_spread_result === 'fair|home'
          ) {
            homeAtBeGivenFail = homeAtBeGivenFail + 1;
          } else if (
            ele.history_spread_result === 'away' ||
            ele.history_spread_result === 'fair|away'
          ) {
            // 主讓分且輸
            homeAtBeGivenPass = homeAtBeGivenPass + 1;
          } else {
            // 主讓分結果為平
            homeAtBeGivenFair = homeAtBeGivenFair + 1;
          }
        } else if (ele.spread_handicap < 0) {
          // 主讓
          if (
            ele.history_spread_result === 'home' ||
            ele.history_spread_result === 'fair|home'
          ) {
            homeAtGiveFail = homeAtGiveFail + 1;
          } else if (
            ele.history_spread_result === 'away' ||
            ele.history_spread_result === 'fair|away'
          ) {
            homeAtGivePass = homeAtGivePass + 1;
          } else {
            homeAtGiveFair = homeAtGiveFair + 1;
          }
        } else {
        }
      }
      // 主隊大小分
      if (
        ele.history_totals_result === 'over' ||
        ele.history_totals_result === 'fair|over'
      ) {
        homeAtOverPass = homeAtOverPass + 1;
      } else if (
        ele.history_totals_result === 'under' ||
        ele.history_totals_result === 'fair|under'
      ) {
        homeAtOverFail = homeAtOverFail + 1;
      } else {
        homeAtOverFair = homeAtOverFair + 1;
      }
    }
    for (let i = 0; i < awayEvents.length; i++) {
      const ele = awayEvents[i];
      if (ele.aim_away_id === ele.history_home_id) {
        if (ele.spread_handicap > 0) {
          // 客隊讓分
          if (
            ele.history_spread_result === 'home' ||
            ele.history_spread_result === 'fair|home'
          ) {
            // 客讓分且贏
            awayAtGivePass = awayAtGivePass + 1;
          } else if (
            ele.history_spread_result === 'away' ||
            ele.history_spread_result === 'fair|away'
          ) {
            // 客讓分且輸
            awayAtGiveFail = awayAtGiveFail + 1;
          } else {
            // 客讓分結果為平
            awayAtGiveFair = awayAtGiveFair + 1;
          }
        } else if (ele.spread_handicap < 0) {
          // 客隊被讓分
          if (
            ele.history_spread_result === 'home' ||
            ele.history_spread_result === 'fair|home'
          ) {
            // 客隊被讓分且贏
            awayAtBeGivenPass = awayAtBeGivenPass + 1;
          } else if (
            ele.history_spread_result === 'away' ||
            ele.history_spread_result === 'fair|away'
          ) {
            // 客隊被讓分且輸
            awayAtBeGivenFail = awayAtBeGivenFail + 1;
          } else {
            // 客隊被讓分結果為平
            awayAtBeGivenFair = awayAtBeGivenFair + 1;
          }
        } else {
        }
      }
      if (ele.aim_away_id === ele.history_away_id) {
        if (ele.spread_handicap > 0) {
          // 客受讓
          if (
            ele.history_spread_result === 'home' ||
            ele.history_spread_result === 'fair|home'
          ) {
            awayAtBeGivenFail = awayAtBeGivenFail + 1;
          } else if (
            ele.history_spread_result === 'away' ||
            ele.history_spread_result === 'fair|away'
          ) {
            // 主讓分且輸
            awayAtBeGivenPass = awayAtBeGivenPass + 1;
          } else {
            // 主讓分結果為平
            awayAtBeGivenFair = awayAtBeGivenFair + 1;
          }
        } else if (ele.spread_handicap < 0) {
          // 客讓
          if (
            ele.history_spread_result === 'home' ||
            ele.history_spread_result === 'fair|home'
          ) {
            awayAtGiveFail = awayAtGiveFail + 1;
          } else if (
            ele.history_spread_result === 'away' ||
            ele.history_spread_result === 'fair|away'
          ) {
            awayAtGivePass = awayAtGivePass + 1;
          } else {
            awayAtGiveFair = awayAtGiveFair + 1;
          }
        } else {
        }
      }
      if (
        ele.history_totals_result === 'over' ||
        ele.history_totals_result === 'fair|over'
      ) {
        awayAtOverPass = awayAtOverPass + 1;
      } else if (
        ele.history_totals_result === 'under' ||
        ele.history_totals_result === 'fair|under'
      ) {
        awayAtOverFail = awayAtOverFail + 1;
      } else {
        awayAtOverFair = awayAtOverFair + 1;
      }
    }
    for (let i = 0; i < twoTeamsEvents.length; i++) {
      const ele = twoTeamsEvents[i];

      if (ele.aim_home_id === ele.history_home_id) {
        if (ele.spread_handicap > 0) {
          // 主隊讓分
          if (
            ele.history_spread_result === 'home' ||
            ele.history_spread_result === 'fair|home'
          ) {
            // 主讓分且贏
            vsHomeAtGivePass = vsHomeAtGivePass + 1;
          } else if (
            ele.history_spread_result === 'away' ||
            ele.history_spread_result === 'fair|away'
          ) {
            // 主讓分且輸
            vsHomeAtGiveFail = vsHomeAtGiveFail + 1;
          } else {
            // 主讓分結果為平
            vsHomeAtGiveFair = vsHomeAtGiveFair + 1;
          }
        } else if (ele.spread_handicap < 0) {
          // 主隊被讓分
          if (
            ele.history_spread_result === 'home' ||
            ele.history_spread_result === 'fair|home'
          ) {
            // 主受讓分且贏
            vsHomeAtBeGivenPass = vsHomeAtBeGivenPass + 1;
          } else if (
            ele.history_spread_result === 'away' ||
            ele.history_spread_result === 'fair|away'
          ) {
            // 主受讓分且輸
            vsHomeAtBeGivenFail = vsHomeAtBeGivenFail + 1;
          } else {
            // 主受讓分結果為平
            vsHomeAtBeGivenFair = vsHomeAtBeGivenFair + 1;
          }
        } else {
        }
      }
      if (ele.aim_home_id === ele.history_away_id) {
        if (ele.spread_handicap > 0) {
          // 主受讓
          if (
            ele.history_spread_result === 'home' ||
            ele.history_spread_result === 'fair|home'
          ) {
            vsHomeAtBeGivenFail = vsHomeAtBeGivenFail + 1;
          } else if (
            ele.history_spread_result === 'away' ||
            ele.history_spread_result === 'fair|away'
          ) {
            // 主讓分且輸
            vsHomeAtBeGivenPass = vsHomeAtBeGivenPass + 1;
          } else {
            // 主讓分結果為平
            vsHomeAtBeGivenFair = vsHomeAtBeGivenFair + 1;
          }
        } else if (ele.spread_handicap < 0) {
          // 主讓
          if (
            ele.history_spread_result === 'home' ||
            ele.history_spread_result === 'fair|home'
          ) {
            vsHomeAtGiveFail = vsHomeAtGiveFail + 1;
          } else if (
            ele.history_spread_result === 'away' ||
            ele.history_spread_result === 'fair|away'
          ) {
            vsHomeAtGivePass = vsHomeAtGivePass + 1;
          } else {
            vsHomeAtGiveFair = vsHomeAtGiveFair + 1;
          }
        } else {
        }
      }

      //
      if (ele.aim_home_id === ele.history_away_id) {
        if (ele.spread_handicap > 0) {
          // 主受讓
          if (
            ele.history_spread_result === 'home' ||
            ele.history_spread_result === 'fair|home'
          ) {
            homeAtBeGivenFail = homeAtBeGivenFail + 1;
          } else if (
            ele.history_spread_result === 'away' ||
            ele.history_spread_result === 'fair|away'
          ) {
            // 主讓分且輸
            homeAtBeGivenPass = homeAtBeGivenPass + 1;
          } else {
            // 主讓分結果為平
            homeAtBeGivenFair = homeAtBeGivenFair + 1;
          }
        } else if (ele.spread_handicap < 0) {
          // 主讓
          if (
            ele.history_spread_result === 'home' ||
            ele.history_spread_result === 'fair|home'
          ) {
            homeAtGiveFail = homeAtGiveFail + 1;
          } else if (
            ele.history_spread_result === 'away' ||
            ele.history_spread_result === 'fair|away'
          ) {
            homeAtGivePass = homeAtGivePass + 1;
          } else {
            homeAtGiveFair = homeAtGiveFair + 1;
          }
        } else {
        }
      }
      // 主隊大小分
      if (
        ele.history_totals_result === 'over' ||
        ele.history_totals_result === 'fair|over'
      ) {
        vsHomeAtOverPass = vsHomeAtOverPass + 1;
      } else if (
        ele.history_totals_result === 'under' ||
        ele.history_totals_result === 'fair|under'
      ) {
        vsHomeAtOverFail = vsHomeAtOverFail + 1;
      } else {
        vsHomeAtOverFair = vsHomeAtOverFair + 1;
      }
    }
    let data = [];
    const dataSeason = [];
    const dataVS = [];
    const give = {
      home: {
        Win: homeAtGivePass,
        Lose: homeAtGiveFail,
        Draw: homeAtGiveFair
      },
      away: {
        Win: awayAtGivePass,
        Lose: awayAtGiveFail,
        Draw: awayAtGiveFair
      }
    };
    const beGiven = {
      home: {
        Win: homeAtBeGivenPass,
        Lose: homeAtBeGivenFail,
        Draw: homeAtBeGivenFair
      },
      away: {
        Win: awayAtBeGivenPass,
        Lose: awayAtBeGivenFail,
        Draw: awayAtBeGivenFair
      }
    };
    const over = {
      home: {
        Win: homeAtOverPass,
        Lose: homeAtOverFail,
        Draw: homeAtOverFair
      },
      away: {
        Win: awayAtOverPass,
        Lose: awayAtOverFail,
        Draw: awayAtOverFair
      }
    };
    const vsGive = {
      home: {
        Win: vsHomeAtGivePass,
        Lose: vsHomeAtGiveFail,
        Draw: vsHomeAtGiveFair
      },
      away: {
        Win: vsHomeAtBeGivenFail,
        Lose: vsHomeAtBeGivenPass,
        Draw: vsHomeAtBeGivenFair
      }
    };
    const vsBeGiven = {
      home: {
        Win: vsHomeAtBeGivenPass,
        Lose: vsHomeAtBeGivenFail,
        Draw: vsHomeAtBeGivenFair
      },
      away: {
        Win: vsHomeAtGiveFail,
        Lose: vsHomeAtGivePass,
        Draw: vsHomeAtGiveFair
      }
    };
    const vsOver = {
      home: {
        Win: vsHomeAtOverPass,
        Lose: vsHomeAtOverFail,
        Draw: vsHomeAtOverFair
      },
      away: {
        Win: vsHomeAtOverPass,
        Lose: vsHomeAtOverFail,
        Draw: vsHomeAtOverFair
      }
    };
    // const data = {
    //   homeAtGivePass: homeAtGivePass,
    //   homeAtGiveFail: homeAtGiveFail,
    //   homeAtGiveFair: homeAtGiveFair,
    //   homeAtBeGivenPass: homeAtBeGivenPass,
    //   homeAtBeGivenFail: homeAtBeGivenFail,
    //   homeAtBeGivenFair: homeAtBeGivenFair,
    //   awayAtGivePass: awayAtGivePass,
    //   awayAtGiveFail: awayAtGiveFail,
    //   awayAtGiveFair: awayAtGiveFair,
    //   awayAtBeGivenPass: awayAtBeGivenPass,
    //   awayAtBeGivenFail: awayAtBeGivenFail,
    //   awayAtBeGivenFair: awayAtBeGivenFair,
    //   homeAtOverPass: homeAtOverPass,
    //   homeAtOverFail: homeAtOverFail,
    //   homeAtOverFair: homeAtOverFair,
    //   awayAtOverPass: awayAtOverPass,
    //   awayAtOverFail: awayAtOverFail,
    //   awayAtOverFair: awayAtOverFair,
    //   vsHomeAtGivePass: vsHomeAtGivePass,
    //   vsHomeAtGiveFail: vsHomeAtGiveFail,
    //   vsHomeAtGiveFair: vsHomeAtGiveFair,
    //   vsHomeAtBeGivenPass: vsHomeAtBeGivenPass,
    //   vsHomeAtBeGivenFail: vsHomeAtBeGivenFail,
    //   vsHomeAtBeGivenFair: vsHomeAtBeGivenFair,
    //   vsHomeAtOverPass: vsHomeAtOverPass,
    //   vsHomeAtOverFail: vsHomeAtOverFail,
    //   vsHomeAtOverFair: vsHomeAtOverFair,
    //   vsAwayAtGivePass: vsHomeAtBeGivenFail,
    //   vsAwayAtGiveFail: vsHomeAtBeGivenPass,
    //   vsAwayAtGiveFair: vsHomeAtBeGivenFair,
    //   vsAwayAtBeGivenPass: vsHomeAtGiveFail,
    //   vsAwayAtBeGivenFail: vsHomeAtGivePass,
    //   vsAwayAtBeGivenFair: vsHomeAtGiveFair,
    //   vsAwayAtOverPass: vsHomeAtOverPass,
    //   vsAwayAtOverFail: vsHomeAtOverFail,
    //   vsAwayAtOverFair: vsHomeAtOverFair
    // };
    dataSeason.push(give);
    dataSeason.push(beGiven);
    dataSeason.push(over);
    dataVS.push(vsGive);
    dataVS.push(vsBeGiven);
    dataVS.push(vsOver);

    data = {
      Season: dataSeason,
      VS: dataVS
    };
    return data;
  } catch (err) {
    console.error(`${err.stack} by DY`);
    throw AppErrors.RepackageError(`${err.stack} by DY`);
  }
}

module.exports = seasonHandicap;
