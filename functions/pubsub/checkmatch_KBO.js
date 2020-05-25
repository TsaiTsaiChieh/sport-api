const modules = require('../util/modules');
const KBOpbp = require('./pbp_KBO');
const AppErrors = require('../util/AppErrors');
const db = require('../util/dbUtil');
const firestoreName = 'baseball_KBO';
const KBOpbpInplay = KBOpbp.KBOpbpInplay;
const KBOpbpHistory = KBOpbp.KBOpbpHistory;
const Match = db.Match;
async function checkmatch_KBO() {
  return new Promise(async function(resolve, reject) {
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
                await Match.upsert({
                  bets_id: betsID,
                  status: 1
                });
                await modules.database
                  .ref(`baseball/KBO/${betsID}/Summary/status`)
                  .set('inprogress');
                await modules.firestore
                  .collection(firestoreName)
                  .doc(betsID)
                  .set({ flag: { status: 1 } }, { merge: true });

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
              await modules.database
                .ref(`baseball/KBO/${betsID}/Summary/status`)
                .set('scheduled');
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
module.exports = checkmatch_KBO;
