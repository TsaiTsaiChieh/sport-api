/* eslint-disable no-await-in-loop */
const modules = require('../util/modules');
const URL = 'https://api.betsapi.com/v2/event/odds/summary';
const leagues = [modules.db.basketball_NBA, modules.db.basketball_SBL];
// const leagues = ['NBA_TC', modules.db.basketball_SBL];

async function handicap() {
  const date = modules.moment();
  for (let i = 0; i < leagues.length; i++) {
    const querys_spread = await query_handicap('flag.spread', leagues[i], date);
    const querys_totals = await query_handicap('flag.totals', leagues[i], date);

    for (let j = 0; j < querys_spread.length; j++) {
      getHandicap(leagues[i], querys_spread[j]);
    }
    for (let j = 0; j < querys_totals.length; j++) {
      getTotals(leagues[i], querys_totals[j]);
    }
  }
}

async function query_handicap(flag, leagues, date) {
  const spread_querys = [];
  const eventsRef = modules.firestore.collection(leagues);
  const beginningDate = modules.moment(date);
  const endDate = modules.moment(date).add(24, 'hours');
  const spreadQuerys = await eventsRef
    .where(flag, '==', 0)
    .where('scheduled', '>=', beginningDate)
    .where('scheduled', '<=', endDate)
    .get();
  spreadQuerys.forEach(async function(docs) {
    spread_querys.push(docs.data());
  });
  return await Promise.all(spread_querys);
}

async function getHandicap(league, ele) {
  try {
    const eventSnapshot = modules.getDoc(league, ele.bets_id);
    const { data } = await modules.axios(
      `${URL}?token=${modules.betsToken}&event_id=${ele.bets_id}`
    );
    console.log(`${URL}?token=${modules.betsToken}&event_id=${ele.bets_id}`);
    // if no data, the data.results will be { }
    if (data.results.Bet365) {
      const odds = data.results.Bet365.odds.start;
      // if no spread data, the data.results.Bet365.odds.start['18_2'] results will be null
      if (odds['18_2']) {
        const spreadData = odds['18_2'];
        const spread = {};
        spread[spreadData.id] = {
          handicap: Number.parseFloat(spreadData.handicap),
          add_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(
            new Date(Number.parseInt(spreadData.add_time) * 1000)
          ),
          insert_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(
            new Date()
          )
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
          add_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(
            new Date(Number.parseInt(totalsData.add_time) * 1000)
          ),
          insert_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(
            new Date()
          )
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
      'Error in pubsub/handicap getHandicap functions by Tsai-Chieh',
      error
    );
  }
}
async function getTotals(league, ele) {
  try {
    const eventSnapshot = modules.getDoc(league, ele.bets_id);
    const { data } = await modules.axios(
      `${URL}?token=${modules.betsToken}&event_id=${ele.bets_id}`
    );
    console.log(`${URL}?token=${modules.betsToken}&event_id=${ele.bets_id}`);
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
          )
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
      'Error in pubsub/handicap getTotals functions by Tsai-Chieh',
      error
    );
  }
}

module.exports = handicap;
