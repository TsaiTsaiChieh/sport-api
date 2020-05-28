const modules = require('../util/modules');
const ESoccerpbp = require('./pbp_eSoccer');
const AppErrors = require('../util/AppErrors');
const db = require('../util/dbUtil');
// const firestoreName = 'esports_eSoccer';
const ESoccerpbpInplay = ESoccerpbp.ESoccerpbpInplay;
const ESoccerpbpHistory = ESoccerpbp.ESoccerpbpHistory;
const Match = db.Match;
async function checkmatch_eSoccer() {
  return new Promise(async function(resolve, reject) {
    try {
      const totalData = await queryForEvents();
      // const data = await modules.firestore
      //  .collection(firestoreName)
      //  .where('flag.status', '>', 0)
      //  .get();

      // const totalData = [];
      // data.forEach((doc) => {
      //  totalData.push(doc.data());
      // });
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
                await modules.database
                  .ref(`esports/eSoccer/${betsID}/Summary/status`)
                  .set('inprogress');
                // await modules.firestore
                //  .collection(firestoreName)
                //  .doc(betsID)
                //  .set({ flag: { status: 1 } }, { merge: true });

                const parameter = {
                  betsID: betsID
                };
                await ESoccerpbpInplay(parameter);
              } catch (err) {
                return reject(
                  new AppErrors.PBPEsoccerError(
                    `${err} at checkmatch_ESoccer by DY`
                  )
                );
              }
            } else {
              await modules.database
                .ref(`esports/eSoccer/${betsID}/Summary/status`)
                .set('scheduled');
            }
            break;
          }
          case 1: {
            try {
              let realtimeData = await modules.database
                .ref(`esports/eSoccer/${betsID}`)
                .once('value');
              realtimeData = realtimeData.val();
              if (realtimeData.Summary.status !== 'closed') {
                const parameter = {
                  betsID: betsID,
                  realtimeData: realtimeData
                };
                await ESoccerpbpInplay(parameter);
              }

              if (realtimeData.Summary.status === 'closed') {
                const parameter = {
                  betsID: betsID
                };
                await ESoccerpbpHistory(parameter);
              }
            } catch (err) {
              return reject(
                new AppErrors.FirebaseCollectError(
                  `${err} at checkmatch_ESoccer by DY`
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
        new AppErrors.FirebaseCollectError(`${err} at checkmatch_ESoccer by DY`)
      );
    }
    return resolve('ok');
  });
}
async function queryForEvents() {
  return new Promise(async function(resolve, reject) {
    const queries = await db.sequelize.query(
      `(
				 SELECT game.bets_id AS bets_id, game.scheduled AS scheduled, game.status AS status
					 FROM matches AS game
					WHERE (game.status = ${modules.MATCH_STATUS.SCHEDULED} OR game.status = ${modules.MATCH_STATUS.INPLAY})
						AND game.league_id =  '22000'
			 )`,
      {
        type: db.sequelize.QueryTypes.SELECT
      }
    );
    return resolve(queries);
  });
}
module.exports = checkmatch_eSoccer;
