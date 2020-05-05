const modules = require('../../util/modules');
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');

function winRateLists(args) {
  return new Promise(async function(resolve, reject) {
    // 取得 首頁預設值
    const league_id = 'league_id';
    const defaultValues = await db.sequelize.query(
      `SELECT * FROM match__leagues ORDER BY ${league_id} DESC LIMIT 1`,
      {
        type: db.sequelize.QueryTypes.SELECT,
        plain: true
      });

    // 將來如果要用 參數 或 後台參數 來鎖定聯盟，只要把格式改對應格式即可
    // let winRateLists = {
    //   NBA: [],
    //   MLB: []
    // }

    const winRateLists = {};
    winRateLists[defaultValues.name] = [];

    try {
      for (const [key, value] of Object.entries(winRateLists)) { // 依 聯盟 進行排序
        const leagueWinRateLists = []; // 儲存 聯盟處理完成資料
        const league_id = defaultValues.league_id;
        const order = 'this_month_win_rate';
        const limit = 10;
        const period = modules.getTitlesPeriod(new Date()).period;
        const leagueWinRateListsQuery = await db.sequelize.query(
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

        leagueWinRateListsQuery.forEach(function(data) { // 這裡有順序性
          leagueWinRateLists.push(repackage(data));
        });
        // Promise.all(results)

        winRateLists[key] = leagueWinRateLists;
      }
    } catch (err) {
      console.log('Error in  home/godlists by YuHsien:  %o', err);
      return reject(errs.errsMsg('500', '500', err));
    }

    resolve({ win_rate_lists: winRateLists });
  });
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
