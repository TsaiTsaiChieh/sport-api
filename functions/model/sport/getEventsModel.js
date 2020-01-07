const modules = require('../../util/modules');

function getEvents(args) {
  return new Promise(async function(resolve, reject) {
    try {
      // this example is soccer(1) all leagues
      const { data } = await modules.axios(
        // 'https://betsapi.com/api-doc/samples/bet365_upcoming.json'
        `https://api.betsapi.com/v2/events/upcoming?token=35388-8IqMa0NK19LJVY&sport_id=${args.sport_id}&LNG_ID=2&league_id=${args.league_id}&page=${args.page}&day=${args.date}`
      );
      // console.log(args.league_id);

      const battles = repackage(data.results);
      const body = {};
      body.pager = data.pager;
      body.battles = battles;

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
function repackage(data) {
  data.forEach(function(ele) {
    if (ele.time_status) delete ele.time_status;
    if (!ele.ss) delete ele.ss; // ss always null
    // console.log(ele);
  });
  return data;
}
module.exports = getEvents;
