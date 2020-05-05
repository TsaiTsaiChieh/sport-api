const modules = require('../util/modules');

inserttest();

async function inserttest() {
  let realtimeData = await modules.database
    .ref('esports/eSoccer/')
    .once('value');
  realtimeData = realtimeData.val();
  const ll = Object.keys(realtimeData).length;
  for (let i = 367; i < ll; i++) {
    console.log(i);

    const name = Object.keys(realtimeData)[i];
    if (realtimeData[name].Summary.status !== 'scheduled') {
      await modules.database
        .ref(`esports/eSoccer/${name}/Summary/info/away/Total/points`)
        .set(realtimeData[name].Summary.info.away.Total.score);
      await modules.database
        .ref(`esports/eSoccer/${name}/Summary/info/home/Total/points`)
        .set(realtimeData[name].Summary.info.home.Total.score);
    }
  }
  console.log(name);

  console.log('ok');
}
