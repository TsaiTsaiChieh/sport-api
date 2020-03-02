const modules = require('../../util/modules');

function premath(args) {
  return new Promise(async function(resolve, reject) {
    const matchsRef = modules.firestore.collection(
      collectionCodebook(args.league)
    );
    const beginningDate = modules.moment(args.date).utcOffset(8);
    const endDate = modules
      .moment(args.date)
      .utcOffset(8)
      .add(1, 'days');

    try {
      const querys = await matchsRef
        .where('scheduled', '>=', beginningDate)
        .where('scheduled', '<', endDate)
        .get();
      const results = [];
      querys.docs.map(function(ele) {
        results.push(repackage(ele.data()));
      });
      resolve(results);
    } catch (err) {
      console.error('Error in sport/prematchModel by TsaiChieh', err);
      reject({ code: 500, error: err });
      return;
    }
  });
}
// eslint-disable-next-line consistent-return
function collectionCodebook(league) {
  switch (league) {
    case 'NBA':
      return modules.db.basketball_NBA;
  }
}
function repackage(ele) {
  data = {};
  data.id = ele.bets_id;
  data.handicap = {};
  data.handicap.spread = {};
  data.handicap.totals = {};

  if (ele.handicap) {
    if (ele.handicap.spread) {
      for (const obj in ele.handicap.spread) {
        data.handicap.spread[obj] = {
          handicap: ele.handicap.spread[obj].handicap,
          add_time: modules.timestampeFormat(ele.handicap.spread[obj].add_time),
          home_odd: ele.handicap.spread[obj].home_odd,
          away_odd: ele.handicap.spread[obj].away_odd,
          insert_time: modules.timestampeFormat(
            ele.handicap.spread[obj].add_time
          )
        };
      }
    }
    if (ele.handicap.totals) {
      for (const obj in ele.handicap.totals) {
        data.handicap.totals[obj] = {
          handicap: ele.handicap.totals[obj].handicap,
          add_time: modules.timestampeFormat(ele.handicap.totals[obj].add_time),
          home_odd: ele.handicap.totals[obj].home_odd,
          away_odd: ele.handicap.totals[obj].away_odd,
          insert_time: modules.timestampeFormat(
            ele.handicap.totals[obj].add_time
          )
        };
      }
    }
  }
  data.home = {
    // alias_ch
    name: ele.home.name,
    alias_ch: ele.home.alias_ch,
    alias_name: ele.home.alias_name,
    image_id: ele.home.image_id,
    id: ele.home.radar_id
  };
  return data;
}

module.exports = premath;
