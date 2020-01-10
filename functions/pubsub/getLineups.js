const modules = require('../util/modules');
const data = require('./lineup.json');
async function getLineups(req, res) {
  // step 1: get all event id
  let sportSnapshot = await modules.firestore
    .collection(modules.db.sport_events)
    .doc('18')
    .collection('1146')
    .doc('1982486')
    .get();
  // sportSnapshot.docs.forEach(function(doc) {
  //   console.log('test', doc.data());
  // });
  // console.log(sportSnapshot.data());
  let a = await modules.firestore
    .collection(`${modules.db.sport_events}/18/1146/1982486`)
    .get();
  console.log(a);

  // let a = await modules
  //   .getSnapshot('sport_test', '18')
  //   .doc('10769')
  //   .get();
  // console.log(a.data());

  res.json(sportSnapshot);
  // return data;
}
module.exports = getLineups;
