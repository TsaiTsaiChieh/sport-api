const modules = require('../util/modules');
const { database } = require('../util/firebaseModules');
const KBOpbp = require('./pbp_KBO');
const AppErrors = require('../util/AppErrors');
const db = require('../util/dbUtil');
const KBOpbpInplay = KBOpbp.KBOpbpInplay;
const KBOpbpHistory = KBOpbp.KBOpbpHistory;
const Match = db.Match;
async function checkmatch_KBO() {
  return new Promise(async function(resolve, reject) {
    try {
      const totalData = await queryForEvents();
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
                  .ref(`baseball/KBO/${betsID}/Summary/status`)
                  .set('inprogress');
                const parameter = {
                  betsID: betsID
                };
                await KBOpbpInplay(parameter);
              } catch (err) {
                return reject(
                  new AppErrors.PBPEsoccerError(
                    `${err} at checkmatch_KBO by DY`
                  )
                );
              }
            } else {
              await database
                .ref(`baseball/KBO/${betsID}/Summary/status`)
                .set('scheduled');
            }
            break;
          }
          case 1: {
            try {
              let realtimeData = await database
                .ref(`baseball/KBO/${betsID}`)
                .once('value');
              realtimeData = realtimeData.val();
              if (realtimeData.Summary.status !== 'closed') {
                const parameter = {
                  betsID: betsID,
                  realtimeData: realtimeData
                };
                await KBOpbpInplay(parameter);
              }

              if (realtimeData.Summary.status === 'closed') {
                const parameter = {
                  betsID: betsID
                };
                await KBOpbpHistory(parameter);
              }
            } catch (err) {
              return reject(
                new AppErrors.FirebaseCollectError(
                  `${err} atcheckmatch_KBO by DY`
                )
              );
            }
            break;
          }
          default: {
          }
        }
      }
    } catch (err) {
      return reject(
        new AppErrors.FirebaseCollectError(`${err} at checkmatch_KBO by DY`)
      );
    }
    return resolve('ok');
  });
}

async function queryForEvents() {
  return new Promise(async function(resolve, reject) {
    try {
      const queries = await db.sequelize.query(
      `(
				 SELECT game.bets_id AS bets_id, game.scheduled AS scheduled, game.status AS status
					 FROM matches AS game
					WHERE (game.status = ${modules.MATCH_STATUS.SCHEDULED} OR game.status = ${modules.MATCH_STATUS.INPLAY})
						AND game.league_id =  '349'
			 )`,
      {
        type: db.sequelize.QueryTypes.SELECT
      }
      );
      return resolve(queries);
    } catch (err) {
      return reject(
        new AppErrors.AxiosError(`${err} at checkmatch_KBO by DY`)
      );
    }
  });
}
module.exports = checkmatch_KBO;
