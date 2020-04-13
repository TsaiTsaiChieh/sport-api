/* eslint-disable promise/catch-or-return */
const modules = require('../util/modules');
const testServiceAccount = require('../auth/sportslottery-test-adminsdk.json');
const testDatabaseURL = 'https://sportslottery-test.firebaseio.com';
const officialServiceAccount = require('../auth/sport19y0715-dev.json');
const officialDatabaseURL = 'https://sport19y0715.firebaseio.com';
const jsonFile = require('../json/matches/firestore_MLB.json');
const collectionName = ['MLB_TC'];

function backupFirestore(req, res) {
  // Initiate Firebase App
  modules.firestoreService.initializeApp(testServiceAccount, testDatabaseURL);
  // eslint-disable-next-line promise/always-return
  modules.firestoreService.backups(collectionName).then(function (data) {
    modules.fs.writeFile(
      './json/matches/firestore_MLB.json', // origin
      // './json/matches/NBA.json', // match
      // './json/spread/NBA.json', // spread
      // './json/totals/NBA.json', // totals
      JSON.stringify(data), // origin
      // JSON.stringify(repackageMatch(data.basketball_NBA)), // match
      // JSON.stringify(repackageSpread(data.basketball_NBA)), // spread
      // JSON.stringify(repackageTotals(data.basketball_NBA)), // totals
      function (err) {
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

function repackageTotals(data) {
  const results = [];
  for (const key in data) {
    const match = data[key];
    if (match.totals) {
      for (const totalsKey in match.totals) {
        const ele = match.totals[totalsKey];
        const totals = {
          totals_id: totalsKey,
          match_id: key,
          handicap: ele.handicap,
          add_time: ele.add_time * 1000,
          over_odd: ele.over_odd,
          under_odd: ele.under_odd,
          league_id: match.league.bets_id,
          over_tw: ele.away_tw
        };

        results.push(totals);
      }
    }
  }
  return results;
}
function repackageSpread(data) {
  const results = [];
  for (const key in data) {
    const match = data[key];
    if (match.spread) {
      for (const spreadKey in match.spread) {
        const ele = match.spread[spreadKey];
        const spread = {
          spread_id: spreadKey,
          match_id: key,
          handicap: ele.handicap,
          add_time: ele.add_time * 1000,
          home_odd: ele.home_odd,
          away_odd: ele.away_odd,
          league_id: match.league.bets_id
        };
        if (ele.home_tw) spread.home_tw = ele.home_tw;
        if (ele.away_tw) spread.away_tw = ele.away_tw;
        results.push(spread);
      }
    }
  }
  return results;
}

function backup_match(res, collectionName, path) {
  modules.firestoreService.backups(collectionName).then(function (data) {
    modules.fs.writeFile(
      path,
      JSON.stringify(repackageMatch(data.basketball_NBA)),
      function (err) {
        if (err) throw err;
        console.log(`Backups complete ${new Date()}`);
        res.json(`Backups complete ${new Date()}`);
      }
    );
  });
}

function repackageMatch(data) {
  const results = [];
  for (const key in data) {
    const ele = data[key];
    const match = {
      bets_id: ele.bets_id,
      radar_id: ele.radar_id,
      home_id: ele.home.bets_id,
      away_id: ele.away.bets_id,

      sr_id: ele.sr_id,
      scheduled: ele.scheduled._seconds,
      flag_prematch: ele.flag.prematch,
      status: ele.flag.status
    };
    if (ele.newest_spread) match.spread_id = ele.newest_spread.handicap_id;
    if (ele.newest_totals) match.totals_id = ele.newest_totals.handicap_id;
    results.push(match);
  }
  return results;
}
