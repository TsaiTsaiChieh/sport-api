const modules = require('../util/modules');

inserttest();

async function inserttest() {
  let realtimeData = await modules.database
    .ref('esports/eSoccer/2336641')
    .once('value');
  realtimeData = realtimeData.val();
  console.log(realtimeData);
}
