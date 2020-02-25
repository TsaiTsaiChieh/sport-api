/* eslint-disable no-await-in-loop */
const modules = require('../util/modules');
const URL = '';
const leagues = [modules.db.basketball_NBA, modules.db.basketball_SBL];
async function handicap() {
  // const { spread_ids, totals_ids } = query_leagues(leagues);
  const querys_NBA = await query_spread(leagues[0]);
  timer(querys_NBA);

  // console.log(spread_ids_SBL);
}

async function query_spread(leagues) {
  const spread_querys = [];
  // const totals_ids = [];
  const eventsRef = modules.firestore.collection(leagues);
  const spreadQuerys = await eventsRef.where('flag.spread', '==', 0).get();
  spreadQuerys.forEach(async function(docs) {
    spread_querys.push(docs.data());
  });
  // const totalsQuerys = await eventsRef.where('flag.totals', '==', 0).get();
  // totalsQuerys.forEach(async function(docs) {
  //   totals_ids.push(docs.data().bets_id);
  // });

  // return await Promise.all([spread_ids, totals_ids]);
  return await Promise.all(spread_querys);
}
function timer(eles) {
  for (let i = 0; i < eles.length; i++) {
    const ele = eles[i];

    const beforeHour =
      (ele.scheduled._seconds * 1000 - Date.now()) / (1000 * 60 * 60);

    console.log(modules.moment(ele.scheduled._seconds * 1000), beforeHour);
  }
}
module.exports = handicap;
