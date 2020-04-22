const modules = require('../../util/modules');
// const db = require('../../util/dbUtil');
const db = require('../../util/dbUtil');

// aa('20200422');
// aa('20200423');

// module.exports.NBA.upcoming =
async function aa(date) {
  // mysql----------
  //   try {
  //     // const Match = await db.eSoccer_match.sync();
  //   } catch (err) {
  //     console.error(err);
  //   }
  // mysql----------
  const _date = modules.dateFormat(date);
  const sportID = 1;
  const leagueArray = [22614, 22808, 22764, 22537, 22724];
  const results = [];

  for (let i = 0; i < leagueArray.length; i++) {
    const leagueID = leagueArray[i];

    const URL = `https://api.betsapi.com/v2/events/upcoming?sport_id=${sportID}&token=${modules.betsToken}&league_id=${leagueID}&day=${date}`;
    try {
      // eslint-disable-next-line no-await-in-loop
      let { data } = await modules.axios(URL);

      for (let i = 0; i < data.results.length; i++) {
        const ele = data.results[i];

        const oddURL = `https://api.betsapi.com/v2/event/odds/summary?token=${modules.betsToken}&event_id=${ele.id}`;
        // eslint-disable-next-line no-await-in-loop
        ({ data } = await modules.axios(oddURL));
        const dataBetsSummary = data;
        const oddsURL = `https://api.betsapi.com/v2/event/odds?token=${modules.betsToken}&event_id=${ele.id}`;
        // eslint-disable-next-line no-await-in-loop
        ({ data } = await modules.axios(oddsURL));
        const dataBets = data;
        // eslint-disable-next-line no-await-in-loop
        await modules.fs.writeFile(
          `/Users/huangdao-yong/Desktop/esports/${date}_${ele.id}.json`,
          JSON.stringify(ele),
          // eslint-disable-next-line no-loop-func
          function (err) {
            if (err) {
              console.log(err);
            }
          }
        );
        // eslint-disable-next-line no-await-in-loop
        await modules.fs.writeFile(
          `/Users/huangdao-yong/Desktop/esports/${date}_${ele.id}_betsSummary.json`,
          JSON.stringify(dataBetsSummary),
          // eslint-disable-next-line no-loop-func
          function (err) {
            if (err) {
              console.log(err);
            }
          }
        );
        // eslint-disable-next-line no-await-in-loop
        await modules.fs.writeFile(
          `/Users/huangdao-yong/Desktop/esports/${date}_${ele.id}_bets.json`,
          JSON.stringify(dataBets),
          // eslint-disable-next-line no-loop-func
          function (err) {
            if (err) {
              console.log(err);
            }
          }
        );
        // results.push(
        //   modules.firestore
        //     .collection(modules.db.eSoccer)
        //     .doc(ele.id)
        //     .set(repackage_bets(ele), { merge: true })
        // );
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
module.exports = aa;
