/* eslint-disable consistent-return */
const modules = require('../../util/modules');

function prematch(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const queries = await queryOneDay(args);
      if (args.league === 'MLB') resolve(repackage_MLB(queries));
      else if (args.league === 'NBA') resolve(repackage_NBA(queries));
    } catch (err) {
      console.log(err);
      reject({ code: 500, error: err });
    }
  });
}

function queryOneDay(args) {
  return new Promise(async function(resolve, reject) {
    const matchesRef = modules.firestore.collection(
      collectionCodebook(args.league)
    );
    const beginningDate = modules.moment(args.date).utcOffset(8);
    const endDate = modules
      .moment(args.date)
      .utcOffset(8)
      .add(1, 'days');
    const results = [];
    try {
      const queries = await matchesRef
        .where('flag.prematch', '==', 1)
        .where('scheduled', '>=', beginningDate)
        .where('scheduled', '<', endDate)
        .get();

      queries.docs.map(function(docs) {
        results.push(docs.data());
      });
      resolve(await Promise.all(results));
    } catch (err) {
      console.error(
        'Error in sport/prematchModel queryOneDay function by TsaiChieh',
        err
      );
      reject(err);
    }
  });
}

function collectionCodebook(league) {
  switch (league) {
    case 'NBA':
      return modules.db.basketball_NBA;
    case 'MLB':
      return modules.db.baseball_MLB;
  }
}

function repackage_MLB(events) {
  const results = [];
  for (let i = 0; i < events.length; i++) {
    const ele = events[i];
    const data = generalData(ele);
    results.push(data);
    // if (ele.lineups) // baseball pitcher logic not finish
  }
  return results;
}
function repackage_NBA(events) {
  const results = [];
  for (let i = 0; i < events.length; i++) {
    const ele = events[i];
    const data = generalData(ele);
    if (ele.lineups)
      data.lineups = repackageBasketballLineups(
        ele.lineups.home,
        ele.lineups.away
      );
    results.push(data);
  }
  return results;
}
function generalData(ele) {
  const data = {
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
      home: {},
      away: {}
    }
  };
  if (ele.handicap) {
    if (ele.handicap.spread)
      data.handicap.spread = repackageSpread(ele.handicap.spread);
    if (ele.handicap.totals)
      data.handicap.totals = repackageTotals(ele.handicap.totals);
  }
  return data;
}

function repackageSpread(ele) {
  const data = {};
  const spreadKey = [];
  const spreadArray = [];
  for (const key in ele) {
    spreadKey.push(key);
    spreadArray.push(ele[key].add_time);
  }
  const newestKey = sortTime(spreadKey, spreadArray);
  const newestSpread = ele[newestKey];
  data[newestKey] = {
    handicap: newestSpread.handicap,
    add_time: newestSpread.add_time,
    home_odd: newestSpread.home_odd,
    away_odd: newestSpread.away_odd,
    insert_time: newestSpread.insert_time
  };
  return data;
}

function repackageTotals(ele) {
  const data = {};
  const totalsKey = [];
  const totalsArray = [];
  for (const key in ele) {
    totalsKey.push(key);
    totalsArray.push(ele[key].add_time);
  }
  const newestKey = sortTime(totalsKey, totalsArray);
  const newestTotals = ele[newestKey];
  data[newestKey] = {
    handicap: newestTotals.handicap,
    add_time: newestTotals.add_time,
    home_odd: newestTotals.home_odd,
    away_odd: newestTotals.away_odd,
    insert_time: newestTotals.insert_time
  };
  return data;
}
function repackageBasketballLineups(home, away) {
  const data = {
    home: {
      starters: []
    },
    away: {
      starters: []
    }
  };
  for (let i = 0; i < home.starters.length; i++) {
    const player = home.starters[i];
    data.home.starters.push({
      name: player.name,
      position: player.primary_position,
      first_name: player.first_name,
      last_name: player.last_name,
      id: player.id
    });
  }
  for (let i = 0; i < away.starters.length; i++) {
    const player = away.starters[i];
    data.away.starters.push({
      name: player.name,
      position: player.primary_position,
      first_name: player.first_name,
      last_name: player.last_name,
      id: player.id
    });
  }
  return data;
}
function sortTime(ids, times) {
  return ids[times.indexOf(Math.max(...times))];
}
module.exports = prematch;
