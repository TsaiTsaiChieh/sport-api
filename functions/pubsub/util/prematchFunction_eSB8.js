const modules = require('../../util/modules');
const AppErrors = require('../../util/AppErrors');
module.exports.eSB8 = {
  upcoming: function (date) {
    return new Promise(async function (resolve, reject) {
      const URL = `https://api.betsapi.com/v2/events/upcoming?sport_id=1&token=${modules.betsToken}&league_id=22614&day=${date}`;
      // axios
      try {
        const results = [];
        const { data } = await modules.axios(URL);
        console.log(data);

        for (let i = 0; i < data.results.length; i++) {
          const ele = data.results[i];
          results.push(
            modules.firestore
              .collection(modules.db.eSB8)
              .doc(ele.id)
              .set(repackage_bets(ele), { merge: true })
          );
          console.log(`BetsAPI eSB8 match id: ${ele.id}`);
        }
        return resolve(await Promise.all(results));
      } catch (err) {
        console.error(err);
        return reject(new AppErrors.BetsAPIError());
      }
    });
  }
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
      bets_id: ele.league.id,
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
      status: 2
    }
  };
}
