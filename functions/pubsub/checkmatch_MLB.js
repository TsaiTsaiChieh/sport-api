const modules = require('../util/modules');

const MLBpbp = require('./pbpMLB.js');
const MLBpbpInplay = MLBpbp.MLBpbpInplay;
const MLBpbpHistory = MLBpbp.MLBpbpHistory;

async function checkmatch_MLB() {
  const firestoreName = 'pagetest_MLB';

  let data = await modules.firestore.collection(firestoreName).get();
  let totalData = [];
  data.forEach(doc => {
    totalData.push(doc.data());
  });

  //event
  for (let i = 0; i < totalData.length; i++) {
    let betsID = totalData[i].bets_id;
    let gameID = totalData[i].radar_id;
    let gameTime = totalData[i].scheduled._seconds * 1000;
    let nowTime = Date.now();

    //event status 0:history 1:now 2:future
    let eventStatus = totalData[i].flag.status;
    if (eventStatus === 1) {
      let realtimeData;
      realtimeData = JSON.parse(
        JSON.stringify(
          // eslint-disable-next-line no-await-in-loop
          await modules.database.ref(`baseball/MLB/${betsID}`).once('value')
        )
      );

      // from the begining
      if (realtimeData.Summary.status === 'created') {
        let inningsNow = 0; // 0 ~ 10
        let halfNow = 0; // 0 ~ 1
        let eventHalfNow = 0; // 0 ~ x
        let eventAtbatNow = 0; // 0 ~ x
        let parameter = {
          gameID: gameID,
          betsID: betsID,
          inningsNow: inningsNow,
          halfNow: halfNow,
          eventHalfNow: eventHalfNow,
          eventAtbatNow: eventAtbatNow
        };
        MLBpbpInplay(parameter);
      }
      if (
        realtimeData.Summary.status === 'closed' ||
        realtimeData.Summary.status === 'complete'
      ) {
        let parameter = {
          gameID: gameID,
          betsID: betsID,
          scheduled: gameTime
        };
        MLBpbpHistory(parameter);
      }

      if (realtimeData.Summary.status === 'inprogress') {
        let inningsNow = Object.keys(realtimeData.PBP).length - 1;
        let inningsName = Object.keys(realtimeData.PBP);
        let halfNow =
          Object.keys(realtimeData.PBP[inningsName[inningsNow]]).length - 1;
        let halfName = Object.keys(realtimeData.PBP[inningsName[inningsNow]]);
        let eventHalfNow =
          Object.keys(
            realtimeData.PBP[inningsName[inningsNow]][halfName[halfNow]]
          ).length - 2;
        let eventHalfName = Object.keys(
          realtimeData.PBP[inningsName[inningsNow]][halfName[halfNow]]
        );
        if (eventHalfNow < 0) {
          //means ９局下半沒有打
          let parameter = {
            gameID: gameID,
            betsID: betsID,
            inningsNow: inningsNow,
            halfNow: halfNow,
            eventHalfNow: 0,
            eventAtbatNow: 0
          };
          MLBpbpInplay(parameter);
        } else {
          let lineChangeOrAtbat = Object.keys(
            realtimeData.PBP[inningsName[inningsNow]][halfName[halfNow]][
              eventHalfName[eventHalfNow]
            ]
          );
          let eventAtbatNow;
          if (lineChangeOrAtbat[0] === 'lineup') {
            eventAtbatNow = 0;
          }
          if (lineChangeOrAtbat[0] === 'at_bat') {
            eventAtbatNow =
              Object.keys(
                realtimeData.PBP[inningsName[inningsNow]][halfName[halfNow]][
                  eventHalfName[eventHalfNow]
                ][lineChangeOrAtbat[0]]
              ).length - 2;
          }
          let parameter = {
            gameID: gameID,
            betsID: betsID,
            inningsNow: inningsNow,
            halfNow: halfNow,
            eventHalfNow: eventHalfNow,
            eventAtbatNow: eventAtbatNow
          };

          MLBpbpInplay(parameter);
        }
      }
    }

    if (eventStatus === 2) {
      // 第一次 or 特殊情況處理
      if (gameTime <= nowTime) {
        let inningsNow = 0; // 0 ~ 10
        let halfNow = 0; // 0 ~ 1
        let eventHalfNow = 0; // 0 ~ x
        let eventAtbatNow = 0; // 0 ~ x
        let parameter = {
          gameID: gameID,
          betsID: betsID,
          inningsNow: inningsNow,
          halfNow: halfNow,
          eventHalfNow: eventHalfNow,
          eventAtbatNow: eventAtbatNow
        };
        MLBpbpInplay(parameter);
      }
    }
  }
  //res.send("ok");
}

module.exports = checkmatch_MLB;
