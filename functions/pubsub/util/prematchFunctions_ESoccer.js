const modules = require('../../util/modules');
// const db = require('../../util/dbUtil');
const db = require('../../util/dbUtil');
// aa('20200420');
module.exports.ESoccer = {};
// module.exports.NBA.upcoming =
async function aa(date) {
  //mysql----------
  //   try {
  //     // const Match = await db.eSoccer_match.sync();
  //   } catch (err) {
  //     console.error(err);
  //   }
  //mysql----------
  const _date = modules.dateFormat(date);
  let leagueID = 22537; // Esoccer Liga Pro - 12 mins play
  const URL = `https://api.betsapi.com/v2/events/upcoming?sport_id=1&token=${modules.betsToken}&league_id=${leagueID}&day=${_date.year}${_date.month}${_date.day}`;
  const results = [];
  try {
    let { data } = await modules.axios(URL);
    let scheduledData = data;
    for (let i = 0; i < scheduledData.results.length; i++) {
      let ele = scheduledData.results[i];
      results.push(
        modules.firestore
          .collection(modules.db.eSoccer)
          .doc(ele.id)
          .set(repackage_bets(ele), { merge: true })
      );
      // mysql
    }
  } catch (error) {
    console.error(
      `Error in pubsub/util/prematchFunctions_ESoccer upcoming axios by DY on ${Date.now()}`,
      error
    );
    return error;
  }
  // firestore
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
}
function repackage_bets(ele) {
  return {
    update_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(new Date()),
    scheduled: Number.parseInt(ele.time),
    scheduled_tw: modules.firebaseAdmin.firestore.Timestamp.fromDate(
      new Date(Number.parseInt(ele.time) * 1000)
    ),
    bets_id: ele.id,
    league: {
      bets_id: ele.league.id,
      name: ele.league.name,
    },
    home: {
      alias: ele.home.name,
      image_id: ele.home.image_id,
      bets_id: ele.home.id,
    },
    away: {
      alias: ele.away.name,
      image_id: ele.away.image_id,
      bets_id: ele.away.id,
    },
    flag: {
      spread: 0,
      totals: 0,
      status: 2,
      prematch: 1,
    },
  };
}
module.exports = aa;
