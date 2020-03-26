/* eslint-disable consistent-return */
const modules = require('../../util/modules');

function prematch(args) {
  return new Promise(async function(resolve, reject) {
    // 根據大神以往的預測來 disable 單選鈕
    let checkGogResult = {
      betFlag: false
    };
    if (args.token) checkGogResult = await checkGodPrediction(args);
    try {
      const queries = await queryOneDay(args);
      if (args.league === 'MLB') resolve(repackage_MLB(queries));
      else if (args.league === 'NBA')
        resolve(repackage_NBA(queries, checkGogResult));
    } catch (err) {
      console.log(err);
      reject({ code: err.code, error: err });
    }
  });
}

function queryOneDay(args) {
  return new Promise(async function(resolve, reject) {
    const matchesRef = modules.firestore.collection(
      modules.leagueCodebook(args.league).match
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
      reject({ code: 500, error: err });
    }
  });
}

function repackage_MLB(events) {
  const results = [];
  for (let i = 0; i < events.length; i++) {
    const ele = events[i];
    const data = generalData(ele, checkGogResult);
    results.push(data);
    // if (ele.lineups) // baseball pitcher logic not finish
  }
  return results;
}
function repackage_NBA(events, checkGogResult) {
  const results = [];
  for (let i = 0; i < events.length; i++) {
    const ele = events[i];
    const data = generalData(ele, checkGogResult);
    // if (ele.lineups)
    //   data.lineups = repackageBasketballLineups(
    //     ele.lineups.home,
    //     ele.lineups.away
    //   );
    results.push(data);
  }
  return results;
}
function generalData(ele, checkGogResult) {
  const handicapFlag = checkHandicapDisable(ele, checkGogResult);

  const data = {
    id: ele.bets_id,
    scheduled: ele.scheduled._seconds,
    league: ele.league.name,
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
    }
    // lineups: {
    //   home: {},
    //   away: {}
    // }
  };

  if (ele.spread)
    data.spread = repackageSpread(ele.spread, handicapFlag.spreadDisable);
  if (!ele.spread) data.spread = { disable: true };
  if (ele.totals)
    data.totals = repackageTotals(ele.totals, handicapFlag.totalsDisable);
  if (!ele.totals) data.totals = { disable: true };
  return data;
}

function checkHandicapDisable(ele, checkGogResult) {
  let spreadDisable = false;
  let totalsDisable = false;
  if (checkGogResult.betFlag) {
    for (const key in checkGogResult.record) {
      if (key === ele.bets_id) {
        if (checkGogResult.record[key].spread) spreadDisable = true;
        if (checkGogResult.record[key].totals) totalsDisable = true;
      }
    }
  }
  return { spreadDisable, totalsDisable };
}

function repackageSpread(ele, disableFlag) {
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
    // insert_time: newestSpread.insert_time,
    disable: disableFlag
  };
  return data;
}

function repackageTotals(ele, disableFlag) {
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
    // insert_time: newestTotals.insert_time,
    disable: disableFlag
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

async function checkGodPrediction(args) {
  const date = modules.dateFormat(args.date);
  const predictionSnapshot = await modules.getSnapshot(
    modules.leagueCodebook(args.league).prediction,
    `${date.month}${date.day}${date.year}_${args.token.uid}`
  );
  if (!predictionSnapshot.exists) {
    return { betFlag: false };
  }
  if (predictionSnapshot.exists) {
    const prediction = predictionSnapshot.data();
    if (prediction.user_status === 1) return { betFlag: false };
    if (prediction.user_status === 2)
      return { betFlag: true, record: prediction.matches };
  }
}

module.exports = prematch;
