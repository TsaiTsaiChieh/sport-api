const modules = require('../util/modules');
let firestoreName = 'pagetest_MLB';
async function inserttest() {
  let ref = modules.database.ref(`basketball/NBA/2120646/Summary`);
  await ref.set({
    Now_clock: '6:20',
    Now_periods: '0',
    info: {
      away: { Total: { points: 22 } },
      home: { Total: { points: 19 } },
    },
  });

  ref = modules.database.ref(`basketball/NBA/2118058/Summary/`);
  await ref.set({
    Now_clock: '4:16',
    Now_periods: '2',
    info: {
      away: { Total: { points: 88 } },
      home: { Total: { points: 94 } },
    },
  });
  ref = modules.database.ref(`basketball/NBA/2120647/Summary`);
  await ref.set({
    Now_clock: '9:21',
    Now_periods: '3',
    info: {
      away: { Total: { points: 112 } },
      home: { Total: { points: 108 } },
    },
  });
  console.log('ok');
}
inserttest();
