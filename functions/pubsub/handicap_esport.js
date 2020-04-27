const modules = require('../util/modules');
const db = require('../util/dbUtil');
const oddURL = 'https://api.betsapi.com/v2/event/odds/summary';
const oddsURL = 'https://api.betsapi.com/v2/event/odds';
// const leagues = [modules.db.eSoccer]; normal
const leagues = ['pagetest_eSoccer'];

async function handicap_esport() {
  for (let i = 0; i < leagues.length; i++) {
    // flag.spread/totals === 0 represent did not have first handicap information

    const querysSpread = await query_handicap('flag.spread', 0, leagues[i]);
    const querysTotals = await query_handicap('flag.totals', 0, leagues[i]);
    const querysSpreadOpening = await query_opening(
      'flag.spread',
      1,
      leagues[i]
    );
    const querysTotalsOpening = await query_opening(
      'flag.totals',
      1,
      leagues[i]
    );

    if (querysSpread.length) {
      for (let j = 0; j < querysSpread.length; j++) {
        await getHandicap(leagues[i], querysSpread[j]);
      }
    }
    if (querysTotals.length) {
      for (let j = 0; j < querysTotals.length; j++) {
        await getTotals(leagues[i], querysTotals[j]);
      }
    }
    if (querysSpreadOpening.length) {
      for (let j = 0; j < querysSpreadOpening.length; j++) {
        await updateHandicap(leagues[i], querysSpreadOpening[j]);
      }
    }
    if (querysTotalsOpening.length) {
      for (let j = 0; j < querysTotalsOpening.length; j++) {
        await updateHandicap(leagues[i], querysTotalsOpening[j]);
      }
    }
  }
  console.log('handicap_esports success');
}
async function updateHandicap(league, ele) {
  const Match = await db.Match.sync();
  const MatchSpread = await db.Spread.sync();
  const MatchTotals = await db.Totals.sync();
  try {
    const eventSnapshot = modules.getDoc(league, ele.bets_id);
    const URL = `${oddsURL}?token=${modules.betsToken}&event_id=${ele.bets_id}&odds_market=2,3`;
    const { data } = await modules.axios(URL);
    const spread_odds = data.results.odds['1_2'];
    const totals_odds = data.results.odds['1_3'];
    let newest_spreads;

    if (spread_odds.length > 0) {
      newest_spreads = spread_odds[spread_odds.length - 1];
      newest_spreads = await spreadCalculator(newest_spreads);

      await eventSnapshot.set(
        {
          newest_spread: {
            handicap: Number.parseFloat(newest_spreads.handicap),
            home_odd: Number.parseFloat(newest_spreads.home_od),
            away_odd: Number.parseFloat(newest_spreads.away_od),
            away_tw: newest_spreads.away_tw,
            home_tw: newest_spreads.home_tw,
            add_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(
              new Date(Number.parseInt(newest_spreads.add_time) * 1000)
            ),
            insert_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(
              new Date()
            )
          }
        },
        { merge: true }
      );

      await Match.upsert({
        bets_id: ele.bets_id,
        spread_id: newest_spreads.id
      });
    }
    let newest_totals;
    if (totals_odds.length > 0) {
      newest_totals = totals_odds[totals_odds.length - 1];
      newest_totals = await totalsCalculator(newest_totals);
      await eventSnapshot.set(
        {
          newest_totals: {
            handicap: Number.parseFloat(newest_totals.handicap),
            under_odd: Number.parseFloat(newest_totals.under_od),
            over_odd: Number.parseFloat(newest_totals.over_od),
            over_tw: newest_totals.over_tw,
            add_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(
              new Date(Number.parseInt(newest_totals.add_time) * 1000)
            ),
            insert_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(
              new Date()
            )
          }
        },
        { merge: true }
      );
      await Match.upsert({
        bets_id: ele.bets_id,
        totals_id: newest_totals.id
      });
    }

    for (let i = 0; i < spread_odds.length; i++) {
      let odd = spread_odds[i];
      odd = await spreadCalculator(odd);
      if (odd.home_od && odd.handicap && odd.away_od) {
        const spread = {};
        spread[odd.id] = {
          handicap: Number.parseFloat(odd.handicap),
          home_odd: Number.parseFloat(odd.home_od),
          away_odd: Number.parseFloat(odd.away_od),
          add_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(
            new Date(Number.parseInt(odd.add_time) * 1000)
          ),
          insert_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(
            new Date()
          ),
          away_tw: odd.away_tw,
          home_tw: odd.home_tw
        };
        await eventSnapshot.set({ spreads: spread }, { merge: true });
        await MatchSpread.upsert({
          spread_id: odd.id,
          match_id: ele.bets_id,
          league_id: '22000',
          handicap: Number.parseFloat(odd.handicap),
          home_odd: Number.parseFloat(odd.home_od),
          away_odd: Number.parseFloat(odd.away_od),
          home_tw: odd.home_tw,
          away_tw: odd.away_tw,
          add_time: Number.parseInt(odd.add_time) * 1000
        });
      }
    }
    for (let i = 0; i < totals_odds.length; i++) {
      let odd = totals_odds[i];
      odd = await totalsCalculator(odd);
      if (odd.over_od && odd.handicap && odd.under_od) {
        const totals = {};
        totals[odd.id] = {
          handicap: Number.parseFloat(odd.handicap),
          under_odd: Number.parseFloat(odd.under_od),
          over_odd: Number.parseFloat(odd.over_od),
          add_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(
            new Date(Number.parseInt(odd.add_time) * 1000)
          ),
          insert_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(
            new Date()
          ),
          over_tw: odd.over_tw
        };
        await eventSnapshot.set({ totals: totals }, { merge: true });
        await MatchTotals.upsert({
          totals_id: odd.id,
          match_id: ele.bets_id,
          league_id: '22000',
          handicap: Number.parseFloat(odd.handicap),
          over_odd: Number.parseFloat(odd.over_od),
          under_odd: Number.parseFloat(odd.under_od),
          over_tw: odd.over_tw,
          add_time: Number.parseInt(odd.add_time) * 1000
        });
        // console.log(
        //   `${league}(${ele.bets_id}) - ${ele.away.alias_ch}(${
        //     ele.away.alias
        //   }):${ele.home.alias_ch}(${ele.home.alias}) at ${modules
        //     .moment(ele.scheduled * 1000)
        //     .format('llll')} updated handicap successful, URL: ${URL}`
        // );
      }
    }
  } catch (error) {
    console.error(
      `Error in pubsub/handicap updateHandicap functions by DY ${Date.now()}`,
      error
    );
  }
}
async function query_opening(flag, value, league) {
  const eventsRef = modules.firestore.collection(league);
  const eles = [];
  try {
    const querys = await eventsRef
      .where(flag, '==', value)
      .where('scheduled', '>', modules.moment() / 1000)
      .get();
    querys.forEach(function(docs) {
      eles.push(docs.data());
    });
    return await Promise.all(eles);
  } catch (error) {
    console.error(
      `Error in pubsub/handicap/query_opening by DY on ${Date.now()}`
    );
    return error;
  }
}
async function query_handicap(flag, value, leagues) {
  const date = modules.moment();
  const eles = [];
  const eventsRef = modules.firestore.collection(leagues);
  const beginningDate = modules.moment(date);
  const endDate = modules.moment(date).add(24, 'hours');
  // 只針對明天（和今天時間相減相差 24 小時內）的賽事
  try {
    const querys = await eventsRef
      .where(flag, '==', value)
      .where('scheduled', '>=', beginningDate / 1000)
      .where('scheduled', '<=', endDate / 1000)
      .get();
    querys.forEach(async function(docs) {
      eles.push(docs.data());
    });
    return await Promise.all(eles);
  } catch (error) {
    console.error(
      `Error in pubsub/handicap/query_handicap by DY on ${Date.now()}`,
      error
    );
    return error;
  }
}

async function getHandicap(league, ele) {
  const Match = await db.Match.sync();
  const MatchSpread = await db.Spread.sync();

  try {
    const eventSnapshot = modules.getDoc(league, ele.bets_id);
    const URL = `${oddURL}?token=${modules.betsToken}&event_id=${ele.bets_id}`;
    const { data } = await modules.axios(URL);
    // console.log(
    //   `${league}(${ele.bets_id}) - ${ele.away.alias_ch}(${ele.away.alias}):${
    //     ele.home.alias_ch
    //   }(${ele.home.alias}) at ${modules
    //     .moment(ele.scheduled * 1000)
    //     .format('llll')}
    //   `
    // );
    // if no data, the data.results will be { }
    if (data.results.Bet365) {
      const odds = data.results.Bet365.odds.start;
      if (odds['1_2']) {
        let spreadData = odds['1_2'];
        spreadData = await spreadCalculator(spreadData);
        const spread = {};
        spread[spreadData.id] = {
          handicap: Number.parseFloat(spreadData.handicap),
          home_odd: Number.parseFloat(spreadData.home_od),
          away_odd: Number.parseFloat(spreadData.away_od),
          add_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(
            new Date(Number.parseInt(spreadData.add_time) * 1000)
          ),
          insert_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(
            new Date()
          ),
          home_tw: spreadData.home_tw,
          away_tw: spreadData.away_tw
        };

        await eventSnapshot.set(
          {
            flag: { spread: 1 },
            spread: spread,
            newest_spread: spread[spreadData.id]
          },
          { merge: true }
        );
        await Match.upsert({
          bets_id: ele.bets_id,
          spread_id: spreadData.id
        });
        await MatchSpread.upsert({
          spread_id: spreadData.id,
          match_id: ele.bets_id,
          league_id: '22000',
          handicap: Number.parseFloat(spreadData.handicap),
          home_odd: Number.parseFloat(spreadData.home_od),
          away_odd: Number.parseFloat(spreadData.away_od),
          home_tw: spreadData.home_tw,
          away_tw: spreadData.away_tw,
          add_time: Number.parseInt(spreadData.add_time) * 1000
        });
        // console.log(
        //   `${league}-event_id: ${ele.bets_id} get spread successful, URL: ${URL}`
        // );
      }
    }
  } catch (error) {
    console.log(
      `Error in pubsub/handicap getHandicap functions by DY on ${Date.now()}`,
      error
    );
  }
}
async function getTotals(league, ele) {
  const Match = await db.Match.sync();
  const MatchTotals = await db.Totals.sync();
  try {
    const eventSnapshot = modules.getDoc(league, ele.bets_id);
    const URL = `${oddURL}?token=${modules.betsToken}&event_id=${ele.bets_id}`;
    const { data } = await modules.axios(URL);
    // console.log(
    //   `${league}(${ele.bets_id}) - ${ele.away.alias_ch}(${ele.away.alias}):${
    //     ele.home.alias_ch
    //   }(${ele.home.alias}) at ${modules
    //     .moment(ele.scheduled * 1000)
    //     .format('llll')}
    //   `
    // );
    if (data.results.Bet365) {
      const odds = data.results.Bet365.odds.start;
      if (odds['1_3']) {
        let totalsData = odds['1_3'];
        const totals = {};
        totalsData = await totalsCalculator(totalsData);
        totals[totalsData.id] = {
          handicap: Number.parseFloat(totalsData.handicap),
          over_odd: Number.parseFloat(totalsData.over_od),
          under_odd: Number.parseFloat(totalsData.under_od),
          add_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(
            new Date(Number.parseInt(totalsData.add_time) * 1000)
          ),
          insert_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(
            new Date()
          ),
          over_tw: totalsData.over_tw
        };

        await eventSnapshot.set(
          {
            flag: { totals: 1 },
            totals: totals,
            newest_totals: totals[totalsData.id]
          },
          { merge: true }
        );
        await Match.upsert({
          bets_id: ele.bets_id,
          totals_id: totalsData.id
        });
        await MatchTotals.upsert({
          totals_id: totalsData.id,
          match_id: ele.bets_id,
          league_id: '22000',
          handicap: Number.parseFloat(totalsData.handicap),
          over_odd: Number.parseFloat(totalsData.over_od),
          under_odd: Number.parseFloat(totalsData.under_od),
          over_tw: totalsData.over_tw,
          add_time: Number.parseInt(totalsData.add_time) * 1000
        });
        // console.log(
        //   `${league}-event_id: ${ele.bets_id} get totals successful, URL: ${URL}`
        // );
      }
    }
  } catch (error) {
    console.log(
      `Error in pubsub/handicap getTotals functions by DY on ${Date.now()}`,
      error
    );
  }
}
function spreadCalculator(handicapObj) {
  if (handicapObj.handicap === 0.0) {
    handicapObj.handicap = 0;
  }
  if (
    handicapObj.handicap % 1 !== 0 &&
    handicapObj.handicap < 0
    // handicapObj.home_odd === handicapObj.away_odd
  ) {
    // 賠率相同
    handicapObj.away_tw = `${Math.abs(Math.ceil(handicapObj.handicap))}輸`;
    handicapObj.home_tw = null;
    // handicapObj.away_tw = `${Math.ceil(Math.abs(handicapObj.handicap))}贏`;
  } else if (
    handicapObj.handicap % 1 !== 0 &&
    handicapObj.handicap >= 0
    // handicapObj.home_odd === handicapObj.away_odd
  ) {
    handicapObj.home_tw = `${Math.floor(handicapObj.handicap)}輸`;
    handicapObj.away_tw = null;
    // handicapObj.home_tw = `${Math.ceil(handicapObj.handicap)}贏`;
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
    handicapObj.away_tw = `${Math.abs(handicapObj.handicap)}平`;
    handicapObj.home_tw = null;
  } else if (
    handicapObj.handicap % 1 === 0 &&
    handicapObj.handicap >= 0 &&
    handicapObj.home_odd !== handicapObj.away_odd
  ) {
    // 盤口為正，代表主讓客，所以主要減
    if (handicapObj.home_odd > handicapObj.away_odd) {
      // handicapObj.home_tw = `-${handicapObj.handicap} +50`;
      handicapObj.away_tw = `+${handicapObj.handicap} -50`;
      handicapObj.home_tw = null;
    } else if (handicapObj.home_odd < handicapObj.away_odd) {
      handicapObj.away_tw = `+${handicapObj.handicap} +50`;
      handicapObj.home_tw = null;
      // handicapObj.home_tw = `-${handicapObj.handicap} -50`;
    }
    // console.log(handicapObj, id);
  } else if (
    // 盤口為負，代表客讓主，所以客要減
    handicapObj.handicap % 1 === 0 &&
    handicapObj.handicap < 0 &&
    handicapObj.home_odd !== handicapObj.away_odd
  ) {
    if (handicapObj.home_odd > handicapObj.away_odd) {
      handicapObj.home_tw = `+${Math.abs(handicapObj.handicap)} +50`;
      handicapObj.away_tw = null;
      // handicapObj.away_tw = `-${Math.abs(handicapObj.handicap)} -50`;
    } else if (handicapObj.home_odd < handicapObj.away_odd) {
      handicapObj.home_tw = `+${Math.abs(handicapObj.handicap)} -50`;
      handicapObj.away_tw = null;
      // handicapObj.away_tw = `-${Math.abs(handicapObj.handicap)} +50`;
    }
  }
  return handicapObj;
}
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
      handicapObj.over_tw = `${handicapObj.handicap} +50`;
    } else if (handicapObj.over_odd < handicapObj.under_odd) {
      handicapObj.over_tw = `${handicapObj.handicap} -50`;
    }
  }
  return handicapObj;
}
module.exports = handicap_esport;
