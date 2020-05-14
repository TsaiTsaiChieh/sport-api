const modules = require('../util/modules');
const NBApbp = require('./pbp_NBA');
const AppErrors = require('../util/AppErrors');
const db = require('../util/dbUtil');
const NBApbpInplay = NBApbp.NBApbpInplay;
const NBApbpHistory = NBApbp.NBApbpHistory;
const Match = db.Match;
async function checkmatch_NBA() {
  return new Promise(async function(resolve, reject) {
    const firestoreName = 'pagetest_NBA';
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
        const gameID = totalData[i].radar_id;
        const gameTime = totalData[i].scheduled * 1000;
        const nowTime = Date.now();
        let periodsNow;
        let periodName;
        let eventsNow;
        const eventStatus = totalData[i].flag.status;
        switch (eventStatus) {
          case 2: {
            let realtimeData = await modules.database
              .ref(`basketball/NBA/${betsID}`)
              .once('value');
            realtimeData = realtimeData.val();
            if (gameTime <= nowTime) {
              try {
                await modules.database
                  .ref(`basketball/NBA/${betsID}/Summary/status`)
                  .set('inprogress');
                await modules.firestore
                  .collection(firestoreName)
                  .doc(betsID)
                  .set({ flag: { status: 1 } }, { merge: true });
                await Match.upsert({
                  bets_id: betsID,
                  status: 1
                });
                periodsNow = 0;
                eventsNow = 0;
                const parameter = {
                  gameID: gameID,
                  betsID: betsID,
                  periodsNow: periodsNow,
                  eventsNow: eventsNow,
                  realtimeData: realtimeData
                };
                await NBApbpInplay(parameter);
              } catch (err) {
                return reject(
                  new AppErrors.PBPNBAError(
                    `${err} at checkmatch_NBA of realtimedata by DY`
                  )
                );
              }
            } else {
              if (realtimeData.Summary.status !== 'scheduled') {
                try {
                  await modules.database
                    .ref(`basketball/NBA/${betsID}/Summary/status`)
                    .set('scheduled');
                } catch (err) {
                  return reject(
                    new AppErrors.FirebaseRealtimeError(
                      `${err} at checkmatch_NBA of status by DY`
                    )
                  );
                }
              }
            }
            break;
          }
          case 1: {
            try {
              let realtimeData = await modules.database
                .ref(`basketball/NBA/${betsID}`)
                .once('value');
              realtimeData = realtimeData.val();
              if (realtimeData.Summary.status === 'created') {
                periodsNow = 0;
                periodName = 'periods0';
                eventsNow = 0;
                const parameter = {
                  gameID: gameID,
                  betsID: betsID,
                  periodsNow: periodsNow,
                  eventsNow: eventsNow,
                  realtimeData: realtimeData
                };
                await NBApbpInplay(parameter);
              } else if (
                realtimeData.Summary.status === 'closed' ||
                realtimeData.Summary.status === 'complete'
              ) {
                // eslint-disable-next-line no-await-in-loop
                const parameter = {
                  gameID: gameID,
                  betsID: betsID,
                  realtimeData: realtimeData
                };
                await NBApbpHistory(parameter);
              } else if (realtimeData.Summary.status === 'inprogress') {
                periodsNow = Object.keys(realtimeData.PBP).length - 1;
                periodName = Object.keys(realtimeData.PBP);
                eventsNow =
                  Object.keys(realtimeData.PBP[periodName[periodsNow]]).length -
                  1;

                const parameter = {
                  gameID: gameID,
                  betsID: betsID,
                  periodsNow: periodsNow,
                  eventsNow: eventsNow,
                  realtimeData: realtimeData
                };

                await NBApbpInplay(parameter);
              } else {
                periodsNow = 0;
                periodName = 'periods0';
                eventsNow = 0;
                const parameter = {
                  gameID: gameID,
                  betsID: betsID,
                  periodsNow: periodsNow,
                  eventsNow: eventsNow,
                  realtimeData: realtimeData
                };

                await NBApbpInplay(parameter);
              }
            } catch (err) {
              return reject(
                new AppErrors.FirebaseRealtimeError(
                  `${err} at checkmatch_NBA of realtimedata by DY`
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
      return reject(new AppErrors.AxiosError(`${err} at checkmatch_NBA by DY`));
    }
    return resolve('ok');
  });
}

module.exports = checkmatch_NBA;
