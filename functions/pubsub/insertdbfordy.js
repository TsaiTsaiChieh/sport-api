const modules = require('../util/modules');
const transNBA = require('./translateNBA.js');
const translateNBA = transNBA.translateNBA;
let firestoreName = 'pagetest_NBA';
async function inserttest() {
  modules.firestore
    .collection(firestoreName)
    .doc(betsID)
    .set({ away: {} }, { merge: true });
}
inserttest();
