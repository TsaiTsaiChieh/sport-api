const { getTitlesPeriod, leagueCodebook } = require('../../util/modules');
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');
const to = require('await-to-js').default;

async function postGodLeagueRankSetAllLeagueTitle(args) {
  // args.token 需求 token.uid
  const userUid = args.token.uid;
  const period = getTitlesPeriod(Date.now()).period;

  const result = { success: [] };

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

    if (err) {console.error(err); throw errs.dbErrsMsg('404', '13541', err.parent.code);}
    if (r[0] === 0) {throw errs.dbErrsMsg('404', '13542');}
    if (r[0] === 1) result.success.push({ league: title.league, default_title: title.default_title });
  }
  // 是大神才可以更新

  return result;
}

module.exports = postGodLeagueRankSetAllLeagueTitle;
