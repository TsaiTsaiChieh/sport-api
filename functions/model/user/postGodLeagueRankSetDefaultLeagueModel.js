const { leagueCodebook } = require('../../util/modules');
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');
const to = require('await-to-js').default;

async function postGodLeagueRankSetDefaultLeague(args) {
  // args.token 需求 token.uid
  const userUid = args.token.uid;
  // const period = getTitlesPeriod(Date.now()).period;
  const league_id = leagueCodebook(args.league).id;

  const result = { success: [] };

  // 是大神才可以更新
  const [err, r] = await to(db.User.update({
    default_god_league_rank: league_id
  }, {
    where: {
      uid: userUid,
      status: 2
    }
  }));

  if (err) {
    console.error('[Error][postGodLeagueRankSetDefaultLeagueModel][User] ', err);
    throw errs.dbErrsMsg('404', '13001', { addMsg: err.parent.code });
  }
  if (r[0] === 0) {throw errs.dbErrsMsg('404', '13002');}
  if (r[0] === 1) result.success.push(userUid);

  return result;
}

module.exports = postGodLeagueRankSetDefaultLeague;
