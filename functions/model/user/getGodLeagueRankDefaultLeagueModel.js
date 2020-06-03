const { getTitlesPeriod, leagueDecoder, getTitles } = require('../../util/modules');
// const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');

async function getGodLeagueRankDefaultLeague(args) {
  // args.token 需求 token.uid
  const userUid = args.token.uid;
  const period = getTitlesPeriod(Date.now()).period;
  let result = {};

  // 使用者 本期 未閱
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

  if (godLeagueTitles.length === 0) {
    return {}; // 無稱號
  }

  result = { // 初始化 為了固定 json 位置
    default_league_rank: '',
    lists: {}
  };

  const check_league_lists = [];
  godLeagueTitles.forEach(function(data) {
    check_league_lists.push(data.league_id);

    result.lists[leagueDecoder(data.league_id)] = {
      rank: data.rank_id,
      title: getTitles(data, data.default_title)
    };

    result.default_league_rank = data.default_god_league_rank && check_league_lists.includes(data.default_god_league_rank)
      ? leagueDecoder(data.default_god_league_rank)
      : leagueDecoder(check_league_lists[0]); // 避免 users 裡面 沒有 default_god_league_rank
  });

  return result;
}

// function getTitlesText(titles, num = 1) {
//   switch (num) {
//     case 1:
//       return `連贏 ${titles.continue} 天`;
//     case 2:
//       return `近 ${titles.predict_rate1} 日 ${titles.predict_rate2} 過 ${titles.predict_rate3}`;
//     case 3:
//       return `近 ${titles.predict_rate1} 日過 ${titles.predict_rate3}`;
//     case 4:
//       return `勝注連過 ${titles.win_bets_continue} 日`;
//     case 5:
//       return `近 ${titles.matches_rate1} 場過 ${titles.matches_rate2} 場`;
//     case 6:
//       return `連贏 ${titles.matches_continue} 場`;
//   }
// }

module.exports = getGodLeagueRankDefaultLeague;
