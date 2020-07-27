const { getTitlesPeriod } = require('../../util/modules');
const { leagueCodebook } = require('../../util/leagueUtil');
const { checkUserRight } = require('../../util/databaseEngine');
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');
const to = require('await-to-js').default;

async function postGodLeagueRankSetAllLeagueTitle(args) {
  // args.token 需求 token.uid
  const userUid = args.token.uid;
  const period = getTitlesPeriod(Date.now()).period;

  const result = { success: [] };

  const checkResult = await checkUserRight(userUid, [2], '130830');
  if (checkResult.code) throw checkResult;

  for (const title of args.titles) {
    const [err, r] = await to(db.Title.update({
      default_title: title.default_title
    }, {
      where: {
        uid: userUid,
        period: period,
        league_id: leagueCodebook(title.league).id
      }
    }));

    if (err) {
      console.error('[Error][postGodLeagueRankSetAllLeagueTitleModel][Title] ', err);
      throw errs.dbErrsMsg('404', '13541', { addMsg: err.parent.code });
    }
    if (r[0] === 0) {throw errs.dbErrsMsg('404', '13542');}
    if (r[0] === 1) result.success.push({ league: title.league, default_title: title.default_title });
  }

  return result;
}

module.exports = postGodLeagueRankSetAllLeagueTitle;
