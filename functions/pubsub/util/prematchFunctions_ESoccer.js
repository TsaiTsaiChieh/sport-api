const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
module.exports.eSoccer = {};
module.exports.eSoccer.upcoming = async function (date) {
  const _date = modules.dateFormat(date);
  const sportID = 1;
  const leagueArray = [22614, 22808, 22764, 22537, 22724];
  const results = [];
  // leagueArray.length
  for (let i = 0; i < leagueArray.length; i++) {
    const leagueID = leagueArray[i];

    const URL = `https://api.betsapi.com/v2/events/upcoming?sport_id=${sportID}&token=${modules.betsToken}&league_id=${leagueID}&day=${date}`;
    try {
      // eslint-disable-next-line no-await-in-loop
      let { data } = await modules.axios(URL);
      for (let j = 0; j < data.results.length; j++) {
        const ele = data.results[j];

        results.push(
          modules.firestore
            .collection(modules.db.eSoccer)
            .doc(ele.id)
            .set(repackage_bets(ele), { merge: true })
        );
        // mysql----------
        //   try {
        //     // const Match = await db.eSoccer_match.sync();
        //   } catch (err) {
        //     console.error(err);
        //   }
        // mysql----------
      }
    } catch (error) {
      console.error(
        `Error in pubsub/util/prematchFunctions_ESoccer upcoming axios by DY on ${Date.now()}`,
        error
      );
      return error;
    }
  }
  console.log('ok');
  return new Promise(async function (resolve, reject) {
    try {
      resolve(await Promise.all(results));
    } catch (error) {
      console.error(
        `Error in pubsub/util/prematchFunctions_ESoccer upcoming axios by DY on ${Date.now()}`,
        error
      );
      reject(error);
    }
  });
};

function repackage_bets(ele) {
  return {
    update_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(new Date()),
    scheduled: Number.parseInt(ele.time),
    scheduled_tw: modules.firebaseAdmin.firestore.Timestamp.fromDate(
      new Date(Number.parseInt(ele.time) * 1000)
    ),
    bets_id: ele.id,
    league: {
      ori_bets_id: ele.league.id,
      bets_id: '22',
      name: ele.league.name
    },
    home: {
      alias: ele.home.name,
      image_id: ele.home.image_id,
      bets_id: ele.home.id
    },
    away: {
      alias: ele.away.name,
      image_id: ele.away.image_id,
      bets_id: ele.away.id
    },
    flag: {
      spread: 0,
      totals: 0,
      status: 2,
      prematch: 1
    }
  };
}
