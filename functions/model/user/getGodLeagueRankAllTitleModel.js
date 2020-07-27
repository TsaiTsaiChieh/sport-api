const { getTitlesPeriod, getAllTitles } = require('../../util/modules');
const { leagueDecoder } = require('../../util/leagueUtil');
// const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');

async function getGodLeagueRankAllTitle(args) {
  // args.token 需求 token.uid
  const userUid = args.token.uid;
  const period = getTitlesPeriod(Date.now()).period;
  let result = {};

  // 使用者 本期 所有 聯盟大神 稱號 和 成就
  const godLeagueTitles = await db.sequelize.query(`
      select titles.league_id, titles.rank_id, titles.default_title,
             titles.continue, titles.predict_rate1, titles.predict_rate2, titles.predict_rate3,
             titles.win_bets_continue, titles.matches_rate1, titles.matches_rate2, titles.matches_continue,
             users.default_god_league_rank
        from titles, users
       where titles.uid = users.uid
         and titles.uid = :uid
         and titles.period = :period
    `, {
    replacements: {
      uid: userUid,
      period: period
    },
    type: db.sequelize.QueryTypes.SELECT
  });

  if (godLeagueTitles.length === 0) return {}; // 無稱號

  result = { // 初始化
    default_league_rank: '', // 為了固定 json 位置
    lists: {}
  };

  const check_league_lists = [];
  godLeagueTitles.forEach(function(data) {
    check_league_lists.push(data.league_id);

    result.lists[leagueDecoder(data.league_id)] = {
      rank: data.rank_id,
      default_title: data.default_title,
      titles: getAllTitles(data)
    };

    result.default_league_rank = data.default_god_league_rank && check_league_lists.includes(data.default_god_league_rank)
      ? leagueDecoder(data.default_god_league_rank)
      : leagueDecoder(check_league_lists[0]); // 給預設值 避免 users 裡面 沒有 default_god_league_rank
  });

  return result;
}

module.exports = getGodLeagueRankAllTitle;
