const { getTitlesPeriod, to } = require('../../util/modules');
const { leagueCodebook } = require('../../util/leagueUtil');
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');
const { CacheQuery } = require('../../util/redisUtil');

async function winRateLists() {
  // 取得 首頁預設值
  const listLeague = await db.Home_List.findOneCache({ where: { id: 1 } });
  const defaultLeague = listLeague.god_list;
  const defaultLeagueID = leagueCodebook(defaultLeague).id;

  // 將來如果要用 參數 或 後台參數 來鎖定聯盟，只要把格式改對應格式即可
  // let winRateLists = {
  //   NBA: [],
  //   MLB: []
  // }

  const winRateLists = {};
  winRateLists[defaultLeague] = [];

  // eslint-disable-next-line no-unused-vars
  for (const [key, value] of Object.entries(winRateLists)) { // 依 聯盟 進行排序
    const leagueWinRateLists = []; // 儲存 聯盟處理完成資料
    const league_id = defaultLeagueID;
    const order = 'this_month_win_rate';
    const limit = 10;
    const period = getTitlesPeriod(new Date()).period;

    const redisKey = ['home', 'winRateLists', 'users__win__lists', 'titles', league_id, period].join(':');
    const [err, leagueWinRateListsQuery] = await to(CacheQuery(db.sequelize, `
          select winlist.*, titles.rank_id
                 
            from (
                   select winlist.*, users.avatar, users.display_name
                     from (
                            select uid, users__win__lists.league_id, 
                                   last_month_win_bets, last_month_win_rate, 
                                   last_week_win_bets, last_week_win_rate,
                                   this_season_win_bets, this_season_win_rate,
                                   this_period_win_bets, this_period_win_rate,
                                   this_month_win_bets, this_month_win_rate,
                                   this_week_win_bets, this_week_win_rate
                              from users__win__lists
                             where league_id = :league_id
                          ) winlist,
                          (
                            select * 
                              from users
                             where status = 2
                          ) users
                    where winlist.uid = users.uid
                 ) winlist
           inner join titles 
              on winlist.uid = titles.uid 
             and winlist.league_id = titles.league_id
             and titles.period = :period
           order by ${order} desc
           limit ${limit}
    `, {
      replacements: {
        league_id: league_id,
        period: period
      },
      type: db.sequelize.QueryTypes.SELECT
    }, redisKey));
    if (err) {
      console.error('[Error][home][winRateListsModel][CacheQuery] ', err);
      throw errs.dbErrsMsg('404', '14040');
    }

    if (!leagueWinRateListsQuery || leagueWinRateListsQuery.length <= 0) return { win_rate_lists: winRateLists }; // 如果沒有找到資料回傳 []

    leagueWinRateListsQuery.forEach(function(data) { // 這裡有順序性
      leagueWinRateLists.push(repackage(data));
    });

    winRateLists[key] = leagueWinRateLists;
  }

  return { win_rate_lists: winRateLists };
}

function repackage(ele) {
  const data = {
    win_rate: '',
    uid: ele.uid,
    avatar: ele.avatar,
    display_name: ele.display_name,
    rank: ''
  };

  /* 欄位無資料防呆 */
  data.win_rate = ele.this_month_win_rate == null ? null : ele.this_month_win_rate.toString();
  data.rank = ele.rank_id == null ? null : ele.rank_id.toString();

  return data;
}

module.exports = winRateLists;
