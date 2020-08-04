const { getTitlesPeriod, to } = require('../../util/modules');
const { leagueCodebook } = require('../../util/leagueUtil');
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');
const { CacheQuery } = require('../../util/redisUtil');

async function winBetsLists() {
  // 取得 首頁預設值
  const listLeague = await db.Home_List.findOneCache({ where: { id: 1 } });
  const defaultLeague = listLeague.god_list;
  const defaultLeagueID = leagueCodebook(defaultLeague).id;

  // 將來如果要用 參數 或 後台參數 來鎖定聯盟，只要把格式改對應格式即可
  // let winRateLists = {
  //   NBA: [],
  //   MLB: []
  // }

  const winBetsLists = {};
  winBetsLists[defaultLeague] = [];

  // eslint-disable-next-line no-unused-vars
  for (const [key, value] of Object.entries(winBetsLists)) { // 依 聯盟 進行排序
    const leagueWinBetsLists = []; // 儲存 聯盟處理完成資料
    const league_id = defaultLeagueID;
    const order = 'this_month_win_bets';
    const limit = 10;
    const period = getTitlesPeriod(new Date()).period;

    const redisKey = ['home', 'winBetsLists', 'users__win__lists', 'titles', league_id, period].join(':');
    const [err, leagueWinBetsListsQuery] = await to(CacheQuery(db.sequelize, `
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
      console.error('[Error][home][WinBetsListsModel][CacheQuery] ', err);
      throw errs.dbErrsMsg('404', '14030');
    }

    if (!leagueWinBetsListsQuery || leagueWinBetsListsQuery.length <= 0) return { win_bets_lists: winBetsLists }; // 如果沒有找到資料回傳 []

    leagueWinBetsListsQuery.forEach(function(data) { // 這裡有順序性
      leagueWinBetsLists.push(repackage(data));
    });

    winBetsLists[key] = leagueWinBetsLists;
  }

  return { win_bets_lists: winBetsLists };
}

function repackage(ele) {
  const data = {
    win_bets: '',
    uid: ele.uid,
    avatar: ele.avatar,
    display_name: ele.display_name,
    rank: ''
  };

  /* 欄位無資料防呆 */
  data.win_bets = ele.this_month_win_bets == null ? null : ele.this_month_win_bets.toString();
  data.rank = ele.rank_id == null ? null : ele.rank_id.toString();

  return data;
}

module.exports = winBetsLists;
