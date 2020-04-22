/* eslint-disable no-await-in-loop */
const modules = require('../util/modules');
const oddURL = 'https://api.betsapi.com/v2/event/odds/summary';
const oddsURL = 'https://api.betsapi.com/v2/event/odds';
const leagues = [
  // modules.db.basketball_NBA,
  // modules.db.basketball_SBL,
  modules.db.baseball_MLB,
];
// 記得要加兩組索引 (flag.spread, scheduled), (flag.totals, scheduled)
async function handicap () {
  // go through each league
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
        getHandicap(leagues[i], querysSpread[j]);
      }
    }
    if (querysTotals.length) {
      for (let j = 0; j < querysTotals.length; j++) {
        getTotals(leagues[i], querysTotals[j]);
      }
    }
    if (querysSpreadOpening.length) {
      for (let j = 0; j < querysSpreadOpening.length; j++) {
        updateHandicap(leagues[i], querysSpreadOpening[j]);
      }
    }
    if (querysTotalsOpening.length) {
      for (let j = 0; j < querysTotalsOpening.length; j++) {
        updateHandicap(leagues[i], querysTotalsOpening[j]);
      }
    }
  }
}
async function updateHandicap (league, ele) {
  try {
    const eventSnapshot = modules.getDoc(league, ele.bets_id);
    const URL = `${oddsURL}?token=${modules.betsToken}&event_id=${ele.bets_id}&odds_market=2,3`;
    const { data } = await modules.axios(URL);
    const spread_odds = data.results.odds['18_2'];
    const totals_odds = data.results.odds['18_3'];
    for (let i = 0; i < spread_odds.length; i++) {
      const odd = spread_odds[i];
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
        };
        eventSnapshot.set({ handicap: { spread } }, { merge: true });
      }
    }
    for (let i = 0; i < totals_odds.length; i++) {
      const odd = totals_odds[i];
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
        };
        eventSnapshot.set({ handicap: { totals } }, { merge: true });
        console.log(
          `${league}(${ele.bets_id}) - ${ele.away.alias_ch}(${
            ele.away.alias
          }):${ele.home.alias_ch}(${ele.home.alias}) at ${modules
            .moment(ele.scheduled._seconds * 1000)
            .format('llll')} updated handicap successful, URL: ${URL}`
        );
      }
    }
  } catch (error) {
    console.error(
      `Error in pubsub/handicap updateHandicap functions by Tsai-Chieh ${Date.now()}`,
      error
    );
  }
}
async function query_opening (flag, value, league) {
  const eventsRef = modules.firestore.collection(league);
  const eles = [];
  try {
    const querys = await eventsRef
      .where(flag, '==', value)
      .where('scheduled', '>', modules.moment())
      .get();
    querys.forEach(function (docs) {
      eles.push(docs.data());
    });
    return await Promise.all(eles);
  } catch (error) {
    console.error(
      `Error in pubsub/handicap/query_opening by TsaiChieh on ${Date.now()}`
    );
    return error;
  }
}
async function query_handicap (flag, value, leagues) {
  const date = modules.moment();
  const eles = [];
  const eventsRef = modules.firestore.collection(leagues);
  const beginningDate = modules.moment(date);
  const endDate = modules.moment(date).add(24, 'hours');
  // 只針對明天（和今天時間相減相差 24 小時內）的賽事
  try {
    const querys = await eventsRef
      .where(flag, '==', value)
      .where('scheduled', '>=', beginningDate)
      .where('scheduled', '<=', endDate)
      .get();
    querys.forEach(async function (docs) {
      eles.push(docs.data());
    });
    return await Promise.all(eles);
  } catch (error) {
    console.error(
      `Error in pubsub/handicap/query_handicap by TsaiChieh on ${Date.now()}`,
      error
    );
    return error;
  }
}

async function getHandicap (league, ele) {
  try {
    const eventSnapshot = modules.getDoc(league, ele.bets_id);
    const URL = `${oddURL}?token=${modules.betsToken}&event_id=${ele.bets_id}`;
    const { data } = await modules.axios(URL);
    console.log(
      `${league}(${ele.bets_id}) - ${ele.away.alias_ch}(${ele.away.alias}):${
        ele.home.alias_ch
      }(${ele.home.alias}) at ${modules
        .moment(ele.scheduled._seconds * 1000)
        .format('llll')}
      `
    );
    // if no data, the data.results will be { }
    if (data.results.Bet365) {
      const odds = data.results.Bet365.odds.start;
      // if no spread data, the data.results.Bet365.odds.start['18_2'] results will be null
      if (odds['18_2']) {
        const spreadData = odds['18_2'];
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
        };

        eventSnapshot.set(
          { flag: { spread: 1 }, handicap: { spread } },
          { merge: true }
        );
        console.log(
          `${league}-event_id: ${ele.bets_id} get spread successful, URL: ${URL}`
        );
      }

      if (odds['18_3']) {
        const totalsData = odds['18_3'];
        const totals = {};
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
        };

        eventSnapshot.set(
          { flag: { totals: 1 }, handicap: { totals } },
          { merge: true }
        );
        console.log(
          `${league}-event_id: ${ele.bets_id} get totals successful, URL: ${URL}`
        );
      }
    }
  } catch (error) {
    console.log(
      `Error in pubsub/handicap getHandicap functions by Tsai-Chieh on ${Date.now()}`,
      error
    );
  }
}
async function getTotals (league, ele) {
  try {
    const eventSnapshot = modules.getDoc(league, ele.bets_id);
    const URL = `${oddURL}?token=${modules.betsToken}&event_id=${ele.bets_id}`;
    const { data } = await modules.axios(URL);
    console.log(
      `${league}(${ele.bets_id}) - ${ele.away.alias_ch}(${ele.away.alias}):${
        ele.home.alias_ch
      }(${ele.home.alias}) at ${modules
        .moment(ele.scheduled._seconds * 1000)
        .format('llll')}
      `
    );
    if (data.results.Bet365) {
      const odds = data.results.Bet365.odds.start;

      if (odds['18_3']) {
        const totalsData = odds['18_3'];
        const totals = {};
        totals[totalsData.id] = {
          handicap: Number.parseFloat(totalsData.handicap),
          add_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(
            new Date(Number.parseInt(totalsData.add_time) * 1000)
          ),
          insert_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(
            new Date()
          ),
        };
        eventSnapshot.set(
          { flag: { totals: 1 }, handicap: { totals } },
          { merge: true }
        );
        console.log(
          `${league}-event_id: ${ele.bets_id} get totals successful, URL: ${URL}`
        );
      }
    }
  } catch (error) {
    console.log(
      `Error in pubsub/handicap getTotals functions by Tsai-Chieh on ${Date.now()}`,
      error
    );
  }
}

module.exports = handicap;
