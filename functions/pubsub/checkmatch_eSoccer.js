const modules = require('../util/modules');
const ESoccerpbp = require('./pbp_eSoccer');
const AppErrors = require('../util/AppErrors');
const ESoccerpbpInplay = ESoccerpbp.ESoccerpbpInplay;
const ESoccerpbpHistory = ESoccerpbp.ESoccerpbpHistory;

async function checkmatch_eSoccer() {
  return new Promise(async function (resolve, reject) {
    const firestoreName = 'pagetest_eSoccer';
    try {
      const data = await modules.firestore.collection(firestoreName).get();
      const totalData = [];
      data.forEach((doc) => {
        totalData.push(doc.data());
      });
      for (let i = 0; i < totalData.length; i++) {
        const betsID = totalData[i].bets_id;
        const gameTime = totalData[i].scheduled * 1000;
        const nowTime = Date.now();
        const eventStatus = totalData[i].flag.status;
        switch (eventStatus) {
          case 2: {
            if (gameTime <= nowTime) {
              try {
                const realtimeData = await modules.database
                  .ref(`esports/eSoccer/${betsID}`)
                  .once('value')
                  .val();
                const parameter = {
                  betsID: betsID,
                  realtimeData: realtimeData
                };
                try {
                  await ESoccerpbpInplay(parameter);
                } catch (err) {
                  return reject(
                    new AppErrors.PBPEsoccerError(
                      `${err} at checkmatch_ESoccer by DY`
                    )
                  );
                }
              } catch (err) {
                return reject(
                  new AppErrors.FirebaseCollectError(
                    `${err} at checkmatch_ESoccer by DY`
                  )
                );
              }
            } else {
              try {
                await modules.database
                  .ref(`esports/eSoccer/${betsID}/Summary/status`)
                  .set('scheduled');
              } catch (err) {
                return reject(
                  new AppErrors.FirebaseRealtimeError(
                    `${err} at checkmatch_ESoccer by DY`
                  )
                );
              }
            }
            break;
          }
          case 1: {
            try {
              const realtimeData = await modules.database
                .ref(`esports/eSoccer/${betsID}`)
                .once('value')
                .val();

              if (realtimeData.Summary.status === 'inprogress') {
                const parameter = {
                  betsID: betsID,
                  realtimeData: realtimeData
                };
                try {
                  await ESoccerpbpInplay(parameter);
                } catch (err) {
                  return reject(
                    new AppErrors.PBPEsoccerError(
                      `${err} at checkmatch_ESoccer by DY`
                    )
                  );
                }
              }

              if (realtimeData.Summary.status === 'closed') {
                const parameter = {
                  betsID: betsID
                };
                try {
                  await ESoccerpbpHistory(parameter);
                } catch (err) {
                  return reject(
                    new AppErrors.PBPEsoccerError(
                      `${err} at checkmatch_ESoccer by DY`
                    )
                  );
                }
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
  });
}
module.exports = checkmatch_eSoccer;
