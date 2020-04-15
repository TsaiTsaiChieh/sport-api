const modules = require('../../util/modules');
async function livescore(args) {
  return new Promise(async function (resolve, reject) {
    try {
      let result = await reResult(
        args.sport,
        args.league,
        args.eventID,
        args.time
      );

      resolve(result);
    } catch (err) {
      console.error(
        'Error in livescore/livescoreDetailPrematchModel by DY',
        err
      );
      reject({ code: 500, error: err });
      return;
    }
  });
}
async function reResult(sport, league, eventID, time) {
  let result;
  result = await repackage(sport, league, eventID, time);

  return await Promise.all(result);
}
async function repackage(sport, league, eventID, time) {
  let leagueName = `pagetest_${league}`;
  let eventData = [];
  let query = await modules.firestore
    .collection(leagueName)
    .where('bets_id', '==', eventID)
    .get();

  query.forEach((doc) => {
    eventData.push(doc.data());
  });

  let dateNow = new Date().toLocaleString('zh-TW', {
    timeZone: 'Asia/Taipei',
  });
  dateNow = dateNow.split(' ')[0];

  eventData[0].sport = sport;
  eventData[0].league = league;

  //for specific league
  //nba
  if (league === 'NBA') {
    // let queryHomeForHome = await modules.firestore
    //   .collection(leagueName)
    //   .where('home.alias', '==', eventData[0].home.alias)
    //   .where('scheduled', '<', modules.moment(date).utcOffset(8))
    //   .orderBy('scheduled', 'desc')
    //   .limit(1)
    //   .get();
    //   let forLineupHome = [];
    //   queryHomeForHome.forEach((doc) => {
    //     forLineupHome.push(doc.data());
    //   });
    //   let queryAwayForHome = await modules.firestore
    //     .collection(leagueName)
    //     .where('away.alias', '==', eventData[0].home.alias)
    //     .where('scheduled', '<', modules.moment(date).utcOffset(8))
    //     .orderBy('scheduled', 'desc')
    //     .limit(1)
    //     .get();
    //   let forLineupAway = [];
    //   queryAwayForHome.forEach((doc) => {
    //     forLineupAway.push(doc.data());
    //   });
    //   if (forLineupHome[0].scheduled > forLineupAway[0].scheduled) {
    //     eventData[0].history.starting_lineup = {
    //       home: {
    //         lineup0: forLineupHome[0].home.starting_lineup.lineup0,
    //         lineup1: forLineupHome[0].home.starting_lineup.lineup1,
    //         lineup2: forLineupHome[0].home.starting_lineup.lineup2,
    //         lineup3: forLineupHome[0].home.starting_lineup.lineup3,
    //         lineup4: forLineupHome[0].home.starting_lineup.lineup4,
    //       },
    //     };
    //   } else {
    //     eventData[0].history.starting_lineup = {
    //       home: {
    //         lineup0: forLineupAway[0].away.starting_lineup.lineup0,
    //         lineup1: forLineupAway[0].away.starting_lineup.lineup1,
    //         lineup2: forLineupAway[0].away.starting_lineup.lineup2,
    //         lineup3: forLineupAway[0].away.starting_lineup.lineup3,
    //         lineup4: forLineupAway[0].away.starting_lineup.lineup4,
    //       },
    //     };
    //   }
    //   forLineupHome = [];
    //   forLineupAway = [];
    //   let queryHomeForAway = await modules.firestore
    //     .collection(leagueName)
    //     .where('home.alias', '==', eventData[0].away.alias)
    //     .where('scheduled', '<', modules.moment(date).utcOffset(8))
    //     .orderBy('scheduled', 'desc')
    //     .limit(1)
    //     .get();
    //   queryHomeForAway.forEach((doc) => {
    //     forLineupHome.push(doc.data());
    //   });
    //   let queryAwayForAway = await modules.firestore
    //     .collection(leagueName)
    //     .where('away.alias', '==', eventData[0].away.alias)
    //     .where('scheduled', '<', modules.moment(date).utcOffset(8))
    //     .orderBy('scheduled', 'desc')
    //     .limit(1)
    //     .get();
    //   queryAwayForAway.forEach((doc) => {
    //     forLineupAway.push(doc.data());
    //   });
    //   if (forLineupHome[0].scheduled > forLineupAway[0].scheduled) {
    //     eventData[0].history.starting_lineup.away = {
    //       lineup0: forLineupHome[0].home.starting_lineup.lineup0,
    //       lineup1: forLineupHome[0].home.starting_lineup.lineup1,
    //       lineup2: forLineupHome[0].home.starting_lineup.lineup2,
    //       lineup3: forLineupHome[0].home.starting_lineup.lineup3,
    //       lineup4: forLineupHome[0].home.starting_lineup.lineup4,
    //     };
    //   } else {
    //     eventData[0].history.starting_lineup.away = {
    //       lineup0: forLineupAway[0].away.starting_lineup.lineup0,
    //       lineup1: forLineupAway[0].away.starting_lineup.lineup1,
    //       lineup2: forLineupAway[0].away.starting_lineup.lineup2,
    //       lineup3: forLineupAway[0].away.starting_lineup.lineup3,
    //       lineup4: forLineupAway[0].away.starting_lineup.lineup4,
    //     };
    //   }
  }
  return eventData;
}

module.exports = livescore;
