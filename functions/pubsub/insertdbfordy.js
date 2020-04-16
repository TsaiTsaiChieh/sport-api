const modules = require('../util/modules');

async function inserttest() {
  let realtimeData;
  realtimeData = JSON.parse(
    JSON.stringify(
      // eslint-disable-next-line no-await-in-loop
      await modules.database.ref(`basketball/NBA/20200501`).once('value')
    )
  );

  // let ref = modules.database.ref(`basketball/NBA/2120646`);
  // await ref.set(realtimeData);
  // ref = modules.database.ref(`basketball/NBA/2120647`);
  // await ref.set(realtimeData);
  // ref = modules.database.ref(`basketball/NBA/2121183`);
  // await ref.set(realtimeData);
  console.log('ok');
}
inserttest();
