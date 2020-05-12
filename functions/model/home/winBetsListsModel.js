const modules = require('../../util/modules');
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');

function winBetsLists(args) {
  return new Promise(async function(resolve, reject) {
    // 取得 首頁預設值
    const listLeague = await db.Home_List.findOne({ where: { id: 1 } });
    const defaultLeague = listLeague.god_list;
    const defaultLeagueID = modules.leagueCodebook(defaultLeague).id;

    // 將來如果要用 參數 或 後台參數 來鎖定聯盟，只要把格式改對應格式即可
    // let winRateLists = {
    //   NBA: [],
    //   MLB: []
    // }

    const winBetsLists = {};
    winBetsLists[defaultLeague] = [];

    try {
      for (const [key, value] of Object.entries(winBetsLists)) { // 依 聯盟 進行排序
        const leagueWinBetsLists = []; // 儲存 聯盟處理完成資料
        const league_id = defaultLeagueID;
        const order = 'this_month_win_bets';
        const limit = 10;
        const period = modules.getTitlesPeriod(new Date()).period;
        const leagueWinBetsListsQuery = await db.sequelize.query(
          `
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
                              from users__win__lists,
                                   ( 
                                     select league_id 
                                       from match__leagues
                                       where league_id = ${league_id}
                                   ) leagues
                             where users__win__lists.league_id = leagues.league_id
                             order by ${order} desc
                             limit ${limit}
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
            and titles.period = ${period}
            order by ${order} desc
          `,
          {
            type: db.sequelize.QueryTypes.SELECT
          });

        leagueWinBetsListsQuery.forEach(function(data) { // 這裡有順序性
          leagueWinBetsLists.push(repackage(data));
        });
        // Promise.all(results)
        winBetsLists[key] = leagueWinBetsLists;
      }
    } catch (err) {
      console.log('Error in  home/godlists by YuHsien:  %o', err);
      return reject(errs.errsMsg('500', '500', err));
    }

    resolve({ win_bets_lists: winBetsLists });
  });
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
