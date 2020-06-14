const modules = require('../util/modules');
const AppErrors = require('../util/AppErrors');
const KBOpbp = require('./pbp_statscore_KBO');
const KBOpbpInplay = KBOpbp.KBOpbpInplay;
const KBOpbpHistory = KBOpbp.KBOpbpHistory;
const db = require('../util/dbUtil');
const Match = db.Match;

async function checkmatch_statscore_KBO() {
  return new Promise(async function(resolve, reject) {
    try {
      const totalData = await queryForEvents();
      for (let i = 0; i < totalData.length; i++) {
        const betsID = totalData[i].bets_id;
        const statscoreID = totalData[i].statscore_id;
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
                await modules.database
                  .ref(`baseball/KBO/${betsID}/Summary/status`)
                  .set('inprogress');

                const parameter = {
                  betsID: betsID,
                  statscoreID: statscoreID,
                  first: 1
                };
                await KBOpbpInplay(parameter);
              } catch (err) {
                return reject(
                  new AppErrors.PBPEsoccerError(
                    `${err} at checkmatch_statscore_KBO by DY`
                  )
                );
              }
            } else {
              try {
                await modules.database
                  .ref(`baseball/KBO/${betsID}/Summary/status`)
                  .set('scheduled');
              } catch (err) {
                return reject(
                  new AppErrors.PBPEsoccerError(
                    `${err} at checkmatch_statscore_KBO by DY`
                  )
                );
              }
            }
            break;
          }
          case 1: {
            try {
              let realtimeData = await modules.database
                .ref(`baseball/KBO/${betsID}`)
                .once('value');
              realtimeData = realtimeData.val();
              if (realtimeData.Summary.status !== 'closed') {
                const parameter = {
                  betsID: betsID,
                  statscoreID: statscoreID,
                  first: 0
                };
                await KBOpbpInplay(parameter);
              }

              if (realtimeData.Summary.status === 'closed') {
                const parameter = {
                  betsID: betsID,
                  statscoreID: statscoreID
                };
                await KBOpbpHistory(parameter);
              }
            } catch (err) {
              return reject(
                new AppErrors.FirebaseCollectError(
                  `${err} checkmatch_statscore_KBO by DY`
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
        new AppErrors.FirebaseCollectError(
          `${err} at checkmatch_statscore_KBO by DY`
        )
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
				 SELECT game.bets_id AS bets_id, game.radar_id AS statscore_id,game.scheduled AS scheduled, game.status AS status
					 FROM matches AS game
					WHERE (game.status = ${modules.MATCH_STATUS.SCHEDULED} OR game.status = ${modules.MATCH_STATUS.INPLAY})
						AND game.league_id = '349'
			 )`,
        {
          type: db.sequelize.QueryTypes.SELECT
        }
      );
      return resolve(queries);
    } catch (err) {
      return reject(
        new AppErrors.PBPEsoccerError(
          `${err} at checkmatch_statscore_KBO by DY`
        )
      );
    }
  });
}

module.exports = checkmatch_statscore_KBO;
