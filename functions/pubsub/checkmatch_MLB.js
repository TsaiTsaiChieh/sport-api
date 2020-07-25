const firebaseAdmin = require('../util/firebaseUtil');
const firestore = firebaseAdmin().firestore();
const database = firebaseAdmin().database();
const MLBpbp = require('./pbp_MLB');
const AppErrors = require('../util/AppErrors');
const MLBpbpInplay = MLBpbp.MLBpbpInplay;
const MLBpbpHistory = MLBpbp.MLBpbpHistory;

async function checkmatch_MLB() {
  return new Promise(async function(resolve, reject) {
    const firestoreName = 'pagetest_MLB';
    try {
      const data = await firestore.collection(firestoreName).get();
      const totalData = [];
      data.forEach((doc) => {
        totalData.push(doc.data());
      });
      for (let i = 0; i < totalData.length; i++) {
        const betsID = totalData[i].bets_id;
        const gameID = totalData[i].radar_id;
        const gameTime = totalData[i].scheduled * 1000;
        const nowTime = Date.now();
        const eventStatus = totalData[i].flag.status;
        switch (eventStatus) {
          case 2: {
            if (gameTime <= nowTime) {
              try {
                const realtimeData = await database
                  .ref(`baseball/MLB/${betsID}`)
                  .once('value')
                  .val();
                const inningsNow = 0;
                const halfNow = 0;
                const eventHalfNow = 0;
                const eventAtbatNow = 0;
                const parameter = {
                  gameID: gameID,
                  betsID: betsID,
                  inningsNow: inningsNow,
                  halfNow: halfNow,
                  eventHalfNow: eventHalfNow,
                  eventAtbatNow: eventAtbatNow,
                  realtimeData: realtimeData
                };
                await MLBpbpInplay(parameter);
              } catch (err) {
                return reject(
                  new AppErrors.PBPMLBError(
                    `${err} at checkmatch_MLB of MLBpbpInplay by DY`
                  )
                );
              }
            } else {
              try {
                await database
                  .ref(`baseball/MLB/${betsID}/Summary/status`)
                  .set('scheduled');
              } catch (err) {
                return reject(
                  new AppErrors.FirebaseRealtimeError(
                    `${err} at checkmatch_MLB of MLBpbpInplay by DY`
                  )
                );
              }
            }
            break;
          }
          case 1: {
            try {
              const realtimeData = await database
                .ref(`baseball/MLB/${betsID}`)
                .once('value')
                .val();
              if (realtimeData.Summary.status === 'created') {
                const inningsNow = 0;
                const halfNow = 0;
                const eventHalfNow = 0;
                const eventAtbatNow = 0;
                const parameter = {
                  gameID: gameID,
                  betsID: betsID,
                  inningsNow: inningsNow,
                  halfNow: halfNow,
                  eventHalfNow: eventHalfNow,
                  eventAtbatNow: eventAtbatNow,
                  realtimeData: realtimeData
                };
                try {
                  await MLBpbpInplay(parameter);
                } catch (err) {
                  return reject(
                    new AppErrors.PBPMLBError(
                      `${err} at checkmatch_MLB of MLBpbpInplay by DY`
                    )
                  );
                }
              }
              if (realtimeData.Summary.status === 'closed') {
                const parameter = {
                  gameID: gameID,
                  betsID: betsID,
                  scheduled: gameTime
                };
                try {
                  await MLBpbpHistory(parameter);
                } catch (err) {
                  return reject(
                    new AppErrors.PBPMLBError(
                      `${err} at checkmatch_MLB of MLBpbpHistory by DY`
                    )
                  );
                }
              }

              if (
                realtimeData.Summary.status === 'inprogress' ||
                realtimeData.Summary.status === 'complete'
              ) {
                const inningsNow = Object.keys(realtimeData.PBP).length - 1;
                const inningsName = Object.keys(realtimeData.PBP);
                const halfNow =
                  Object.keys(realtimeData.PBP[inningsName[inningsNow]])
                    .length - 1;
                const halfName = Object.keys(
                  realtimeData.PBP[inningsName[inningsNow]]
                );
                const eventHalfNow =
                  Object.keys(
                    realtimeData.PBP[inningsName[inningsNow]][halfName[halfNow]]
                  ).length - 2;
                const eventHalfName = Object.keys(
                  realtimeData.PBP[inningsName[inningsNow]][halfName[halfNow]]
                );
                if (eventHalfNow < 0) {
                  // means ９局下半沒有打
                  const parameter = {
                    gameID: gameID,
                    betsID: betsID,
                    inningsNow: inningsNow,
                    halfNow: halfNow,
                    eventHalfNow: 0,
                    eventAtbatNow: 0
                  };
                  try {
                    await MLBpbpInplay(parameter);
                  } catch (err) {
                    return reject(
                      new AppErrors.PBPMLBError(
                        `${err} at checkmatch_MLB of MLBpbpInplay by DY`
                      )
                    );
                  }
                } else {
                  const lineChangeOrAtbat = Object.keys(
                    realtimeData.PBP[inningsName[inningsNow]][
                      halfName[halfNow]
                    ][eventHalfName[eventHalfNow]]
                  );
                  let eventAtbatNow;
                  if (lineChangeOrAtbat[0] === 'lineup') {
                    eventAtbatNow = 0;
                  }
                  if (lineChangeOrAtbat[0] === 'at_bat') {
                    eventAtbatNow =
                      Object.keys(
                        realtimeData.PBP[inningsName[inningsNow]][
                          halfName[halfNow]
                        ][eventHalfName[eventHalfNow]][lineChangeOrAtbat[0]]
                      ).length - 2;
                  }
                  const parameter = {
                    gameID: gameID,
                    betsID: betsID,
                    inningsNow: inningsNow,
                    halfNow: halfNow,
                    eventHalfNow: eventHalfNow,
                    eventAtbatNow: eventAtbatNow
                  };
                  try {
                    await MLBpbpInplay(parameter);
                  } catch (err) {
                    return reject(
                      new AppErrors.PBPMLBError(
                        `${err} at checkmatch_MLB of MLBpbpInplay by DY`
                      )
                    );
                  }
                }
              }
            } catch (err) {
              return reject(
                new AppErrors.FirebaseRealtimeError(
                  `${err} at checkmatch_MLB of realtimedata by DY`
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
      return reject(new AppErrors.AxiosError(`${err} at checkmatch_MLB by DY`));
    }
  });
}

module.exports = checkmatch_MLB;
