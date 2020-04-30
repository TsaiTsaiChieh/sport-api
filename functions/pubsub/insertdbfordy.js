const modules = require('../util/modules');
inserttest();
async function inserttest() {
  // const realtimeData = JSON.parse(
  //   JSON.stringify(
  //     // eslint-disable-next-line no-await-in-loop
  //     await modules.database.ref(`esports/eSoccer/2336641`).once('value')
  //   )
  // );
  const a = await (
    await modules.database.ref('esports/eSoccer/2336641').once('value')
  ).val();
  console.log(a);

  // console.log(a.data);
  // console.log(realtimeData);
}
