const modules = require("../util/modules");
const NBApbp = require("./pbpNBA.js");
const NBApbpInplay = NBApbp.NBApbpInplay;
const NBApbpHistory = NBApbp.NBApbpHistory;
const timesPerLoop = 11;
const firestoreName = "basketball_page";
async function checkmatch(req, res) {
  //read event information from firestore
  let data = await modules.firestore.collection(firestoreName).get();
  let totalData = [];
  data.forEach(doc => {
    totalData.push(doc.data());
  });

  //the time show on front-end
  //   let gameTimeTaipei = new Date(
  //     totalData[0].scheduleTime._seconds * 1000
  //   ).toString();
  //   let nowTimeTaipei = new Date(Date.now()).toString();

  // 所有賽事判斷

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
          await modules.database.ref(`basketball/NBA/${betsID}`).once("value")
        )
      );
      let periodsNow;
      let periodName;
      let eventNow;
      let status;

      if (realtimeData) {
        periodsNow = Object.keys(realtimeData).length - 1; //how much periods
        periodName = Object.keys(realtimeData);
        eventNow = Object.keys(realtimeData[periodName[periodsNow]]).length - 1;
        status = realtimeData.status;
      } else {
        periodsNow = 0; //realtime database has no data
        periodName = "periods0";
        eventNow = 0;
        status = "inprogress";
      }
      console.log(status);

      //write to the firebase realtime

      if (status === "closed" || status === "complete") {
        // eslint-disable-next-line no-await-in-loop
        await NBApbpHistory(gameID, betsID);
      } else {
        // eslint-disable-next-line no-await-in-loop
        await NBApbpInplay(gameID, betsID, periodsNow, eventNow);
      }
    }
    if (eventStatus === 3) {
      if (gameTime <= nowTime) {
        // write to firebase realtime
        periodsNow = 0;
        eventNow = 0;
        // eslint-disable-next-line no-await-in-loop
        await NBApbpInplay(gameID, betsID, periodsNow, eventNow);
      }
    }
  }
  //res.json(realtimeData);
  res.json({ process: "success" });
}

module.exports = checkmatch;
