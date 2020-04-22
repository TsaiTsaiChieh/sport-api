/* eslint-disable consistent-return */
const modules = require('../../util/modules');

const TAIWAN_UTF = 8;
function prematch (args) {
  return new Promise(async function (resolve, reject) {
    try {
      const queries = await queryOneDay(args);
      if (args.league === 'MLB') resolve(repackage_MLB(args, queries));
      else if (args.league === 'NBA') resolve(repackage_NBA(args, queries));
    } catch (err) {
      reject({ code: err.code, error: err });
    }
  });
}

function queryOneDay (args) {
  return new Promise(async function (resolve, reject) {
    const matchesRef = modules.firestore.collection(
      modules.leagueCodebook(args.league).match
    );
    const beginningDate = modules.moment(args.date).utcOffset(TAIWAN_UTF);
    const endDate = modules
      .moment(args.date)
      .utcOffset(TAIWAN_UTF)
      .add(1, 'days');
    const results = [];
    try {
      const queries = await matchesRef
        .where('flag.prematch', '==', 1)
        .where('scheduled', '>=', beginningDate)
        .where('scheduled', '<', endDate)
        .get();

      queries.docs.map(function (docs) {
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

async function repackage_MLB (args, events) {
  const results = [];
  let checkGogResult = { betFlag: false };
  for (let i = 0; i < events.length; i++) {
    const ele = events[i];
    if (args.token) {
      if (
        args.token.customClaims.role === 2 &&
        args.token.customClaims.titles.includes(args.league)
      ) {
        // 根據大神以往的預測來 disable 單選鈕
        // eslint-disable-next-line no-await-in-loop
        checkGogResult = await checkGodPrediction(args, ele.bets_id);
      }
    }
    const data = generalData(ele, checkGogResult);
    results.push(data);
    // if (ele.lineups) // baseball pitcher logic not finish
  }
  return results;
}
async function repackage_NBA (args, events) {
  const results = [];
  let checkGogResult = { betFlag: false };
  for (let i = 0; i < events.length; i++) {
    const ele = events[i];
    if (args.token) {
      if (
        args.token.customClaims.role === 2 &&
        args.token.customClaims.titles.includes(args.league)
      ) {
        // 根據大神以往的預測來 disable 單選鈕
        // eslint-disable-next-line no-await-in-loop
        checkGogResult = await checkGodPrediction(args, ele.bets_id);
      }
    }
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
function generalData (ele, checkGogResult) {
  const handicapFlag = checkHandicapDisable(checkGogResult);
  const data = {
    id: ele.bets_id,
    scheduled: ele.scheduled._seconds,
    league: ele.league.name,
    status: ele.flag.status,
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
    spread: { disable: false },
    totals: { disable: false }
    // lineups: {
    //   home: {},
    //   away: {}
    // }
  };

  if (ele.newest_spread && ele.flag.spread === 1) {
    data.spread = repackageSpread(
      ele.newest_spread,
      handicapFlag.spreadDisable
    );
  }
  if (!ele.newest_spread || ele.flag.status !== 2) data.spread.disable = true;
  if (ele.newest_totals && ele.flag.totals === 1) {
    data.totals = repackageTotals(
      ele.newest_totals,
      handicapFlag.totalsDisable
    );
  }

  if (!ele.newest_totals || ele.flag.status !== 2) data.totals.disable = true;
  return data;
}

function checkHandicapDisable (checkGogResult) {
  let spreadDisable = false;
  let totalsDisable = false;
  if (checkGogResult.betFlag) {
    if (checkGogResult.record.spread) spreadDisable = true;
    if (checkGogResult.record.totals) totalsDisable = true;
  }

  return { spreadDisable, totalsDisable };
}

function repackageSpread (ele, disableFlag) {
  const data = {
    id: ele.handicap_id,
    handicap: ele.handicap,
    add_time: ele.add_time
    // insert_time: newestSpread.insert_time,
  };
  if (ele.away_tw) data.away_tw = ele.away_tw;
  if (ele.home_tw) data.home_tw = ele.home_tw;
  data.disable = disableFlag;
  return data;
}

function repackageTotals (ele, disableFlag) {
  const data = {
    id: ele.handicap_id,
    handicap: ele.handicap,
    add_time: ele.add_time
    // insert_time: newestTotals.insert_time,
  };
  if (ele.away_tw) data.away_tw = ele.away_tw;
  if (ele.home_tw) data.home_tw = ele.home_tw;
  data.disable = disableFlag;
  return data;
}
function repackageBasketballLineups (home, away) {
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
async function checkGodPrediction (args, match_id) {
  const predictionRef = modules.firestore.collection(modules.db.prediction);
  const query = await predictionRef
    .where('uid', '==', args.token.uid)
    .where('bets_id', '==', match_id)
    .get();
  if (!query.size) {
    return { betFlag: false };
  }
  if (query.size > 0) {
    let record = {};
    query.forEach(async function (docs) {
      record = docs.data();
    });
    return { betFlag: true, record };
  }
}

module.exports = prematch;
