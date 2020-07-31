const leagueUtil = require('../util/leagueUtil');
const firebaseAdmin = require('../util/firebaseUtil');
const database = firebaseAdmin().database();
const AppErrors = require('../util/AppErrors');
const MLBpbp = require('./pbp_statscore_MLB');
const MLBpbpInplay = MLBpbp.MLBpbpInplay;
const MLBpbpHistory = MLBpbp.MLBpbpHistory;
const db = require('../util/dbUtil');
const Match = db.Match;
const sport = 'baseball';
const league = 'MLB';
const leagueID = leagueUtil.leagueCodebook(league).id;

async function checkmatch_statscore_MLB() {
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
                await database
                  .ref(`${sport}/${league}/${betsID}/Summary/status`)
                  .set('inprogress');

                const parameter = {
                  betsID: betsID,
                  statscoreID: statscoreID,
                  first: 1
                };
                await MLBpbpInplay(parameter);
              } catch (err) {
                return reject(
                  new AppErrors.MysqlError(
                    `${err} at checkmatch_statscore_MLB by DY`
                  )
                );
              }
            } else {
              try {
                await database
                  .ref(`${sport}/${league}/${betsID}/Summary/status`)
                  .set('scheduled');
              } catch (err) {
                return reject(
                  new AppErrors.MysqlError(
                    `${err} at checkmatch_statscore_MLB by DY`
                  )
                );
              }
            }
            break;
          }
          case 1: {
            try {
              let realtimeData = await database
                .ref(`${sport}/${league}/${betsID}`)
                .once('value');
              realtimeData = realtimeData.val();
              if (realtimeData.Summary.status !== 'closed') {
                const parameter = {
                  betsID: betsID,
                  statscoreID: statscoreID,
                  first: 0
                };
                await MLBpbpInplay(parameter);
              }

              if (realtimeData.Summary.status === 'closed') {
                const parameter = {
                  betsID: betsID,
                  statscoreID: statscoreID
                };
                await MLBpbpHistory(parameter);
              }
            } catch (err) {
              return reject(
                new AppErrors.FirebaseCollectError(
                  `${err} checkmatch_statscore_MLB by DY`
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
          `${err} at checkmatch_statscore_MLB by DY`
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
					WHERE (game.status = ${leagueUtil.MATCH_STATUS.SCHEDULED} OR game.status = ${leagueUtil.MATCH_STATUS.INPLAY})
						AND game.league_id = '${leagueID}'
			 )`,
        {
          type: db.sequelize.QueryTypes.SELECT
        }
      );
      return resolve(queries);
    } catch (err) {
      return reject(
        new AppErrors.MysqlError(`${err} at checkmatch_statscore_MLB by DY`)
      );
    }
  });
}

module.exports = checkmatch_statscore_MLB;
