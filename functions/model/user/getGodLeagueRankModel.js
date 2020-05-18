const { getTitlesPeriod, leagueDecoder } = require('../../util/modules');
// const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');

async function getGodLeagueRank(args) {
  // args.token 需求 token.uid
  const userUid = args.token.uid;
  const period = getTitlesPeriod(Date.now()).period;
  const result = { titleAnimate: { period: period } };

  // 使用者 本期 未閱
  const godLeagueTitles = await db.sequelize.query(`
        select league_id, rank_id
          from titles
         where uid = :uid
           and period = :period
           and received = 0
      `, {
    replacements: {
      uid: userUid,
      period: period
    },
    type: db.sequelize.QueryTypes.SELECT
  });

  if (godLeagueTitles.length === 0) {
    return {}; // 無稱號
  }

  godLeagueTitles.forEach(function(data) {
    result.titleAnimate[leagueDecoder(data.league_id)] = data.rank_id;
  });

  return result;
}

module.exports = getGodLeagueRank;
