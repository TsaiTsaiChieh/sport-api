const modules = require('../util/modules');
const firebaseAdmin = require('../util/firebaseUtil');
const database = firebaseAdmin().database();
const leagueUtil = require('../util/leagueUtil');
const Anotherpbp = require('./pbp_another');
const AppErrors = require('../util/AppErrors');
const db = require('../util/dbUtil');
const AnotherpbpInplay = Anotherpbp.AnotherpbpInplay;
const AnotherpbpHistory = Anotherpbp.AnotherpbpHistory;
const Match = db.Match;
// const leagueArray = ['KBO', 'CPBL', 'NPB', 'CBA', 'Soccer']; //ori
const leagueArray = ['KBO', 'CPBL', 'NPB', 'Soccer', 'MLB']; // 2020/07/23
// const leagueArray = ['MLB'];
async function checkmatch_another() {
  return new Promise(async function(resolve, reject) {
    try {
      const unix = Date.now() / 1000;
      const date1 = modules.convertTimezoneFormat(unix, {
        format: 'YYYY-MM-DD 00:00:00',
        op: 'add',
        value: 0,
        unit: 'days'
      });
      const date2 = modules.convertTimezoneFormat(unix, {
        format: 'YYYY-MM-DD 00:00:00',
        op: 'add',
        value: 1,
        unit: 'days'
      });

      // const ele = await queryForMatches(time.getTime() / 1000);
      for (let leagueC = 0; leagueC < leagueArray.length; leagueC++) {
        const leagueID = leagueUtil.leagueCodebook(leagueArray[leagueC]).id;
        const leagueName = leagueArray[leagueC];
        const sportName = leagueUtil.league2Sport(leagueArray[leagueC]).sport;
        const totalData = await queryForEvents(
          leagueID,
          new Date(date1).getTime() / 1000,
          new Date(date2).getTime() / 1000
        );
        for (let i = 0; i < totalData.length; i++) {
          const betsID = totalData[i].bets_id;
          const gameTime = totalData[i].scheduled * 1000;
          const nowTime = Date.now();
          const eventStatus = totalData[i].status;
          switch (eventStatus) {
            case 2: {
              if (gameTime <= nowTime) {
                try {
                  await Match.upsert({
                    bets_id: betsID,
                    status: 1
                  });
                  await database
                    .ref(`${sportName}/${leagueName}/${betsID}/Summary/status`)
                    .set('inprogress');
                  const parameter = {
                    betsID: betsID
                  };
                  await AnotherpbpInplay(
                    parameter,
                    sportName,
                    leagueName,
                    leagueID
                  );
                } catch (err) {
                  return reject(
                    new AppErrors.PBPEsoccerError(
                      `${err} at checkmatch_Another by DY`
                    )
                  );
                }
              } else {
                await database
                  .ref(`${sportName}/${leagueName}/${betsID}/Summary/status`)
                  .set('scheduled');
              }
              break;
            }
            case 1: {
              try {
                let realtimeData = await database
                  .ref(`${sportName}/${leagueName}/${betsID}`)
                  .once('value');
                realtimeData = realtimeData.val();
                if (realtimeData.Summary.status !== 'closed') {
                  const parameter = {
                    betsID: betsID,
                    realtimeData: realtimeData
                  };
                  await AnotherpbpInplay(
                    parameter,
                    sportName,
                    leagueName,
                    leagueID
                  );
                }
                if (realtimeData.Summary.status === 'closed') {
                  const parameter = {
                    betsID: betsID
                  };
                  await AnotherpbpHistory(
                    parameter,
                    sportName,
                    leagueName,
                    leagueID
                  );
                }
              } catch (err) {
                return reject(
                  new AppErrors.FirebaseCollectError(
                    `${err} at checkmatch_Another on ${betsID} by DY`
                  )
                );
              }
              break;
            }
            default: {
            }
          }
        }
      }
    } catch (err) {
      return reject(
        new AppErrors.FirebaseCollectError(`${err} at checkmatch_Another by DY`)
      );
    }
    return resolve('ok');
  });
}

async function queryForEvents(leagueID, date1, date2) {
  return new Promise(async function(resolve, reject) {
    try {
      const queries = await db.sequelize.query(
        `
				 SELECT game.bets_id AS bets_id, game.scheduled AS scheduled, game.status AS status
					 FROM matches AS game			      
					WHERE (game.status = ${leagueUtil.MATCH_STATUS.SCHEDULED} OR game.status = ${leagueUtil.MATCH_STATUS.INPLAY})
						AND game.league_id = ${leagueID}
						AND game.scheduled BETWEEN ${date1} AND ${date2}
			 `,
        {
          type: db.sequelize.QueryTypes.SELECT
        }
      );
      return resolve(queries);
    } catch (err) {
      return reject(
        new AppErrors.MysqlError(`${err} at checkmatch_another by DY`)
      );
    }
  });
}

module.exports = checkmatch_another;
