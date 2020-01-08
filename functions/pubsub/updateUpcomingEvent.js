const modules = require('../util/modules');

const upcomingURL = 'https://api.betsapi.com/v2/events/upcoming';
const oddsURL = 'https://api.betsapi.com/v2/event/odds';
const token = '35388-8IqMa0NK19LJVY';
function updateUpcomingEvent() {
  const sport_ids = [];
}

async function getUpcomingSportEvent(sport_ids) {
  try {
    let date = '20200108';
    let sport_id = 18;
    let league_id = 2274;
    const { data } = await modules.axios(
      `${upcomingURL}?token=${token}&sport_id=${sport_id}&league_id=${league_id}&day=${date}`
    );
    console.log(data);
  } catch (error) {
    console.log(
      'error happened in updateUpcomingEvent axios function by Tsai-Chieh',
      error
    );
  }
}
module.exports = updateUpcomingEvent;
