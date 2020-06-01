// const settleMatchesModel = require('../model/user/settleMatchesModel');
// const modules = require('../util/modules');
const db = require('../util/dbUtil');
// const Sp = db.Spread;
//const to = require('await-to-js').default;
async function inserttest(req, res) {
  try {
    const matchInfo = await db.sequelize.query(
      `
        select bets_id, matches.league_id, home_id, away_id, home_points, away_points,
               spread.handicap spread_handicap, home_odd, away_odd,
               totals.handicap totals_handicap, over_odd, under_odd
          from matches
          left join match__spreads spread
            on matches.spread_id = spread.spread_id
          left join match__totals totals
            on matches.totals_id = totals.totals_id
         where bets_id = :bets_id
           and flag_prematch = 1
           and status = 0
           and (home_points is not null and home_points >= 0)
           and (away_points is not null and away_points >= 0)
      `,
      {
        replacements: {
          bets_id: 2405567
        },
        type: db.sequelize.QueryTypes.SELECT
      }
    );
    console.log(matchInfo);
    // const settelSpreadResult = matchInfo[0].spread_handicap == null ? null : 1;

    // const [err, r] = await to(
    //  db.Match.update(
    //    {
    //      spread_result: settelSpreadResult,
    //      totals_result: settelSpreadResult
    //    },
    //    {
    //      where: {
    //        bets_id: 2405567
    //      }
    //    }
    //  )
    // );
    // console.log(r[0]);
  } catch (err) {
    console.log(err);
  }
}
module.exports = inserttest;
