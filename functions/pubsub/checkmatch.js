const modules = require("../util/modules");
// const pbpNBA = require("./pbpNBA.js");
const nba_api_key = "y7uxzm4stjju6dmkspnabaav";

var gameID = "e253238c-2eac-4749-b28e-9cde1aed0303";
var scheduleTime = "2020-02-18T09:21:00+00:00";
// const express = require("express");
// const router = express();
// router.get("/test", async (req, res) => {
//   const ele = await modules.firestore.collection(modules.db.sport_18).get();
//   const totalData = [];
//   ele.forEach(doc => {
//     totalData.push(doc.data());
//   });
//   //   for (var i = 0; i < totalData.length(); i++) {
//   //     console.log(Date(totalData[i].scheduled._seconds));
//   //   }
//   res.json(totalData.length());
// });

async function checkmatch() {
  console.log("testmessage");

  // read the firestore's radar_basketball
  //   let ele = await modules.firestore.collection(modules.db.sport_18).get();
  var scheduleTime = "2020-02-20T09:35:00+00:00";
  var scheduleYear = parseInt(scheduleTime.substring(0, 4));
  var scheduleMonth = parseInt(scheduleTime.substring(5, 7));
  var scheduleDay = parseInt(scheduleTime.substring(8, 10));
  var scheduleHour = parseInt(scheduleTime.substring(11, 13));
  var scheduleMinute = parseInt(scheduleTime.substring(14, 16));
  var scheduleSecond = parseInt(scheduleTime.substring(17, 19));
  scheduleMonth = scheduleMonth - 1;

  var date = new Date(
    scheduleYear,
    scheduleMonth,
    scheduleDay,
    scheduleHour,
    scheduleMinute,
    scheduleSecond
  );
  var date2 = new Date(
    scheduleYear,
    scheduleMonth,
    scheduleDay,
    scheduleHour,
    scheduleMinute + 10,
    scheduleSecond
  );

  modules.nodeSchedule.scheduleJob(date, function() {
    console.log("scheduled test");
    modules.firestore
      .collection("pagetest")
      .doc("123")
      .set({ test: "loki4316" }, { merge: true });
  });
  modules.nodeSchedule.scheduleJob(date2, function() {
    console.log("scheduled test");
    modules.firestore
      .collection("pagetest")
      .doc("123")
      .set({ test2: "jecica196" }, { merge: true });
  });
  console.log("schedule suceess");
}

// module.exports = router;
module.exports = checkmatch;
// exports.api2 = functions.https.onRequest(checkmatch);
