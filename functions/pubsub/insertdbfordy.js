const modules = require('../util/modules');
const db = require('../util/dbUtil');

inserttest();

async function inserttest() {
  let data = await modules.firestore
    .collection('pagetest_eSoccer')
    .where('flag.status', '>', 0)
    .get();
  data = await modules.firestore
    .collection('pagetest_eSoccer')
    .where('flag.status', '<', 0)
    .get();
  const totalData = [];
  data.forEach((doc) => {
    totalData.push(doc.data());
  });
  for (let i = 0; i < totalData.length; i++) {
    console.log(totalData.bets_id);
  }
}
