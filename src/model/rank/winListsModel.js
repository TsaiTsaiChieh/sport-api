const { getCurrentPeriod, coreDateInfo, date3UnixInfo, to } = require('../../util/modules');
const { leagueCodebook } = require('../../util/leagueUtil');
const rankUtil = require('../../util/rankUtil');
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');
const { acceptLeague } = require('../../config/acceptValues');
// const { zone_tw } = require('../../config/env_values');
// const { CacheQuery } = require('../../util/redisUtil');

async function winLists(args) {
  const range = args.range;
  const league = args.league;
  const type = args.type;
  const period = getCurrentPeriod(new Date()).period;
  const nowInfo = coreDateInfo(new Date());
  const d3 = date3UnixInfo(new Date());
  const beginUnix = nowInfo.dateBeginUnix;
  const endUnix = d3.tomorrowEndUnix; // nowInfo.dateEndUnix;

  const league_id = [];
  let limitCase = '';
  const order = `${range}_win_${type}`;
  if (league === 'ALL') {
    const len = acceptLeague.length;
    for (let i = 0; i < len; i++) {
      const leagueCode = leagueCodebook(acceptLeague[i]);
      const leagueID = leagueCode.id;
      const ratio = rankUtil.getRatioOfPredictCounts(leagueCode.predicts_perDay, range);
      league_id.push(leagueID);
      limitCase += ` WHEN league_id = ${leagueID} THEN ${ratio} `;
    }
  } else {
    const leagueCode = leagueCodebook(league);
    const leagueID = leagueCode.id;
    const ratio = rankUtil.getRatioOfPredictCounts(leagueCode.predicts_perDay, range);
    league_id.push(leagueID);
    limitCase = ` WHEN league_id = ${leagueID} THEN ${ratio} `;
  }

  const winLists = {};
  winLists[league] = [];

  for (const key of Object.keys(winLists)) { // 依 聯盟 進行排序
    const leagueWinLists = []; // 儲存 聯盟處理完成資料

    // 當賣牌時，快取會無法跟上更新
    // const redisKey = ['rank', 'winBetsLists', 'users__win__lists', 'titles', league_id, period].join(':');

    // 大神賣牌狀態 sell (-1：無狀態  0：免費  1：賣牌)
    const [err, leagueWinListsQuery] = await to(db.sequelize.query(`
          select winlist.*,
                 titles.rank_id, 
                 CASE prediction.sell
                   WHEN 1 THEN 1
                   WHEN 0 THEN 0
                   ELSE -1
                 END sell,
                 titles.default_title,
                 titles.continue,
                 titles.predict_rate1, titles.predict_rate2, titles.predict_rate3, titles.win_bets_continue,
                 titles.matches_rate1, titles.matches_rate2, titles.matches_continue
            from (
                   select distinct winlist.*, users.avatar, users.display_name, users.status
                     from (
                            select uid, users__win__lists.league_id, 
                                   last_month_win_bets, last_month_win_rate, 
                                   last_week_win_bets, last_week_win_rate,
                                   this_season_win_bets, this_season_win_rate,
                                   this_period_win_bets, this_period_win_rate,
                                   this_month_win_bets, this_month_win_rate,
                                   this_week_win_bets, this_week_win_rate,
                                   this_week1_of_period_win_bets, this_week1_of_period_win_rate,
                                   (${range}_correct_counts + ${range}_fault_counts) as counts
                              from users__win__lists
                              where users__win__lists.league_id in ( :league_id )
                              HAVING counts > 
                                CASE 
                                    ${limitCase}
                                END
                              order by ${order} desc
                          ) winlist,
                          (
                            select * 
                              from users
                              where status in (1, 2)
                          ) users
                    where winlist.uid = users.uid
                 ) winlist 
            left join titles 
              on winlist.uid = titles.uid 
             and winlist.league_id = titles.league_id
             and titles.period = :period
            left join 
                 (
                   select uid, league_id, max(sell) sell
                     from user__predictions
                    where match_scheduled between :begin and :end
                    group by uid
                 ) prediction
              on titles.uid = prediction.uid
             and titles.league_id = prediction.league_id
           order by ${order} desc limit 30
      `, {
      replacements: {
        league_id: league_id,
        period: period,
        begin: beginUnix,
        end: endUnix
      },
      logging: true,
      type: db.sequelize.QueryTypes.SELECT
    }));
    if (err) {
      console.error('[Error][rank][winListsModel]', err);
      throw errs.dbErrsMsg('404', '13910');
    }

    if (!leagueWinListsQuery || leagueWinListsQuery.length <= 0) return { userlists: winLists }; // 如果沒有找到資料回傳 []

    leagueWinListsQuery.forEach(function(data) { // 這裡有順序性
      leagueWinLists.push(rankUtil.repackage(data, order, type));
    });

    winLists[key] = leagueWinLists;
  }

  return { userlists: winLists[league] };
}
module.exports = winLists;
