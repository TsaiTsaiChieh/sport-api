const modules = require('../util/modules');
const transNBA = require('./translateNBA.js');
const translateNBA = transNBA.translateNBA;
async function inserttest() {
  let realtimeData;
  realtimeData = JSON.parse(
    JSON.stringify(
      // eslint-disable-next-line no-await-in-loop
      await modules.database
        .ref(`baseball/MLB/20200501/Summary/info`)
        .once('value')
    )
  );
  let homeData = realtimeData.home;
  let awayData = realtimeData.away;

  console.log(homeData.roster[Object.keys(homeData.roster)[0]].name);
}
inserttest();
