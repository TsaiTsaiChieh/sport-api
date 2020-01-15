const modules = require('../util/modules');
const oddsSummaryURL = 'https://api.betsapi.com/v2/event/odds/summary';
const intervals = [16, 10, 8, 6];
// async function main(req, res) {
async function main() {
  try {
    // updateEvent();
    const eventsRef = modules.firestore.collection(modules.db.sport_18);
    // should change to 0 after testing
    const spreadQuery = await eventsRef.where('spreadFlag', '==', 0).get();
    spreadQuery.forEach(async function(docs) {
      let ele = docs.data();
      timer(ele);
    });
    const totalsQuery = await eventsRef.where('totalsFlag', '==', 0).get();
    totalsQuery.forEach(async function(docs) {
      let ele = docs.data();
      timer(ele);
    });

    // res.json('successful');
    return 0;
  } catch (error) {
    console.log('error happened in getHandicap function by Tsai-Chieh', error);
    return error;
  }
}

function timer(ele) {
  let diff = (ele.time._seconds * 1000 - Date.now()) / (1000 * 60 * 60);
  // console.log('diff:', diff, ele.id);
  // if (diff < 0)
  if (
    intervals[1] <= diff &&
    diff <= intervals[0] &&
    ele.intervalStatus === 0
  ) {
    console.log('16 - 10');
    getHandicap(ele, 1);
  } else if (
    intervals[2] <= diff &&
    diff <= intervals[1] &&
    ele.intervalStatus === 1
  ) {
    console.log('10 - 8');
    getHandicap(ele, 2);
  } else if (diff <= intervals[3] && ele.intervalStatus === 2) {
    console.log(`< ${intervals[3]}`);
    getHandicap(ele, 3);
  }
}

async function getHandicap(ele, intervalStatus) {
  const eventSnapshot = modules.getDoc(modules.db.sport_18, ele.id);
  const { data } = await modules.axios(
    `${oddsSummaryURL}?token=${modules.betsToken}&event_id=${ele.id}`
  );
  eventSnapshot.update({ intervalStatus });
  // if no data, the data.results will be { }
  if (data.results) {
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
