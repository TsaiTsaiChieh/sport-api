const modules = require("../util/modules");

const pbpNBA = require("./pbpNBA.js");
async function checkmatch(req, res) {
  //read event information from firestore
  var data = await modules.firestore.collection("test_basketball").get();
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
    var gameID = totalData[i].id;

    var gameTime = totalData[i].scheduleTime._seconds * 1000;
    var nowTime = Date.now();
    //event status 0:history 1:now 2:future
    if (totalData[i].flag.status === 1) {
      // check the periods and event in firebase realtime database now
      var realtimeData;
      realtimeData = JSON.parse(
        JSON.stringify(
          // eslint-disable-next-line no-await-in-loop
          await modules.database.ref(`basketball/NBA/${gameID}`).once("value")
        )
      );
      //   eslint-disable-next-line no-await-in-loop

      var periodsNow = Object.keys(realtimeData.periods).length - 1; //how much periods
      var periodName = Object.keys(realtimeData.periods);
      var eventNow =
        Object.keys(realtimeData.periods[periodName[periodsNow]]).length - 1;

      pbpNBA(gameID, periodsNow, eventNow);

      //pbpNBA();
    }
    if (totalData[i].flag.status === 2) {
      if (gameTime <= nowTime) {
        // eslint-disable-next-line no-await-in-loop
        //change the status to 1
        //pbpNBA();
        // modules.firestore
        //   .collection("test_basketball")
        //   .doc(gameID)
        //   .set({ flag: { status: 1 } }, { merge: true });
      }
    }
  }

  res.json(realtimeData);
}

module.exports = checkmatch;
