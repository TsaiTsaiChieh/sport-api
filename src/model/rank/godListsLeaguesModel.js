const { getLastPeriod } = require('../../util/modules');
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');

async function godlistsLeagues() {
  const leagueLists = [];
  // 取得當期期數
  const period = getLastPeriod(new Date()).period;

  try {
    // 依 聯盟 取出是 大神資料 和 大神賣牌狀態 sell (-1：無狀態  0：免費  1：賣牌)
    const LeagueListsQuery = await db.sequelize.query(`
        select distinct leagues.name
          from titles, view__leagues leagues
         where titles.league_id = leagues.league_id
           and titles.period = :period
      `, {
      replacements: {
        period: period
      },
      type: db.sequelize.QueryTypes.SELECT
    });

    LeagueListsQuery.forEach(function(data) {
      leagueLists.push(data.name);
    });
  } catch (err) {
    console.log('Error in  rank/godlists by YuHsien:  %o', err);
    throw errs.errsMsg('500', '500', err.message);
  }

  return leagueLists;
}

module.exports = godlistsLeagues;
