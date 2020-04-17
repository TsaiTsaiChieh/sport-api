const modules = require('../util/modules');

async function inserttest() {
  let realtimeData;
  realtimeData = JSON.parse(
    JSON.stringify(
      // eslint-disable-next-line no-await-in-loop
      await modules.database.ref(`baseball/MLB/20200501`).once('value')
    )
  );

  let ref = modules.database.ref(`baseball/MLB/20200318`);
  await ref.set(realtimeData);
  ref = modules.database.ref(`baseball/MLB/20200319`);
  await ref.set(realtimeData);
  ref = modules.database.ref(`baseball/MLB/20200320`);
  await ref.set(realtimeData);
  console.log('ok');
}
inserttest();
