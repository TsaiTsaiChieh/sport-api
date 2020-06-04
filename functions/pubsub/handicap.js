const modules = require('../util/modules');
const db = require('../util/dbUtil');
const AppErrors = require('../util/AppErrors');
// const oddURL = 'https://api.betsapi.com/v2/event/odds/summary';
const oddsURL = 'https://api.betsapi.com/v2/event/odds';
// const leagues = [
//  // modules.db.basketball_NBA,
//  // modules.db.basketball_SBL,
//  // modules.db.baseball_MLB
//  modules.db.baseball_KBO,
//  modules.db.baseball_CPBL
// ];
const sports = [
  // 18,
  // 18,
  // 16,
  16,
  16
];
const leagueUniteIDArray = [
  // 2274
  // 8251
  // 225
  349,
  11235
];
const Match = db.Match;
const MatchSpread = db.Spread;
const MatchTotals = db.Totals;
// 記得要加兩組索引 (flag.spread, scheduled), (flag.totals, scheduled)
async function handicap() {
  // go through each league
  for (let i = 0; i < sports.length; i++) {
    const querysForEvent = await query_event(leagueUniteIDArray[i]);
    if (querysForEvent.length > 0) {
      await upsertHandicap(querysForEvent, sports[i], leagueUniteIDArray[i]);
    }
    // flag.spread/totals === 0 represent did not have first handicap information
    //  const querysSpread = await query_handicap('flag.spread', 0, leagues[i]);
    //  const querysTotals = await query_handicap('flag.totals', 0, leagues[i]);
    //  const querysSpreadOpening = await query_opening(
    //    'flag.spread',
    //    1,
    //    leagues[i]
    //  );
    //  const querysTotalsOpening = await query_opening(
    //    'flag.totals',
    //    1,
    //    leagues[i]
    //  );
    //  if (querysSpread.length) {
    //    for (let j = 0; j < querysSpread.length; j++) {
    //      await getHandicap(
    //        leagues[i],
    //        querysSpread[j],
    //        sports[i],
    //        leagueUniteIDArray[i]
    //      );
    //    }
    //  }
    //  if (querysTotals.length) {
    //    for (let k = 0; k < querysTotals.length; k++) {
    //      await getTotals(
    //        leagues[i],
    //        querysTotals[k],
    //        sports[i],
    //        leagueUniteIDArray[i]
    //      );
    //    }
    //  }
    //  if (querysSpreadOpening.length) {
    //    for (let l = 0; l < querysSpreadOpening.length; l++) {
    //      await updateHandicap(
    //        leagues[i],
    //        querysSpreadOpening[l],
    //        sports[i],
    //        leagueUniteIDArray[i]
    //      );
    //    }
    //  }
    //  if (querysTotalsOpening.length) {
    //    for (let m = 0; m < querysTotalsOpening.length; m++) {
    //      await updateHandicap(
    //        leagues[i],
    //        querysTotalsOpening[m],
    //        sports[i],
    //        leagueUniteIDArray[i]
    //      );
    //    }
    //  }
  }
  console.log('handicap success');
}
async function axiosForURL(URL) {
  return new Promise(async function(resolve, reject) {
    try {
      const { data } = await modules.axios(URL);
      return resolve(data);
    } catch (err) {
      return reject(
        new AppErrors.AxiosError(`${err} at prematchFunctions by DY`)
      );
    }
  });
}

async function query_event(league) {
  return new Promise(async function(resolve, reject) {
    const unix = Math.floor(Date.now() / 1000);
    const tomorrow = modules.convertTimezoneFormat(unix, {
      op: 'add',
      value: 2,
      unit: 'days'
    });
    const now = modules.convertTimezoneFormat(unix);
    const queries = await db.sequelize.query(
      `(
				 SELECT game.bets_id AS bets_id
					 FROM matches AS game
					WHERE game.status = ${modules.MATCH_STATUS.SCHEDULED}
						AND game.scheduled BETWEEN UNIX_TIMESTAMP('${now}') AND UNIX_TIMESTAMP('${tomorrow}')
						AND game.league_id = ${league}
			 )`,
      {
        type: db.sequelize.QueryTypes.SELECT
      }
    );
    return resolve(queries);
  });
}
async function upsertHandicap(querysForEvent, sport, league) {
  return new Promise(async function(resolve, reject) {
    try {
      for (let i = 0; i < querysForEvent.length; i++) {
        const ele = querysForEvent[i];

        const URL = `${oddsURL}?token=${modules.betsToken}&event_id=${ele.bets_id}&odds_market=2,3`;
        const data = await axiosForURL(URL);
        let spread_odds = [];
        let totals_odds = [];
        /* 因為 res 可能為 {
        "success": 1,
        "results": {}
      } */
        if (data.results.odds) {
          if (data.results.odds[`${sport}_2`]) {
            spread_odds = data.results.odds[`${sport}_2`];
          }
          if (data.results.odds[`${sport}_3`]) {
            totals_odds = data.results.odds[`${sport}_3`];
          }
        }
        let newest_spread;
        if (spread_odds.length > 0) {
          if (
            spread_odds[spread_odds.length - 1].home_od !== null &&
            spread_odds[spread_odds.length - 1].handicap !== null &&
            spread_odds[spread_odds.length - 1].away_od !== null &&
            spread_odds[spread_odds.length - 1].home_od !== '-' &&
            spread_odds[spread_odds.length - 1].away_od !== '-'
          ) {
            newest_spread = spread_odds[0];
            newest_spread = spreadCalculator(newest_spread);
            await write2MysqlOfMatchAboutNewestSpread(ele, newest_spread);
          }
        }
        let newest_totals;
        if (totals_odds.length > 0) {
          if (
            totals_odds[totals_odds.length - 1].over_od !== null &&
            totals_odds[totals_odds.length - 1].handicap !== null &&
            totals_odds[totals_odds.length - 1].under_od !== null &&
            totals_odds[totals_odds.length - 1].over_od !== '-' &&
            totals_odds[totals_odds.length - 1].under_od !== '-'
          ) {
            newest_totals = totals_odds[0];
            newest_totals = totalsCalculator(newest_totals);
            await write2MysqlOfMatchAboutNewestTotals(ele, newest_totals);
          }
        }
        for (let j = 0; j < spread_odds.length; j++) {
          let odd = spread_odds[j];
          odd = spreadCalculator(odd);
          if (
            odd.home_od !== null &&
            odd.handicap !== null &&
            odd.away_od !== null &&
            odd.home_od !== '-' &&
            odd.away_od !== '-'
          ) {
            await write2MysqlOfMatchSpread(odd, ele, league);
          }
        }
        for (let k = 0; k < totals_odds.length; k++) {
          let odd = totals_odds[k];
          odd = totalsCalculator(odd);
          if (
            odd.over_od !== null &&
            odd.handicap !== null &&
            odd.under_od !== null &&
            odd.over_od !== '-' &&
            odd.over_od !== '-'
          ) {
            await write2MysqlOfMatchTotals(odd, ele, league);
          }
        }
      }
      return resolve('ok');
    } catch (err) {
      return reject(
        new AppErrors.HandicapEsoccerError(
          `${err.stack} at handicap_esports by DY`
        )
      );
    }
  });
}

// async function write2firestoreAboutNewestSpread(eventSnapshot, newest_spread) {
//  return new Promise(async function (resolve, reject) {
//    try {
//      await eventSnapshot.set(
//        {
//          newest_spread: {
//            handicap: Number.parseFloat(newest_spread.handicap),
//            home_odd: Number.parseFloat(newest_spread.home_od),
//            away_odd: Number.parseFloat(newest_spread.away_od),
//            away_tw: newest_spread.away_tw,
//            home_tw: newest_spread.home_tw,
//            add_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(
//              new Date(Number.parseInt(newest_spread.add_time) * 1000)
//            ),
//            insert_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(
//              new Date()
//            )
//          }
//        },
//        { merge: true }
//      );
//      return resolve('ok');
//    } catch (err) {
//      return reject(
//        new AppErrors.FirebaseCollectError(
//          `${err} at handicap of newest_spread by DY`
//        )
//      );
//    }
//  });
// }
// async function write2firestoreAboutNewestTotals(eventSnapshot, newest_totals) {
//  return new Promise(async function (resolve, reject) {
//    try {
//      await eventSnapshot.set(
//        {
//          newest_totals: {
//            handicap: Number.parseFloat(newest_totals.handicap),
//            under_odd: Number.parseFloat(newest_totals.under_od),
//            over_odd: Number.parseFloat(newest_totals.over_od),
//            over_tw: newest_totals.over_tw,
//            add_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(
//              new Date(Number.parseInt(newest_totals.add_time) * 1000)
//            ),
//            insert_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(
//              new Date()
//            )
//          }
//        },
//        { merge: true }
//      );
//      return resolve('ok');
//    } catch (err) {
//      return reject(
//        new AppErrors.FirebaseCollectError(
//          `${err} at handicap of newest_totals by DY`
//        )
//      );
//    }
//  });
// }
async function write2MysqlOfMatchAboutNewestSpread(ele, newest_spread) {
  return new Promise(async function(resolve, reject) {
    try {
      await Match.upsert({
        bets_id: ele.bets_id,
        spread_id: newest_spread.id
      });
      return resolve('ok');
    } catch (err) {
      return reject(
        new AppErrors.MysqlError(`${err} at handicap ${ele.bets_id} by DY`)
      );
    }
  });
}
async function write2MysqlOfMatchAboutNewestTotals(ele, newest_totals) {
  return new Promise(async function(resolve, reject) {
    try {
      await Match.upsert({
        bets_id: ele.bets_id,
        totals_id: newest_totals.id
      });
      return resolve('ok');
    } catch (err) {
      return reject(
        new AppErrors.MysqlError(`${err} at handicap ${ele.bets_id} by DY`)
      );
    }
  });
}
// async function write2firestoreAboutSpread(eventSnapshot, odd) {
//  return new Promise(async function (resolve, reject) {
//    const spread = {};
//    spread[odd.id] = {
//      handicap: Number.parseFloat(odd.handicap),
//      home_odd: Number.parseFloat(odd.home_od),
//      away_odd: Number.parseFloat(odd.away_od),
//      add_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(
//        new Date(Number.parseInt(odd.add_time) * 1000)
//      ),
//      insert_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(
//        new Date()
//      ),
//      away_tw: odd.away_tw,
//      home_tw: odd.home_tw
//    };
//    try {
//      await eventSnapshot.set({ spreads: spread }, { merge: true });
//      return resolve('ok');
//    } catch (err) {
//      return reject(
//        new AppErrors.FirebaseCollectError(
//          `${err} at handicap of spreads by DY`
//        )
//      );
//    }
//  });
// }
async function write2MysqlOfMatchSpread(odd, ele, leagueUniteID) {
  return new Promise(async function(resolve, reject) {
    try {
      await MatchSpread.upsert({
        spread_id: odd.id,
        match_id: ele.bets_id,
        league_id: leagueUniteID,
        handicap: Number.parseFloat(odd.handicap),
        home_odd: Number.parseFloat(odd.away_od),
        away_odd: Number.parseFloat(odd.home_od),
        home_tw: odd.home_tw,
        away_tw: odd.away_tw,
        add_time: Number.parseInt(odd.add_time) * 1000
      });
      return resolve('ok');
    } catch (err) {
      return reject(
        new AppErrors.MysqlError(
          `${err} at handicap of MatchSpread ${ele.bets_id} by DY`
        )
      );
    }
  });
}
async function write2MysqlOfMatchTotals(odd, ele, leagueUniteID) {
  return new Promise(async function(resolve, reject) {
    try {
      await MatchTotals.upsert({
        totals_id: odd.id,
        match_id: ele.bets_id,
        league_id: leagueUniteID,
        handicap: Number.parseFloat(odd.handicap),
        over_odd: Number.parseFloat(odd.over_od),
        under_odd: Number.parseFloat(odd.under_od),
        over_tw: odd.over_tw,
        add_time: Number.parseInt(odd.add_time) * 1000
      });
      return resolve('ok');
    } catch (err) {
      return reject(
        new AppErrors.MysqlError(
          `${err} at handicap of MatchTotals ${ele.bets_id} by DY`
        )
      );
    }
  });
}
// async function write2firestoreAboutTotals(eventSnapshot, odd) {
//  return new Promise(async function (resolve, reject) {
//    const totals = {};
//    totals[odd.id] = {
//      handicap: Number.parseFloat(odd.handicap),
//      under_odd: Number.parseFloat(odd.under_od),
//      over_odd: Number.parseFloat(odd.over_od),
//      add_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(
//        new Date(Number.parseInt(odd.add_time) * 1000)
//      ),
//      insert_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(
//        new Date()
//      ),
//      over_tw: odd.over_tw
//    };
//    try {
//      await eventSnapshot.set({ totals: totals }, { merge: true });
//      return resolve('ok');
//    } catch (err) {
//      return reject(
//        new AppErrors.FirebaseCollectError(`${err} at handicap of totals by DY`)
//      );
//    }
//  });
// }
// async function updateHandicap(league, ele, sport, leagueUniteID) {
//  return new Promise(async function (resolve, reject) {
//    try {
//      const eventSnapshot = modules.getDoc(league, ele.bets_id);
//      const URL = `${oddsURL}?token=${modules.betsToken}&event_id=${ele.bets_id}&odds_market=2,3`;
//      const data = await axiosForURL(URL);
//      let spread_odds = [];
//      let totals_odds = [];
//      /* 因為 res 可能為 {
//        "success": 1,
//        "results": {}
//      } */
//      if (data.results.odds) {
//        spread_odds = data.results.odds[`${sport}_2`];
//        totals_odds = data.results.odds[`${sport}_3`];
//      }
//      let newest_spread;
//      if (spread_odds.length > 0) {
//        newest_spread = spread_odds[spread_odds.length - 1];
//        newest_spread = spreadCalculator(newest_spread);
//        await write2firestoreAboutNewestSpread(eventSnapshot, newest_spread);
//        await write2MysqlOfMatchAboutNewestSpread(ele, newest_spread);
//      }
//      let newest_totals;
//      if (totals_odds.length > 0) {
//        newest_totals = totals_odds[totals_odds.length - 1];
//        newest_totals = totalsCalculator(newest_totals);
//        await write2firestoreAboutNewestTotals(eventSnapshot, newest_totals);
//        await write2MysqlOfMatchAboutNewestTotals(ele, newest_totals);
//      }
//      for (let i = 0; i < spread_odds.length; i++) {
//        let odd = spread_odds[i];
//        odd = spreadCalculator(odd);
//        if (odd.home_od && odd.handicap && odd.away_od) {
//          await write2firestoreAboutSpread(eventSnapshot, odd);
//          await write2MysqlOfMatchSpread(odd, ele, leagueUniteID);
//        }
//      }
//      for (let i = 0; i < totals_odds.length; i++) {
//        let odd = totals_odds[i];
//        odd = totalsCalculator(odd);
//        if (odd.over_od && odd.handicap && odd.under_od) {
//          await write2firestoreAboutTotals(eventSnapshot, odd);
//          await write2MysqlOfMatchTotals(odd, ele, leagueUniteID);
//        }
//      }
//      return resolve('ok');
//    } catch (err) {
//      return reject(new AppErrors.PBPKBOError(`${err} at handicap by DY`));
//    }
//  });
// }
// async function query_opening(flag, value, league) {
//  return new Promise(async function (resolve, reject) {
//    const eventsRef = modules.firestore.collection(league);
//    const eles = [];
//    try {
//      const querys = await eventsRef
//        .where(flag, '==', value)
//        .where('scheduled', '>', modules.moment() / 1000)
//        .get();
//      querys.forEach(function (docs) {
//        eles.push(docs.data());
//      });
//      return resolve(Promise.all(eles));
//    } catch (err) {
//      return reject(new AppErrors.PBPKBOError(`${err} at handicap by DY`));
//    }
//  });
// }
// async function write2firestoreAboutAllSpread(
//  eventSnapshot,
//  spread,
//  spreadData
// ) {
//  return new Promise(async function (resolve, reject) {
//    try {
//      await eventSnapshot.set(
//        {
//          flag: { spread: 1 },
//          spread: spread,
//          newest_spread: spread[spreadData.id]
//        },
//        { merge: true }
//      );
//      return resolve('ok');
//    } catch (err) {
//      return reject(
//        new AppErrors.FirebaseCollectError(
//          `${err} at handicap_esports of spreads by DY`
//        )
//      );
//    }
//  });
// }
// async function query_handicap(flag, value, leagues) {
//  const date = modules.moment();
//  const eles = [];
//  const eventsRef = modules.firestore.collection(leagues);
//  const beginningDate = modules.moment(date);
//  const endDate = modules.moment(date).add(24, 'hours');
//  // 只針對明天（和今天時間相減相差 24 小時內）的賽事
//  try {
//    const querys = await eventsRef
//      .where(flag, '==', value)
//      .where('scheduled', '>=', beginningDate / 1000)
//      .where('scheduled', '<=', endDate / 1000)
//      .get();
//    querys.forEach(async function (docs) {
//      eles.push(docs.data());
//    });

//    return await Promise.all(eles);
//  } catch (error) {
//    console.error(
//      `Error in pubsub/handicap/query_handicap by TsaiChieh on ${Date.now()}`,
//      error
//    );
//    return error;
//  }
// }
// async function write2MysqlOfMatchAboutAllSpread(ele, spreadData) {
//  return new Promise(async function (resolve, reject) {
//    try {
//      await Match.upsert({
//        bets_id: ele.bets_id,
//        spread_id: spreadData.id
//      });
//      return resolve('ok');
//    } catch (err) {
//      return reject(
//        new AppErrors.MysqlError(`${err} at handicap of Match by DY`)
//      );
//    }
//  });
// }
// async function write2MysqlOfMatchSpreadAboutAllSpread(
//  ele,
//  spreadData,
//  leagueUniteID
// ) {
//  return new Promise(async function (resolve, reject) {
//    try {
//      await MatchSpread.upsert({
//        spread_id: spreadData.id,
//        match_id: ele.bets_id,
//        league_id: leagueUniteID,
//        handicap: Number.parseFloat(spreadData.handicap),
//        home_odd: Number.parseFloat(spreadData.home_od),
//        away_odd: Number.parseFloat(spreadData.away_od),
//        home_tw: spreadData.home_tw,
//        away_tw: spreadData.away_tw,
//        add_time: Number.parseInt(spreadData.add_time) * 1000
//      });
//      return resolve('ok');
//    } catch (err) {
//      return reject(
//        new AppErrors.MysqlError(`${err} at handicap of MatchSpread by DY`)
//      );
//    }
//  });
// }
// async function getHandicap(league, ele, sport, leagueUniteID) {
//  return new Promise(async function (resolve, reject) {
//    try {
//      const eventSnapshot = modules.getDoc(league, ele.bets_id);
//      const URL = `${oddURL}?token=${modules.betsToken}&event_id=${ele.bets_id}`;
//      const data = await axiosForURL(URL);

//      if (data.results.Bet365 !== undefined) {
//        if (data.results.Bet365) {
//          const odds = data.results.Bet365.odds.start;
//          // if no spread data, the data.results.Bet365.odds.start['18_2'] results will be null
//          if (odds[`${sport}_2`]) {
//            let spreadData = odds[`${sport}_2`];
//            spreadData = spreadCalculator(spreadData);
//            const spread = {};
//            spread[spreadData.id] = {
//              handicap: Number.parseFloat(spreadData.handicap),
//              home_odd: Number.parseFloat(spreadData.home_od),
//              away_odd: Number.parseFloat(spreadData.away_od),
//              add_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(
//                new Date(Number.parseInt(spreadData.add_time) * 1000)
//              ),
//              insert_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(
//                new Date()
//              ),
//              home_tw: spreadData.home_tw,
//              away_tw: spreadData.away_tw
//            };

//            await write2firestoreAboutAllSpread(
//              eventSnapshot,
//              spread,
//              spreadData
//            );
//            await write2MysqlOfMatchAboutAllSpread(ele, spreadData);
//            await write2MysqlOfMatchSpreadAboutAllSpread(
//              ele,
//              spreadData,
//              leagueUniteID
//            );
//          }
//        }
//      }
//      return resolve('ok');
//    } catch (err) {
//      return reject(new AppErrors.PBPKBOError(`${err} at handicap by DY`));
//    }
//  });
// }
// async function write2firestoreAboutAllTotals(
//  eventSnapshot,
//  totals,
//  totalsData
// ) {
//  return new Promise(async function (resolve, reject) {
//    try {
//      await eventSnapshot.set(
//        {
//          flag: { totals: 1 },
//          totals: totals,
//          newest_totals: totals[totalsData.id]
//        },
//        { merge: true }
//      );
//      return resolve('ok');
//    } catch (err) {
//      return reject(
//        new AppErrors.FirebaseCollectError(
//          `${err} at handicap_esports of getTotals by DY`
//        )
//      );
//    }
//  });
// }
// async function write2MysqlOfMatchAboutAllTotals(ele, totalsData) {
//  return new Promise(async function (resolve, reject) {
//    try {
//      await Match.upsert({
//        bets_id: ele.bets_id,
//        totals_id: totalsData.id
//      });
//      return resolve('ok');
//    } catch (err) {
//      return reject(
//        new AppErrors.MysqlError(
//          `${err} at handicap_esports of getTotals of Match by DY`
//        )
//      );
//    }
//  });
// }
// async function write2MysqlOfMatchTotalsAboutAllTotals(
//  ele,
//  totalsData,
//  leagueUniteID
// ) {
//  return new Promise(async function (resolve, reject) {
//    try {
//      await MatchTotals.upsert({
//        totals_id: totalsData.id,
//        match_id: ele.bets_id,
//        league_id: leagueUniteID,
//        handicap: Number.parseFloat(totalsData.handicap),
//        over_odd: Number.parseFloat(totalsData.over_od),
//        under_odd: Number.parseFloat(totalsData.under_od),
//        over_tw: totalsData.over_tw,
//        add_time: Number.parseInt(totalsData.add_time) * 1000
//      });
//      return resolve('ok');
//    } catch (err) {
//      return reject(
//        new AppErrors.MysqlError(
//          `${err} at handicap_esports of MatchTotals by DY`
//        )
//      );
//    }
//  });
// }
// async function getTotals(league, ele, sport, leagueUniteID) {
//  return new Promise(async function (resolve, reject) {
//    try {
//      const eventSnapshot = modules.getDoc(league, ele.bets_id);
//      const URL = `${oddURL}?token=${modules.betsToken}&event_id=${ele.bets_id}`;
//      const data = await axiosForURL(URL);

//      if (data.results.Bet365 !== undefined) {
//        if (data.results.Bet365) {
//          const odds = data.results.Bet365.odds.start;
//          if (odds[`${sport}_3`]) {
//            let totalsData = odds[`${sport}_3`];
//            totalsData = totalsCalculator(totalsData);
//            const totals = {};
//            totals[totalsData.id] = {
//              handicap: Number.parseFloat(totalsData.handicap),
//              add_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(
//                new Date(Number.parseInt(totalsData.add_time) * 1000)
//              ),
//              insert_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(
//                new Date()
//              ),
//              over_tw: totalsData.over_tw
//            };
//            await write2firestoreAboutAllTotals(
//              eventSnapshot,
//              totals,
//              totalsData
//            );
//            await write2MysqlOfMatchAboutAllTotals(ele, totalsData);
//            await write2MysqlOfMatchTotalsAboutAllTotals(
//              ele,
//              totalsData,
//              leagueUniteID
//            );
//          }
//        }
//      }
//      return resolve('ok');
//    } catch (err) {
//      return reject(
//        new AppErrors.AxiosError(`${err} at handicap of getTotals by DY`)
//      );
//    }
//  });
// }
function totalsCalculator(handicapObj) {
  if (
    handicapObj.over_odd === handicapObj.under_odd ||
    handicapObj.handicap % 1 !== 0
  ) {
    handicapObj.over_tw = `${handicapObj.handicap}`;
  } else if (
    handicapObj.handicap % 1 === 0 &&
    handicapObj.over_odd !== handicapObj.under_odd
  ) {
    if (handicapObj.over_odd > handicapObj.under_odd) {
      handicapObj.over_tw = `${handicapObj.handicap}贏`;
    } else if (handicapObj.over_odd < handicapObj.under_odd) {
      handicapObj.over_tw = `${handicapObj.handicap}輸`;
    }
  }
  return handicapObj;
}
function spreadCalculator(handicapObj) {
  // 賠率相同
  handicapObj.handicap = parseFloat(handicapObj.handicap);
  if (handicapObj.handicap % 1 !== 0 && handicapObj.handicap < 0) {
    handicapObj.home_tw = null;
    handicapObj.away_tw = `${Math.abs(Math.ceil(handicapObj.handicap))}輸`;
  } else if (handicapObj.handicap % 1 !== 0 && handicapObj.handicap >= 0) {
    handicapObj.home_tw = `${Math.floor(handicapObj.handicap)}輸`;
    handicapObj.away_tw = null;
  } else if (
    handicapObj.handicap % 1 === 0 &&
    handicapObj.handicap >= 0 &&
    handicapObj.home_odd === handicapObj.away_odd
  ) {
    handicapObj.home_tw = `${handicapObj.handicap}平`;
    handicapObj.away_tw = null;
  } else if (
    handicapObj.handicap % 1 === 0 &&
    handicapObj.handicap < 0 &&
    handicapObj.home_odd === handicapObj.away_odd
  ) {
    handicapObj.home_tw = null;
    handicapObj.away_tw = `${Math.abs(handicapObj.handicap)}平`;
  } else if (
    handicapObj.handicap % 1 === 0 &&
    handicapObj.handicap >= 0 &&
    handicapObj.home_odd !== handicapObj.away_odd
  ) {
    // 盤口為正，代表主讓客，所以主要減
    if (handicapObj.home_odd > handicapObj.away_odd) {
      handicapObj.home_tw = null;
      handicapObj.away_tw = ` ${handicapObj.handicap}輸`;
    } else if (handicapObj.home_odd < handicapObj.away_odd) {
      handicapObj.home_tw = null;
      handicapObj.away_tw = ` ${handicapObj.handicap}贏`;
    }
  } else if (
    // 盤口為負，代表客讓主，所以客要減
    handicapObj.handicap % 1 === 0 &&
    handicapObj.handicap < 0 &&
    handicapObj.home_odd !== handicapObj.away_odd
  ) {
    if (handicapObj.home_odd > handicapObj.away_odd) {
      handicapObj.home_tw = `+${Math.abs(handicapObj.handicap)}贏`;
      handicapObj.away_tw = null;
    } else if (handicapObj.home_odd < handicapObj.away_odd) {
      handicapObj.home_tw = `+${Math.abs(handicapObj.handicap)}輸`;
      handicapObj.away_tw = null;
    }
  }

  return handicapObj;
}
module.exports = handicap;
