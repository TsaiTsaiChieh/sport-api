const modules = require('../../util/modules');
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');

function winBetsLists(args) {
  return new Promise(async function(resolve, reject) {
    const range = args.range;
    const league = args.league;
    const period = modules.getTitlesPeriod(new Date()).period;

    let winBetsLists = {};
    winBetsLists[league] = [];

    try {
      for (const [key, value] of Object.entries(winBetsLists)) { // 依 聯盟 進行排序
        const leagueWinBetsLists = []; // 儲存 聯盟處理完成資料

        const leagueWinBetsListsQuery = await db.sequelize.query(`
          select winlist.*,
                 titles.rank_id, titles.default_title,
                 titles.continue,
                 titles.predict_rate1, titles.predict_rate2, titles.predict_rate3, titles.win_bets_continue,
                 titles.matches_rate1, titles.matches_rate2, titles.matches_continue
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
                                      where name = :league
                                   ) leagues
                              where users__win__lists.league_id = leagues.league_id
                              order by ${rangeWinBetsCodebook(range)} desc
                              limit 30
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
           order by ${rangeWinBetsCodebook(range)} desc
        `, { 
              replacements: {league: league, period: period}, 
              limit: 30, 
              type: db.sequelize.QueryTypes.SELECT 
           });

        leagueWinBetsListsQuery.forEach(function (data) { // 這裡有順序性
          leagueWinBetsLists.push( repackage(data, rangeWinBetsCodebook(range)) );
        });

        winBetsLists[key] = leagueWinBetsLists;
      }
    } catch (err) {
      console.log('Error in  home/godlists by YuHsien:  %o', err);
      return reject(errs.errsMsg('500', '500', err));
    }

    //resolve({ win_bets_lists: winBetsLists });
    resolve({ userlists: winBetsLists[league] });
    return;
  });
}

function repackage(ele, rangstr) {
  let data = {
    //win_bets: ele.win_bets,
    uid: ele.uid,
    avatar: ele.avatar,
    displayname: ele.display_name,
  };

  data['win_bets'] = ele[rangstr];

  // 大神要 顯示 預設稱號
  if ([1, 2, 3, 4].includes(ele.rank_id)){
    data['rank'] = ele.rank_id;
    data['default_title'] = ele.default_title;
    data['continue'] = ele.continue; // 連贏Ｎ場
    data['predict_rate'] = [ele.predict_rate1, ele.predict_rate2, ele.predict_rate3]; // 近N日 N過 N
    data['predict_rate2'] = [ele.predict_rate1, ele.predict_rate3];  // 近N日過 N
    data['win_bets_continue'] = ele.win_bets_continue, // 勝注連過 Ｎ日
    data['matches_rate'] = [ele.matches_rate1, ele.matches_rate2], // 近 Ｎ 場過 Ｎ 場;
    data['matches_continue'] = ele.matches_continue // 連贏Ｎ場
  }

  return data;
}

function rangeWinBetsCodebook(range){
  switch (range) {
    case 'this_period':
      return 'this_period_win_bets';
    case 'this_week':
      return 'this_week_win_bets';
    case 'last_week':
      return 'last_week_win_bets';
    case 'this_month':
      return 'this_month_win_bets';
    case 'last_month':
      return 'last_month_win_bets';
    case 'this_season':
      return 'this_season_win_bets';
  }
}

module.exports = winBetsLists;
