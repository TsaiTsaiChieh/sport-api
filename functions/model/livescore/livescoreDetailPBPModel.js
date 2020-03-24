const modules = require('../../util/modules');
async function livescore(args) {
  return new Promise(async function(resolve, reject) {
    try {
      let result = await reResult(args.sport, args.league, args.eventID);

      resolve(result);
    } catch (err) {
      console.error('Error in livescore/livescoreDetailPBPModel by DY', err);
      reject({ code: 500, error: err });
      return;
    }
  });
}
async function reResult(sport, league, eventID) {
  let result;
  result = await repackage(sport, league, eventID);

  return await Promise.all(result);
}
async function repackage(sport, league, eventID) {
  let leagueName = `pagetest_${league}`;
  let eventNumber = 5;
  let eventData = [];
  let query = await modules.firestore
    .collection(leagueName)
    .where('bets_id', '==', eventID)
    .get();

  query.forEach(doc => {
    eventData.push(doc.data());
  });

  let dateNow = new Date().toLocaleString('zh-TW', {
    timeZone: 'Asia/Taipei'
  });
  dateNow = dateNow.split(' ')[0];

  let historySpread = [];

  let spreadName = Object.keys(eventData[0].history.event0.spread)[0];
  historySpread.push({
    handicap: eventData[0].history.event0.spread[spreadName].handicap,
    check: eventData[0].history.event0.spread[spreadName].check
  });
  spreadName = Object.keys(eventData[0].history.event1.spread)[0];
  historySpread.push({
    handicap: eventData[0].history.event1.spread[spreadName].handicap,
    check: eventData[0].history.event1.spread[spreadName].check
  });
  spreadName = Object.keys(eventData[0].history.event2.spread)[0];
  historySpread.push({
    handicap: eventData[0].history.event2.spread[spreadName].handicap,
    check: eventData[0].history.event2.spread[spreadName].check
  });
  spreadName = Object.keys(eventData[0].history.event3.spread)[0];
  historySpread.push({
    handicap: eventData[0].history.event3.spread[spreadName].handicap,
    check: eventData[0].history.event3.spread[spreadName].check
  });
  spreadName = Object.keys(eventData[0].history.event4.spread)[0];
  historySpread.push({
    handicap: eventData[0].history.event4.spread[spreadName].handicap,
    check: eventData[0].history.event4.spread[spreadName].check
  });
  let historyTotal = [];
  let totalName = Object.keys(eventData[0].history.event0.totals)[0];
  historyTotal.push({
    handicap: eventData[0].history.event0.totals[totalName].handicap,
    check: eventData[0].history.event0.totals[totalName].check
  });
  totalName = Object.keys(eventData[0].history.event1.totals)[0];
  historyTotal.push({
    handicap: eventData[0].history.event1.totals[totalName].handicap,
    check: eventData[0].history.event1.totals[totalName].check
  });
  totalName = Object.keys(eventData[0].history.event2.totals)[0];
  historyTotal.push({
    handicap: eventData[0].history.event2.totals[totalName].handicap,
    check: eventData[0].history.event2.totals[totalName].check
  });
  totalName = Object.keys(eventData[0].history.event3.totals)[0];
  historyTotal.push({
    handicap: eventData[0].history.event3.totals[totalName].handicap,
    check: eventData[0].history.event3.totals[totalName].check
  });
  totalName = Object.keys(eventData[0].history.event4.totals)[0];
  historyTotal.push({
    handicap: eventData[0].history.event4.totals[totalName].handicap,
    check: eventData[0].history.event4.totals[totalName].check
  });
  let awayGetScore = eventData[0].away.avg_getscore;
  let awayLossScore = eventData[0].away.avg_lossscore;
  let awayWin = eventData[0].away.win;
  let awayLose = eventData[0].away.lose;
  let awayWinAtAway = eventData[0].away.win_away;
  let awayLoseAtAway = eventData[0].away.lose_away;
  let awayWinAtHome = eventData[0].away.win_home;
  let awayLoseAtHome = eventData[0].away.lose_home;
  let awaySpreadPrecent = eventData[0].away.precent_spread;
  let awayOUPrecent = eventData[0].away.precent_OU;
  let homeGetScore = eventData[0].home.avg_getscore;
  let homeLossScore = eventData[0].home.avg_lossscore;
  let homeWin = eventData[0].home.win;
  let homeLose = eventData[0].home.lose;
  let homeWinAtAway = eventData[0].home.win_away;
  let homeLoseAtAway = eventData[0].home.lose_away;
  let homeWinAtHome = eventData[0].home.win_home;
  let homeLoseAtHome = eventData[0].home.lose_home;
  let homeSpreadPrecent = eventData[0].home.precent_spread;
  let homeOUPrecent = eventData[0].home.precent_OU;
  let outputJson = [];
  outputJson.push({
    homeName: eventData[0].home.name_ch,
    awayName: eventData[0].away.name_ch,
    bets_id: eventData[0].bets_id,
    flag: { status: eventData[0].flag.status },
    radar_id: eventData[0].radar_id,
    scheduled: eventData[0].scheduled._seconds,
    historySpread: historySpread,
    historyTotal: historyTotal,
    awayGetScore: awayGetScore,
    awayLossScore: awayLossScore,
    awayWin: awayWin,
    awayLose: awayLose,
    awayWinAtAway: awayWinAtAway,
    awayLoseAtAway: awayLoseAtAway,
    awayWinAtHome: awayWinAtHome,
    awayLoseAtHome: awayLoseAtHome,
    awaySpreadPrecent: awaySpreadPrecent,
    awayOUPrecent: awayOUPrecent,
    homeGetScore: homeGetScore,
    homeLossScore: homeLossScore,
    homeWin: homeWin,
    homeLose: homeLose,
    homeWinAtAway: homeWinAtAway,
    homeLoseAtAway: homeLoseAtAway,
    homeWinAtHome: homeWinAtHome,
    homeLoseAtHome: homeLoseAtHome,
    homeSpreadPrecent: homeSpreadPrecent,
    homeOUPrecent: homeOUPrecent
  });
  outputJson.push({ sport: sport });
  outputJson.push({ league: league });

  return outputJson;
}
module.exports = livescore;
