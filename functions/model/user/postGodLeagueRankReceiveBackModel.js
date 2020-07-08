const { getTitlesPeriod } = require('../../util/modules');
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');
const to = require('await-to-js').default;

async function postGodLeagueRankReceiveBack(args) {
  // args.token 需求 token.uid
  const userUid = args.token.uid;
  const period = getTitlesPeriod(Date.now()).period;

  const result = { };

  const [err, r] = await to(db.Title.update({
    received: 0
  }, {
    where: {
      uid: userUid,
      period: period
    }
  }));

  if (err) {console.error(err); throw errs.dbErrsMsg('404', '13543', { addMsg: err.parent.code });}
  if (r[0] >= 1) result.success = '>=1';

  return result;
}

module.exports = postGodLeagueRankReceiveBack;
