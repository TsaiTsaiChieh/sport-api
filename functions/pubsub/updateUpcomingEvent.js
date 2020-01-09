const modules = require('../util/modules');

const upcomingURL = 'https://api.betsapi.com/v2/events/upcoming';
const oddsURL = 'https://api.betsapi.com/v2/event/odds';
const token = '35388-8IqMa0NK19LJVY';
async function updateUpcomingEvent(req, res) {
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
    let league_id = 2274;
    const { data } = await modules.axios(
      `${upcomingURL}?token=${token}&sport_id=${sport_id}&league_id=${league_id}&day=${date}`
    );
    const body = {};
    body.pager = data.pager;
    body.events = repackage(data.results);
    return body;
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
module.exports = updateUpcomingEvent;
