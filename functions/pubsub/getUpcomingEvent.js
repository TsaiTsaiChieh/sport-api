/* eslint-disable no-await-in-loop */
const modules = require('../util/modules');
// dummy data
const data = require('./upcoming_baseketball.json');
const upcomingURL = 'https://api.betsapi.com/v2/events/upcoming';
const oddsURL = 'https://api.betsapi.com/v2/event/odds';
const token = '35388-8IqMa0NK19LJVY';
async function getUpcomingEvent(req, res) {
  // const sport_ids = [];
  let result = await getUpcomingSportEvent();
  console.log(result);
  res.json(result);
}

async function getUpcomingSportEvent(sport_ids) {
  try {
    // let date = '20200109';
    // tomorrow
    let date = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, '');

    let sport_id = 18;
    // NBA(2274), SBL(8251), WNBA(244), NBL(1714), CBA(2319), KBL(2148), JBL
    let league_id = [2274, 8251, 244, 1714, 2319, 2148, 1298, 1543, 2630];
    // const { data } = await modules.axios(
    //   `${upcomingURL}?token=${token}&sport_id=${sport_id}&league_id=${league_id}&day=${date}&page=1`
    // );
    let events = [];
    // league loop
    for (let i = 0; i < league_id.length; i++) {
      let { data } = await modules.axios(
        `${upcomingURL}?token=${token}&sport_id=${sport_id}&league_id=${league_id[i]}&day=${date}&page=1`
      );
      events.push(data.results);
      // page loop
      totalPage = Math.ceil(data.pager.total / data.pager.per_page);
      if (totalPage > 1)
        for (let j = 2; j <= totalPage; j++) {
          data = await modules.axios(
            `${upcomingURL}?token=${token}&sport_id=${sport_id}&league_id=${league_id[i]}&day=${date}&page=${j}`
          );
          events.push(data.results);
        }
    }

    const body = {};
    // body.pager = data.pager;
    let result = repackage(events);
    for (let i = 0; i < events.length; i++) {
      let ele = events[i];
      modules.firebase
        .collection('sport_test')
        .doc(ele.sport_id)
        .collection(ele.league_id)
        .doc(ele.id)
        .set(ele);
    }
    // console.log(
    //   `${upcomingURL}?token=${token}&sport_id=${sport_id}&league_id=${league_id}&day=${date}`
    // );
    return events;
  } catch (error) {
    console.log(
      'error happened in updateUpcomingEvent axios function by Tsai-Chieh',
      error
    );
  }
}

function repackage(data) {
  data.forEach(function(ele) {
    if (ele.time_stats) delete ele.time_stats;
    if (!ele.ss) delete ele.ss; // ss always null
  });
  return data;
}
module.exports = getUpcomingEvent;
