const modules = require('../util/modules');
const ESoccerpbp = require('./pbp_eSoccer');
const AppErrors = require('../util/AppErrors');
const ESoccerpbpInplay = ESoccerpbp.ESoccerpbpInplay;
const ESoccerpbpHistory = ESoccerpbp.ESoccerpbpHistory;

async function checkmatch_eSoccer() {
  return new Promise(async function (resolve, reject) {
    const firestoreName = 'pagetest_eSoccer';
    try {
      const data = await modules.firestore
        .collection(firestoreName)
        .where('flag.status', '>', 0)
        .get();
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
                let realtimeData = await modules.database
                  .ref(`esports/eSoccer/${betsID}`)
                  .once('value');
                realtimeData = realtimeData.val();

                try {
                  if (realtimeData.Summary.status === 'closed') {
                    const parameter = {
                      betsID: betsID
                    };
                    await ESoccerpbpHistory(parameter);
                  } else {
                    const parameter = {
                      betsID: betsID,
                      realtimeData: realtimeData
                    };
                    await ESoccerpbpInplay(parameter);
                  }
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
              let realtimeData = await modules.database
                .ref(`esports/eSoccer/${betsID}`)
                .once('value');
              realtimeData = realtimeData.val();
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
    return resolve('ok');
  });
}
module.exports = checkmatch_eSoccer;
