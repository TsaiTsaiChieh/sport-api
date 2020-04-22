const modules = require('../util/modules');

async function inserttest () {
  const realtimeData = JSON.parse(
    JSON.stringify(
      // eslint-disable-next-line no-await-in-loop
      await modules.database.ref('baseball/MLB/20200501').once('value')
    )
  );

  const ref = modules.database.ref('baseball/MLB/20200321');
  await ref.set(realtimeData);

  console.log('ok');
}
inserttest();
