const modules = require("../util/modules");
const NBApbp = require("./pbpNBA.js");
const NBApbpInplay = NBApbp.NBApbpInplay;
const NBApbpHistory = NBApbp.NBApbpHistory;
const timesPerLoop = 11;
const firestoreName = "test_basketball";
async function checkmatch(req, res) {
  //read event information from firestore
  var data = await modules.firestore.collection(firestoreName).get();
  var totalData = [];
  data.forEach(doc => {
    totalData.push(doc.data());
  });

  //the time show on front-end
  //   var gameTimeTaipei = new Date(
  //     totalData[0].scheduleTime._seconds * 1000
  //   ).toString();
  //   var nowTimeTaipei = new Date(Date.now()).toString();

  // realtime database write
  //var data2 = await modules.database.ref("sportlottery-test");
  //   modules.database.ref(gameID).set({
  //     username: "123"
  //   });

  // 所有賽事判斷

  for (var i = 0; i < totalData.length; i++) {
    var betsID = totalData[i].bets_id;
    var gameID = totalData[i].radar_id;

    var gameTime = totalData[i].scheduled._seconds * 1000;
    var nowTime = Date.now();
    //event status 0:history 1:now 2:future
    var eventStatus = totalData[i].flag.status;
    if (eventStatus === 1) {
      // check the periods and event in firebase realtime database now
      var realtimeData;
      realtimeData = JSON.parse(
        JSON.stringify(
          // eslint-disable-next-line no-await-in-loop
          await modules.database.ref(`basketball/NBA/${gameID}`).once("value")
        )
      );

      var periodsNow = Object.keys(realtimeData.periods).length - 1; //how much periods
      var periodName = Object.keys(realtimeData.periods);
      var eventNow =
        Object.keys(realtimeData.periods[periodName[periodsNow]]).length - 1;

      //write to the firebase realtime
      var status = realtimeData.status;
      if (status === "closed") {
        NBApbpHistory(gameID, betsID);
        modules.firestore
          .collection(firestoreName)
          .doc(betsID)
          .set({ flag: { status: 0 } }, { merge: true });
      } else {
        var countForStatus = 0;
        // eslint-disable-next-line no-loop-func
        var timerForStatus = setInterval(async function() {
          [periodsNow, eventNow] = await NBApbpInplay(
            gameID,
            betsID,
            periodsNow,
            eventNow
          );
          countForStatus = countForStatus + 1;
          if (countForStatus >= timesPerLoop) {
            clearInterval(timerForStatus);
          }
        }, 5000);
      }
    }
    if (eventStatus === 2) {
      if (gameTime <= nowTime) {
        // change the status to 1
        modules.firestore
          .collection(firestoreName)
          .doc(betsID)
          .set({ flag: { status: 1 } }, { merge: true });
        // write to firebase realtime

        periodsNow = 0;
        eventNow = 0;
        var countForStatus2 = 0;

        // eslint-disable-next-line no-loop-func
        var timerForStatus2 = setInterval(async function() {
          [periodsNow, eventNow] = await NBApbpInplay(
            gameID,
            betsID,
            periodsNow,
            eventNow
          );
          countForStatus2 = countForStatus2 + 1;

          if (countForStatus2 >= timesPerLoop) {
            clearInterval(timerForStatus2);
          }
        }, 5000);
      }
    }
  }
  //res.json(realtimeData);
  res.json({ process: "success" });
}

module.exports = checkmatch;
