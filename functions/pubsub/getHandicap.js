/* eslint-disable promise/catch-or-return */
/* eslint-disable promise/always-return */
const modules = require('../util/modules');
const oddsSummaryURL = 'https://api.betsapi.com/v2/event/odds/summary';
const intervals = [16, 10, 8, 6];
// async function main(req, res) {
async function main() {
  try {
    // updateEvent();
    const eventsRef = modules.firestore.collection(modules.db.sport_18);
    const spreadQuery = await eventsRef.where('spreadFlag', '==', 0).get();
    spreadQuery.forEach(function(docs) {
      let ele = docs.data();
      // console.log('p1', ele.id);
      timer(ele);
    });
    // for just update spread, but totals data not exists
    setTimeout(async function() {
      const totalsQuery = await eventsRef
        .where('spreadFlag', '==', 1)
        .where('totalsFlag', '==', 0)
        .get();
      totalsQuery.forEach(function(docs) {
        let ele = docs.data();
        // console.log('p2', ele.id);
        timer(ele);
      });
      // res.json('successful');
    }, 10000);
    return 0;
  } catch (error) {
    console.log('error happened in getHandicap function by Tsai-Chieh', error);
    return error;
  }
}

function timer(ele) {
  let diff = (ele.time._seconds * 1000 - Date.now()) / (1000 * 60 * 60);
  // console.log('diff:', diff, ele.id);

  const eventSnapshot = modules.getDoc(modules.db.sport_18, ele.id);
  eventSnapshot.set({ totalsFlag: 0 }, { merge: true });
  if (
    intervals[1] <= diff &&
    diff <= intervals[0] &&
    ele.intervalStatus === 0
  ) {
    // console.log(`${intervals[0]} - ${intervals[1]}`, diff, ele.id);
    getHandicap(ele, 1);
  } else if (
    intervals[2] <= diff &&
    diff <= intervals[1] &&
    ele.intervalStatus === 1
  ) {
    // console.log(`${intervals[1]} - ${intervals[2]}`, diff, ele.id);
    getHandicap(ele, 2);
  } else if (diff <= intervals[3] && ele.intervalStatus === 2) {
    // console.log(`< ${intervals[3]}`);
    getHandicap(ele, 3, diff, ele.id);
  }
}

async function getHandicap(ele, intervalStatus) {
  const eventSnapshot = modules.getDoc(modules.db.sport_18, ele.id);
  const { data } = await modules.axios(
    `${oddsSummaryURL}?token=${modules.betsToken}&event_id=${ele.id}`
  );
  // eventSnapshot.set({ totalsFlag: 0 }, { merge: true });
  // eventSnapshot.update({ intervalStatus });
  // if no data, the data.results will be { }
  if (data.results.Bet365) {
    const odds = data.results.Bet365.odds.start;
    if (odds['18_2']) {
      const spread = {};
      spread.id = odds['18_2'].id;
      spread.handicap = Number.parseFloat(odds['18_2'].handicap);
      spread.addTime = Number.parseInt(odds['18_2'].add_time);
      spread.insertTime = Date.now();
      eventSnapshot.set({ spreadFlag: 1, spread }, { merge: true });
    }
    if (odds['18_3']) {
      const totals = {};
      totals.id = odds['18_3'].id;
      totals.handicap = Number.parseFloat(odds['18_3'].handicap);
      totals.addTime = Number.parseInt(odds['18_3'].add_time);
      totals.insertTime = Date.now();
      eventSnapshot.set({ totalsFlag: 1, totals }, { merge: true });
      console.log(
        `Get handicaps for event ${
          ele.id
        } successful at ${Date.now()}(${intervalStatus})`
      );
    }
  }
  // else do nothing
}
async function updateEvent() {
  let events = [];
  const eventsRef = await modules.firestore
    .collection(modules.db.sport_18)
    .get();
  eventsRef.docs.forEach(async function(doc) {
    events.push(doc.data().id);
  });
  for (let i = 0; i < events.length; i++) {
    const eventSnapshot = modules.getDoc(modules.db.sport_18, events[i]);
    // delete field
    // eventSnapshot.update({
    //   handicapFlag: modules.firebaseAdmin.firestore.FieldValue.delete()
    // });
    eventSnapshot.set(
      { spreadFlag: 0, totalsFlag: 0, intervalStatus: 0 },
      { merge: true }
    );
  }
}
module.exports = main;
