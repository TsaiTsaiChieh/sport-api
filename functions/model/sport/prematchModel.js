const modules = require('../../util/modules');

function prematch(args) {
  return new Promise(async function(resolve, reject) {
    const matchesRef = modules.firestore.collection(
      collectionCodebook(args.league)
    );
    const beginningDate = modules.moment(args.date).utcOffset(8);
    const endDate = modules
      .moment(args.date)
      .utcOffset(8)
      .add(1, 'days');
    // query the match on date which user query
    try {
      const queries = await matchesRef
        .where('flag.prematch', '==', 1)
        .where('scheduled', '>=', beginningDate)
        .where('scheduled', '<', endDate)
        .get();

      const results = [];
      queries.docs.map(function(ele) {
        results.push(repackage(ele.data(), args.league));
      });
      resolve(results);
    } catch (err) {
      console.error('Error in sport/prematchModel by TsaiChieh', err);
      reject({ code: 500, error: err });
      return;
    }
  });
}
// eslint-disable-next-line consistent-return
function collectionCodebook(league) {
  switch (league) {
    case 'NBA':
      return modules.db.basketball_NBA;
    case 'MLB':
      return modules.db.baseball_MLB;
  }
}
function repackage(ele, league) {
  data = {
    id: ele.bets_id,
    scheduled: ele.scheduled._seconds,
    home: {
      alias: ele.home.alias,
      name: ele.home.name,
      alias_ch: ele.home.alias_ch,
      alias_name: ele.home.alias_name,
      image_id: `${ele.home.image_id ? ele.home.image_id : '-'}`,
      id: ele.home.radar_id
    },
    away: {
      alias: ele.away.alias,
      name: ele.away.name,
      alias_ch: ele.away.alias_ch,
      alias_name: ele.away.alias_name,
      image_id: `${ele.away.image_id ? ele.away.image_id : '-'}`,
      id: ele.away.radar_id
    },
    handicap: {
      spread: {},
      totals: {}
    },
    lineups: {
      home: {
        starters: []
      },
      away: {
        starters: []
      }
    }
  };

  if (ele.handicap) {
    if (ele.handicap.spread) {
      const spreadKey = [];
      const spreadArray = [];
      for (const key in ele.handicap.spread) {
        spreadKey.push(key);
        spreadArray.push(ele.handicap.spread[key].add_time._seconds);
      }
      const newestKey = sortTime(spreadKey, spreadArray);
      const newestSpread = ele.handicap.spread[newestKey];
      data.handicap.spread[newestKey] = {
        handicap: newestSpread.handicap,
        add_time: newestSpread.add_time._seconds,
        home_odd: newestSpread.home_odd,
        away_odd: newestSpread.away_odd,
        insert_time: newestSpread.insert_time._seconds
      };
    }
    if (ele.handicap.totals) {
      const totalsKey = [];
      const totalsArray = [];
      for (const key in ele.handicap.totals) {
        totalsKey.push(key);
        totalsArray.push(ele.handicap.totals[key].add_time._seconds);
      }
      const newestKey = sortTime(totalsKey, totalsArray);
      const newestTotals = ele.handicap.totals[newestKey];
      data.handicap.totals[newestKey] = {
        handicap: newestTotals.handicap,
        add_time: newestTotals.add_time._seconds,
        home_odd: newestTotals.home_odd,
        away_odd: newestTotals.away_odd,
        insert_time: newestTotals.insert_time._seconds
      };
    }
  }
  // lineups information
  if (ele.lineups) {
    for (let i = 0; i < ele.lineups.home.starters.length; i++) {
      const player = ele.lineups.home.starters[i];

      data.lineups.home.starters.push({
        name: player.name,
        position: player.primary_position,
        first_name: player.first_name,
        last_name: player.last_name,
        id: player.id
      });
    }
    for (let i = 0; i < ele.lineups.away.starters.length; i++) {
      const player = ele.lineups.away.starters[i];
      data.lineups.away.starters.push({
        name: player.name,
        position: player.primary_position,
        first_name: player.first_name,
        last_name: player.last_name,
        id: player.id
      });
    }
  }
  return data;
}
function sortTime(ids, times) {
  return ids[times.indexOf(Math.max(...times))];
}
module.exports = prematch;
