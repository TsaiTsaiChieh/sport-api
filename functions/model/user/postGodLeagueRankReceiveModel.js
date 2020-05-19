const { getTitlesPeriod, leagueCodebook } = require('../../util/modules');
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');
const to = require('await-to-js').default;

async function postGodLeagueRankReceive(args) {
  // args.token 需求 token.uid
  const userUid = args.token.uid;
  const period = getTitlesPeriod(Date.now()).period;
  const leagues = args.leagues;

  const result = { success: [] };

  for (const league of leagues) {
    const [err, r] = await to(db.Title.update({
      received: 1
    }, {
      where: {
        uid: userUid,
        league_id: leagueCodebook(league).id,
        period: period
      }
    }));

    if (err) {console.error(err); throw errs.dbErrsMsg('404', '13540', err.parent.code);}
    if (r[0] === 1) result.success.push(league);
  };

  return result;
}

module.exports = postGodLeagueRankReceive;
