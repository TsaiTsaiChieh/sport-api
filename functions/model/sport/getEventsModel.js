const modules = require('../../util/modules');

function getEvents(args) {
  return new Promise(async function(resolve, reject) {
    try {
      // this example is soccer(1) all leagues
      const { data } = await modules.axios(
        'https://betsapi.com/api-doc/samples/bet365_upcoming.json'
      );
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
    console.log(ele);
  });
  return data;
}
module.exports = getEvents;
