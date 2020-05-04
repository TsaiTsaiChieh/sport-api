const modules = require('../util/modules');
const NBApbp = require('./pbp_NBA');
const AppErrors = require('../util/AppErrors');
const NBApbpInplay = NBApbp.NBApbpInplay;
const NBApbpHistory = NBApbp.NBApbpHistory;

async function checkmatch_NBA() {
  return new Promise(async function (resolve, reject) {
    const firestoreName = 'pagetest_NBA';
    try {
      const data = await modules.firestore.collection(firestoreName).get();
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
            if (gameTime <= nowTime) {
              try {
                const realtimeData = await modules.database
                  .ref(`basketball/NBA/${betsID}`)
                  .once('value')
                  .val();
                periodsNow = 0;
                eventsNow = 0;
                const parameter = {
                  gameID: gameID,
                  betsID: betsID,
                  periodsNow: periodsNow,
                  eventsNow: eventsNow,
                  realtimeData: realtimeData
                };
                try {
                  await NBApbpInplay(parameter);
                } catch (err) {
                  return reject(
                    new AppErrors.PBPNBAError(
                      `${err} at checkmatch_NBA of NBApbpInplay by DY`
                    )
                  );
                }
              } catch (err) {
                return reject(
                  new AppErrors.FirebaseRealtimeError(
                    `${err} at checkmatch_NBA of realtimedata by DY`
                  )
                );
              }
            } else {
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
            break;
          }
          case 1: {
            try {
              const realtimeData = await modules.database
                .ref(`basketball/NBA/${betsID}`)
                .once('value')
                .val();
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
                try {
                  await NBApbpInplay(parameter);
                } catch (err) {
                  return reject(
                    new AppErrors.PBPNBAError(
                      `${err} at checkmatch_NBA of NBApbpInplay by DY`
                    )
                  );
                }
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
                try {
                  await NBApbpHistory(parameter);
                } catch (err) {
                  return reject(
                    new AppErrors.PBPNBAError(
                      `${err} at checkmatch_NBA of NBApbpHistory by DY`
                    )
                  );
                }
              } else if (realtimeData.Summary.status === 'inprogress') {
                periodsNow = Object.keys(realtimeData.PBP).length - 1; // how much periods
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
                try {
                  await NBApbpInplay(parameter);
                } catch (err) {
                  return reject(
                    new AppErrors.PBPNBAError(
                      `${err} at checkmatch_NBA of NBApbpInplay by DY`
                    )
                  );
                }
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
                try {
                  await NBApbpInplay(parameter);
                } catch (err) {
                  return reject(
                    new AppErrors.PBPNBAError(
                      `${err} at checkmatch_NBA of NBApbpInplay by DY`
                    )
                  );
                }
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
  });
}

module.exports = checkmatch_NBA;
