const modules = require('../util/modules');
const testServiceAccount = require('../auth/sportslottery-test-adminsdk.json');
const testDatabaseURL = 'https://sportslottery-test.firebaseio.com';
const officialServiceAccount = require('../auth/sport19y0715-dev.json');
const officialDatabaseURL = 'https://sport19y0715.firebaseio.com';
const jsonFile = require('../json/NBA_TC.json');

function backupFirestore(req, res) {
  // Initiate Firebase App
  modules.firestoreService.initializeApp(testServiceAccount, testDatabaseURL);
  const collections = ['NBA_TC'];
  // Start exporting your data
  modules.firestoreService.backups(collections).then(function(data) {
    modules.fs.writeFile(
      './json/basketball.json',
      JSON.stringify(data),
      function(err) {
        if (err) throw err;
        console.log(`Backups complete ${new Date()}`);
        res.json(`Backups complete ${new Date()}`);
      }
    );
  });
}
async function restoreFirestore(req, res) {
  // modules.firestoreService.initializeApp(
  //   officialServiceAccount,
  //   officialDatabaseURL
  // );
  modules.firestoreService.initializeApp(testServiceAccount, testDatabaseURL);
  modules.firestoreService.restore(jsonFile, {
    dates: ['update_time', 'scheduled']
  });
  res.json('Restore complete');
}
module.exports = { backupFirestore, restoreFirestore };
