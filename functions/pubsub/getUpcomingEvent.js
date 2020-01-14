/* eslint-disable no-await-in-loop */
const modules = require('../util/modules');
// dummy data
// const data = require('./upcoming_baseketball.json');
const upcomingURL = 'https://api.betsapi.com/v2/events/upcoming';
// const oddsURL = 'https://api.betsapi.com/v2/event/odds';
const token = modules.betsToken;
// async function getUpcomingEvent(req, res) {
async function getUpcomingEvent() {
  const sport_id = 18;
  const baseketball_leagues = [
    2274, // NBA
    8251, // SBL
    244, // WNBA
    1714, // NBL
    2319, // CBA
    2148, // KBL
    1298, // JBL
    1543,
    2630
  ];
  let result = await getUpcomingSportEvent(sport_id, baseketball_leagues);
  console.log(result);
  // res.json(result);
  return result;
}

async function getUpcomingSportEvent(sport_id, league_ids) {
  try {
    // tomorrow
    let date = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, '');
    let events = [];
    // for real data
    // league loop
    for (let i = 0; i < league_ids.length; i++) {
      let { data } = await modules.axios(
        `${upcomingURL}?token=${token}&sport_id=${sport_id}&league_id=${league_ids[i]}&day=${date}&page=1`
      );
      pushData(events, data.results);
      // page loop
      totalPage = Math.ceil(data.pager.total / data.pager.per_page);
      if (totalPage > 1)
        for (let j = 2; j <= totalPage; j++) {
          data = await modules.axios(
            `${upcomingURL}?token=${token}&sport_id=${sport_id}&league_id=${league_ids[i]}&day=${date}&page=${j}`
          );
          pushData(data.results);
        }
    }

    events = repackage(events);
    for (let i = 0; i < events.length; i++) {
      let ele = events[i];
      // insert data time
      ele.addTime = modules.firebaseAdmin.firestore.Timestamp.now();
      // event start time
      ele.time = modules.firebaseAdmin.firestore.Timestamp.fromDate(
        new Date(Number.parseInt(ele.time) * 1000)
      );
      // handicap flag
      ele.handicapFlag = 0;

      // event status: end(0), inplay(1), upcoming(2)
      ele.status = 2;
      await modules.firestore
        .collection(modules.db.sport_18)
        .doc(ele.id)
        .set(ele, { merge: true });
    }
    // return events;
    const message = `URL: ${upcomingURL}?token=${token}&sport_id=${sport_id}&league_id=${league_ids[0]}&day=${date}, get incoming events in ${modules.db.sport_18} successful by Tsai-Chieh`;
    return message;

    // for dummy data
    // for (let i = 0; i < data.results.length; i++) {
    //   events.push(data.results[i]);
    // }
    // events = repackage(events);
    // for (let i = 0; i < events.length; i++) {
    //   let ele = events[i];
    //   ele.time = modules.firebaseAdmin.firestore.Timestamp.fromDate(
    //     new Date(Number.parseInt(ele.time) * 1000)
    //   );
    //   // event status: end(0), inplay(1), upcoming(2)
    //   ele.status = 2;

    //   await modules.firestore
    //     .collection(modules.db.sport_18)
    //     .doc(ele.id)
    //     .set(ele, { merge: true });
    // }
    // return events;
  } catch (error) {
    console.log(
      'error happened in getUpcomingEvent axios function by Tsai-Chieh',
      error
    );
    return error;
  }
}
function pushData(events, data) {
  if (data.length !== 0) {
    data.forEach(function(ele) {
      events.push(ele);
    });
  }
}
function repackage(data) {
  data.forEach(function(ele) {
    if (ele.time_status) delete ele.time_status;
    if (!ele.ss) delete ele.ss; // ss always null
  });
  return data;
}
module.exports = getUpcomingEvent;
