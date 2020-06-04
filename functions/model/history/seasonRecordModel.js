const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
const AppErrors = require('../../util/AppErrors');

async function seasonRecord(args) {
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
  return new Promise(async function (resolve, reject) {
    try {
      const queries = await db.sequelize.query(
        // take 169 ms
        `(
          SELECT historygame.bets_id AS id, historygame.scheduled AS scheduled, historygame.home_id AS history_home_id, historygame.away_id AS history_away_id, historygame.home_points AS history_home_points, historygame.away_points AS history_away_points,
                 game.away_id AS aim_away_id,game.home_id AS aim_home_id
            FROM matches AS game,
                 matches AS historygame,
                 match__seasons AS season
           WHERE game.bets_id = :event_id
             AND historygame.status = ${modules.MATCH_STATUS.END}
             AND game.league_id = :leagueID
             AND season.league_id = :leagueID
             AND (game.home_id = historygame.home_id OR game.home_id = historygame.away_id) 
             AND historygame.scheduled BETWEEN UNIX_TIMESTAMP(season.start_date) AND (UNIX_TIMESTAMP(season.end_date)+86400)
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
  return new Promise(async function (resolve, reject) {
    try {
      const queries = await db.sequelize.query(
        // take 169 ms
        `(
          SELECT historygame.bets_id AS id, historygame.scheduled AS scheduled, historygame.home_id AS history_home_id, historygame.away_id AS history_away_id, historygame.home_points AS history_home_points, historygame.away_points AS history_away_points,
                 game.away_id AS aim_away_id,game.home_id AS aim_home_id
          FROM matches AS game,
               matches AS historygame,
               match__seasons AS season
         WHERE game.bets_id = :event_id
           AND historygame.status = ${modules.MATCH_STATUS.END}
           AND game.league_id = :leagueID
           AND season.league_id = :leagueID
           AND (game.away_id = historygame.home_id OR game.away_id = historygame.away_id) 
           AND historygame.scheduled BETWEEN UNIX_TIMESTAMP(season.start_date) AND (UNIX_TIMESTAMP(season.end_date)+86400)
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
  return new Promise(async function (resolve, reject) {
    try {
      const queries = await db.sequelize.query(
        // take 169 ms
        `(
          SELECT historygame.bets_id AS id, historygame.scheduled AS scheduled, historygame.home_id AS history_home_id, historygame.away_id AS history_away_id, historygame.home_points AS history_home_points, historygame.away_points AS history_away_points,
                 game.away_id AS aim_away_id,game.home_id AS aim_home_id
            FROM matches AS game,
                 matches AS historygame,
                 match__seasons AS season
           WHERE game.bets_id = :event_id
             AND historygame.status = ${modules.MATCH_STATUS.END}
             AND game.league_id = :leagueID
             AND season.league_id = :leagueID
             AND (game.home_id = historygame.home_id OR game.away_id = historygame.home_id) 
             AND (game.home_id = historygame.away_id OR game.away_id = historygame.away_id)
             AND historygame.scheduled BETWEEN UNIX_TIMESTAMP(season.start_date) AND (UNIX_TIMESTAMP(season.end_date)+86400)
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
    let homeAtHomeWin = 0;
    let homeAtHomeLose = 0;
    let homeAtHomeDraw = 0;
    let homeAtAwayWin = 0;
    let homeAtAwayLose = 0;
    let homeAtAwayDraw = 0;
    let homeAtHomeGet = 0;
    let homeAtHomeLoss = 0;
    let homeAtAwayGet = 0;
    let homeAtAwayLoss = 0;
    let awayAtHomeWin = 0;
    let awayAtHomeLose = 0;
    let awayAtHomeDraw = 0;
    let awayAtAwayWin = 0;
    let awayAtAwayLose = 0;
    let awayAtAwayDraw = 0;
    let awayAtHomeGet = 0;
    let awayAtHomeLoss = 0;
    let awayAtAwayGet = 0;
    let awayAtAwayLoss = 0;
    let vsHomeAtHomeWin = 0;
    let vsHomeAtHomeLose = 0;
    let vsHomeAtHomeDraw = 0;
    let vsHomeAtAwayWin = 0;
    let vsHomeAtAwayLose = 0;
    let vsHomeAtAwayDraw = 0;
    let vsHomeAtHomeGet = 0;
    let vsHomeAtHomeLoss = 0;
    let vsHomeAtAwayGet = 0;
    let vsHomeAtAwayLoss = 0;

    for (let i = 0; i < homeEvents.length; i++) {
      const ele = homeEvents[i];
      // 計算主隊本季賽績
      if (ele.aim_home_id === ele.history_home_id) {
        homeAtHomeGet = homeAtHomeGet + ele.history_home_points;
        homeAtHomeLoss = homeAtHomeLoss + ele.history_away_points;
        if (ele.history_home_points > ele.history_away_points) {
          homeAtHomeWin = homeAtHomeWin + 1;
        } else if (ele.history_home_points < ele.history_away_points) {
          homeAtHomeLose = homeAtHomeLose + 1;
        } else {
          homeAtHomeDraw = homeAtHomeDraw + 1;
        }
      }
      if (ele.aim_home_id === ele.history_away_id) {
        homeAtAwayGet = homeAtAwayGet + ele.history_away_points;
        homeAtAwayLoss = homeAtAwayLoss + ele.history_home_points;
        if (ele.history_home_points > ele.history_away_points) {
          homeAtAwayLose = homeAtAwayLose + 1;
        } else if (ele.history_home_points < ele.history_away_points) {
          homeAtAwayWin = homeAtAwayWin + 1;
        } else {
          homeAtAwayDraw = homeAtAwayDraw + 1;
        }
      }
    }

    homeAtHomeGet = parseFloat((homeAtHomeGet / homeEvents.length).toFixed(1));
    homeAtHomeLoss = parseFloat(
      (homeAtHomeLoss / homeEvents.length).toFixed(1)
    );
    homeAtAwayGet = parseFloat((homeAtAwayGet / homeEvents.length).toFixed(1));
    homeAtAwayLoss = parseFloat(
      (homeAtAwayLoss / homeEvents.length).toFixed(1)
    );
    for (let i = 0; i < awayEvents.length; i++) {
      const ele = awayEvents[i];
      // 計算主隊本季賽績
      if (ele.aim_away_id === ele.history_home_id) {
        awayAtHomeGet = awayAtHomeGet + ele.history_home_points;
        awayAtHomeLoss = awayAtHomeLoss + ele.history_away_points;
        if (ele.history_home_points > ele.history_away_points) {
          awayAtHomeWin = awayAtHomeWin + 1;
        } else if (ele.history_home_points < ele.history_away_points) {
          awayAtHomeLose = awayAtHomeLose + 1;
        } else {
          awayAtHomeDraw = awayAtHomeDraw + 1;
        }
      }
      if (ele.aim_away_id === ele.history_away_id) {
        awayAtAwayGet = awayAtAwayGet + ele.history_away_points;
        awayAtAwayLoss = awayAtAwayLoss + ele.history_home_points;
        if (ele.history_home_points > ele.history_away_points) {
          awayAtAwayLose = awayAtAwayLose + 1;
        } else if (ele.history_home_points < ele.history_away_points) {
          awayAtAwayWin = awayAtAwayWin + 1;
        } else {
          awayAtAwayDraw = awayAtAwayDraw + 1;
        }
      }
    }
    awayAtHomeGet = parseFloat((awayAtHomeGet / awayEvents.length).toFixed(1));
    awayAtHomeLoss = parseFloat(
      (awayAtHomeLoss / awayEvents.length).toFixed(1)
    );
    awayAtAwayGet = parseFloat((awayAtAwayGet / awayEvents.length).toFixed(1));
    awayAtAwayLoss = parseFloat(
      (awayAtAwayLoss / awayEvents.length).toFixed(1)
    );
    for (let i = 0; i < twoTeamsEvents.length; i++) {
      const ele = twoTeamsEvents[i];
      // 計算主隊本季賽績
      if (ele.aim_home_id === ele.history_home_id) {
        vsHomeAtHomeGet = vsHomeAtHomeGet + ele.history_home_points;
        vsHomeAtHomeLoss = vsHomeAtHomeLoss + ele.history_away_points;
        if (ele.history_home_points > ele.history_away_points) {
          vsHomeAtHomeWin = vsHomeAtHomeWin + 1;
        } else if (ele.history_home_points < ele.history_away_points) {
          vsHomeAtHomeLose = vsHomeAtHomeLose + 1;
        } else {
          vsHomeAtHomeDraw = vsHomeAtHomeDraw + 1;
        }
      }
      if (ele.aim_home_id === ele.history_away_id) {
        vsHomeAtAwayGet = vsHomeAtAwayGet + ele.history_away_points;
        vsHomeAtAwayLoss = vsHomeAtAwayLoss + ele.history_home_points;
        if (ele.history_home_points > ele.history_away_points) {
          vsHomeAtAwayLose = vsHomeAtAwayLose + 1;
        } else if (ele.history_home_points < ele.history_away_points) {
          vsHomeAtAwayWin = vsHomeAtAwayWin + 1;
        } else {
          vsHomeAtAwayDraw = vsHomeAtAwayDraw + 1;
        }
      }
    }
    vsHomeAtHomeGet = parseFloat(
      (vsHomeAtHomeGet / twoTeamsEvents.length).toFixed(1)
    );
    vsHomeAtHomeLoss = parseFloat(
      (vsHomeAtHomeLoss / twoTeamsEvents.length).toFixed(1)
    );
    vsHomeAtAwayGet = parseFloat(
      (vsHomeAtAwayGet / twoTeamsEvents.length).toFixed(1)
    );
    vsHomeAtAwayLoss = parseFloat(
      (vsHomeAtAwayLoss / twoTeamsEvents.length).toFixed(1)
    );
    let data = [];
    const dataSeason = [];
    const dataVS = [];

    const total = {
      home: {
        Win: homeAtHomeWin + homeAtAwayWin,
        Lose: homeAtHomeLose + homeAtAwayLose,
        Draw: homeAtHomeDraw + homeAtAwayDraw
      },
      away: {
        Win: awayAtHomeWin + awayAtAwayWin,
        Lose: awayAtHomeLose + awayAtAwayLose,
        Draw: awayAtHomeDraw + awayAtAwayDraw
      }
    };
    const atHome = {
      home: {
        Win: homeAtHomeWin,
        Lose: homeAtHomeLose,
        Draw: homeAtHomeDraw
      },
      away: {
        Lose: awayAtHomeLose,
        Draw: awayAtHomeDraw,
        Win: awayAtHomeWin
      }
    };
    const atAway = {
      home: {
        Win: homeAtAwayWin,
        Lose: homeAtAwayLose,
        Draw: homeAtAwayDraw
      },
      away: {
        Win: awayAtAwayWin,
        Lose: awayAtAwayLose,
        Draw: awayAtAwayDraw
      }
    };
    const totalScore = {
      home: {
        Get: parseFloat((homeAtHomeGet + homeAtAwayGet).toFixed(1)),
        Loss: parseFloat((homeAtHomeLoss + homeAtAwayLoss).toFixed(1))
      },
      away: {
        Get: parseFloat((awayAtHomeGet + awayAtAwayGet).toFixed(1)),
        Loss: parseFloat((awayAtHomeLoss + awayAtAwayLoss).toFixed(1))
      }
    };
    const atHomeScore = {
      home: {
        Get: homeAtHomeGet,
        Loss: homeAtHomeLoss
      },
      away: {
        Get: awayAtHomeGet,
        Loss: awayAtHomeLoss
      }
    };
    const atAwayScore = {
      home: {
        Get: homeAtAwayGet,
        Loss: homeAtAwayLoss
      },
      away: {
        Get: awayAtAwayGet,
        Loss: awayAtAwayLoss
      }
    };
    const vsTotal = {
      home: {
        Win: vsHomeAtHomeWin + vsHomeAtAwayWin,
        Lose: vsHomeAtHomeLose + vsHomeAtAwayLose,
        Draw: vsHomeAtHomeDraw + vsHomeAtAwayDraw
      },
      away: {
        Win: vsHomeAtAwayLose + vsHomeAtHomeLose,
        Lose: vsHomeAtAwayWin + vsHomeAtHomeWin,
        Draw: vsHomeAtAwayDraw + vsHomeAtHomeDraw
      }
    };
    const vsAtHome = {
      home: {
        Win: vsHomeAtHomeWin,
        Lose: vsHomeAtHomeLose,
        Draw: vsHomeAtHomeDraw
      },
      away: {
        Win: vsHomeAtAwayLose,
        Lose: vsHomeAtAwayWin,
        Draw: vsHomeAtAwayDraw
      }
    };
    const vsAtAway = {
      home: {
        Win: vsHomeAtAwayWin,
        Lose: vsHomeAtAwayLose,
        Draw: vsHomeAtAwayDraw
      },
      away: {
        Win: vsHomeAtHomeLose,
        Lose: vsHomeAtHomeWin,
        Draw: vsHomeAtHomeDraw
      }
    };
    const vsTotalScore = {
      home: {
        Get: parseFloat((vsHomeAtHomeGet + vsHomeAtAwayGet).toFixed(1)),
        Loss: parseFloat((vsHomeAtHomeLoss + vsHomeAtAwayLoss).toFixed(1))
      },
      away: {
        Get: parseFloat((vsHomeAtAwayLoss + vsHomeAtHomeLoss).toFixed(1)),
        Loss: parseFloat((vsHomeAtAwayGet + vsHomeAtHomeGet).toFixed(1))
      }
    };
    const vsAtHomeScore = {
      home: {
        Get: vsHomeAtHomeGet,
        Loss: vsHomeAtHomeLoss
      },
      away: {
        Get: vsHomeAtAwayLoss,
        Loss: vsHomeAtAwayGet
      }
    };
    const vsAtAwayScore = {
      home: {
        Get: vsHomeAtAwayGet,
        Loss: vsHomeAtAwayLoss
      },
      away: {
        Get: vsHomeAtHomeLoss,
        Loss: vsHomeAtHomeGet
      }
    };
    // let temp = {
    //   homeTotalWin: homeAtHomeWin + homeAtAwayWin,
    //   homeTotalLose: homeAtHomeLose + homeAtAwayLose,
    //   homeTotalDraw: homeAtHomeDraw + homeAtAwayDraw,
    //   homeAtHomeWin: homeAtHomeWin,
    //   homeAtHomeLose: homeAtHomeLose,
    //   homeAtHomeDraw: homeAtHomeDraw,
    //   homeAtAwayWin: homeAtAwayWin,
    //   homeAtAwayLose: homeAtAwayLose,
    //   homeAtAwayDraw: homeAtAwayDraw,
    //   homeTotalGet: homeAtHomeGet + homeAtAwayGet,
    //   homeTotalLoss: homeAtHomeLoss + homeAtAwayLoss,
    //   homeAtHomeGet: homeAtHomeGet,
    //   homeAtHomeLoss: homeAtHomeLoss,
    //   homeAtAwayGet: homeAtAwayGet,
    //   homeAtAwayLoss: homeAtAwayLoss,
    //   awayTotalWin: awayAtHomeWin + awayAtAwayWin,
    //   awayTotalLose: awayAtHomeLose + awayAtAwayLose,
    //   awayTotalDraw: awayAtHomeDraw + awayAtAwayDraw,
    //   awayAtHomeWin: awayAtHomeWin,
    //   awayAtHomeLose: awayAtHomeLose,
    //   awayAtHomeDraw: awayAtHomeDraw,
    //   awayAtAwayWin: awayAtAwayWin,
    //   awayAtAwayLose: awayAtAwayLose,
    //   awayAtAwayDraw: awayAtAwayDraw,
    //   awayTotalGet: awayAtHomeGet + awayAtAwayGet,
    //   awayTotalLoss: awayAtHomeLoss + awayAtAwayLoss,
    //   awayAtHomeGet: awayAtHomeGet,
    //   awayAtHomeLoss: awayAtHomeLoss,
    //   awayAtAwayGet: awayAtAwayGet,
    //   awayAtAwayLoss: awayAtAwayLoss,
    //   vsHomeTotalWin: vsHomeAtHomeWin + vsHomeAtAwayWin, //
    //   vsHomeTotalLose: vsHomeAtHomeLose + vsHomeAtAwayLose,
    //   vsHomeTotalDraw: vsHomeAtHomeDraw + vsHomeAtAwayDraw,
    //   vsHomeAtHomeWin: vsHomeAtHomeWin,
    //   vsHomeAtHomeLose: vsHomeAtHomeLose,
    //   vsHomeAtHomeDraw: vsHomeAtHomeDraw,
    //   vsHomeAtAwayWin: vsHomeAtAwayWin,
    //   vsHomeAtAwayLose: vsHomeAtAwayLose,
    //   vsHomeAtAwayDraw: vsHomeAtAwayDraw,
    //   vsHomeTotalGet: vsHomeAtHomeGet + vsHomeAtAwayGet,
    //   vsHomeTotalLoss: vsHomeAtHomeLoss + vsHomeAtAwayLoss,
    //   vsHomeAtHomeGet: vsHomeAtHomeGet,
    //   vsHomeAtHomeLoss: vsHomeAtHomeLoss,
    //   vsHomeAtAwayGet: vsHomeAtAwayGet,
    //   vsHomeAtAwayLoss: vsHomeAtAwayLoss, //
    //   vsAwayTotalWin: vsHomeAtAwayLose + vsHomeAtHomeLose,
    //   vsAwayTotalLose: vsHomeAtAwayWin + vsHomeAtHomeWin,
    //   vsAwayTotalDraw: vsHomeAtAwayDraw + vsHomeAtHomeDraw,
    //   vsAwayAtHomeWin: vsHomeAtAwayLose,
    //   vsAwayAtHomeLose: vsHomeAtAwayWin,
    //   vsAwayAtHomeDraw: vsHomeAtAwayDraw,
    //   vsAwayAtAwayWin: vsHomeAtHomeLose,
    //   vsAwayAtAwayLose: vsHomeAtHomeWin,
    //   vsAwayAtAwayDraw: vsHomeAtHomeDraw,
    //   vsAwayTotalGet: vsHomeAtAwayLoss + vsHomeAtHomeLoss,
    //   vsAwayTotalLoss: vsHomeAtAwayGet + vsHomeAtHomeGet,
    //   vsAwayAtHomeGet: vsHomeAtAwayLoss,
    //   vsAwayAtHomeLoss: vsHomeAtAwayGet,
    //   vsAwayAtAwayGet: vsHomeAtHomeLoss,
    //   vsAwayAtAwayLoss: vsHomeAtHomeGet
    // };
    dataSeason.push(total);
    dataSeason.push(atHome);
    dataSeason.push(atAway);
    dataSeason.push(totalScore);
    dataSeason.push(atHomeScore);
    dataSeason.push(atAwayScore);
    dataVS.push(vsTotal);
    dataVS.push(vsAtHome);
    dataVS.push(vsAtAway);
    dataVS.push(vsTotalScore);
    dataVS.push(vsAtHomeScore);
    dataVS.push(vsAtAwayScore);
    // data.push(dataSeason);
    // data.push(dataVS);
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
module.exports = seasonRecord;
