const modules = require('../../util/modules');
const db = require('../../util/dbUtil');

const NORMAL_USER = 1;

function getRandom(x) {
  return Math.floor(Math.random()*x);
}

function repackagePrediction(args, ele) {
  const data = {
    bets_id: ele.id,
    league_id: ele.league_id,
    sell: args.sell,
    match_scheduled: ele.match_scheduled,
    uid: args.token.uid,
    user_status: args.token.customClaims.role
  };

  if (ele.spread) {
    data.spread_id = ele.spread[0];
    data.spread_option = ele.spread[1];
    data.spread_bets = ele.spread[2];
  } 

  if (ele.totals) {
    data.totals_id = ele.totals[0];
    data.totals_option = ele.totals[1];
    data.totals_bets = ele.totals[2];
  }
  return data;
}

const bets_ids = [2120643, 2119917]
const uids = ['tODxQnJ64TUcCEA0oybSXNGzf5O2'];
const spread_choose = ['home', 'away'];
const totals_choose = ['under', 'over'];

const needed_normal = `
  {
    bets_id: 0,
    league_id: 2274,
    sell: -1,
    match_scheduled: 1593563400,
    uid: '',
    user_status: 1,
    spread: {
      spread_id: 31298058,
      spread_option: spread_choose[getRandom(1)],
      spread_bets: 3
    },
    totals: {
      totals_id: 34456538,
      totals_option: totals_choose[getRandom(1)],
      totals_bets: 3
    }
  }
`;

async function predictFakeInput() {
  return new Promise(async function (resolve, reject) {
    const actions = [];

    try {
      bets_ids.forEach(function(data, index) {
        ele = 
        const data = repackagePrediction(data);

        const handicap_spread = {type: 'spread', spread_id: (ele.spread)?data.spread[0]:{} };
        const handicap_totals = {type: 'totals', totals_id: (ele.totals)?data.totals[0]:{} };

        actions.push(db.Prediction.upsert(data));

        console.log(
          `User(${
            args.token.customClaims.role === NORMAL_USER ? 'Normal' : 'God'
          }) update or insert match id: ${
            data.bets_id
          } [spread_id: ${handicap_spread}] [totals_id: ${handicap_totals}] successful`
        );
      });

      return resolve(await Promise.all(actions));
    } catch (err) {
      return reject(new AppError.MysqlError());
    }
  });
}

predictFakeInput();

module.exports = predictFakeInput;
