/* eslint-disable no-await-in-loop */
const modules = require('../../util/modules');

const upcomingURL = 'https://api.betsapi.com/v2/events/upcoming';
const oddsURL = 'https://api.betsapi.com/v2/event/odds';
const token = '35388-8IqMa0NK19LJVY';

function getEvents(args) {
  return new Promise(async function(resolve, reject) {
    try {
      // this example is soccer(1) all leagues
      const { data } = await modules.axios(
        // 'https://betsapi.com/api-doc/samples/bet365_upcoming.json'
        `${upcomingURL}?token=${token}&sport_id=${args.sport_id}&league_id=${args.league_id}&page=${args.page}&day=${args.date}`
      );
      const battles = repackage(data.results);

      const body = {};
      body.pager = data.pager;
      body.battles = battles;
      for (let i = 0; i < battles.length; i++) {
        let eventId = battles[i].id;
        body.battles[i].odds = await oddsData(eventId);
      }
      for (let i = 0; i < battles.length; i++) {
        modules.firestore
          .collection('sport_events')
          .doc(battles[i].sport_id)
          .collection(battles[i].league.id)
          .doc(body.battles[i].id)
          .set(body.battles[i]);
      }
      resolve(body);
    } catch (error) {
      console.log(
        'error happened in getEventsModel axios function by Tsai-Chieh',
        error
      );
      reject({ code: 500, error });
    }
  });
}

async function oddsData(eventId) {
  const { data } = await modules.axios(
    `${oddsURL}?token=${token}&event_id=${eventId}&source=bet365&odds_market=2,3`
  );

  body = {};
  // detect {} empty object
  if (Object.keys(data.results.odds).length !== 0) {
    let spread = data.results.odds['18_2'][0].handicap; // 讓分（index 0 的時間最新）
    let totals = data.results.odds['18_3'][0].handicap; // 大小分（index 0 的時間最新）
    if (spread) body.spread = Number.parseFloat(spread);
    if (totals) body.totals = Number.parseFloat(totals);
  }
  return body;
}
function repackage(data) {
  data.forEach(function(ele) {
    if (ele.time_status) delete ele.time_status;
    if (!ele.ss) delete ele.ss; // ss always null
  });
  return data;
}
module.exports = getEvents;