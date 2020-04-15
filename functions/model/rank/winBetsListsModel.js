const modules = require('../../util/modules');
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');

function winBetsLists(args) {
  return new Promise(async function(resolve, reject) {
    const range = args.range;
    const league = args.league;

    let winBetsLists = {};
    winBetsLists[league] = []; // 像上面的範例

    try {
      for (const [key, value] of Object.entries(winBetsLists)) { // 依 聯盟 進行排序
        const leagueWinBetsLists = []; // 儲存 聯盟處理完成資料

        // 依 聯盟 取出是 大神資料 且 有販售
        // 將來有排序條件，可以orderBy，但會和下面的order衝突
        const leagueWinBetsListsQuery = await db.sequelize.query(`
          select winlist.uid, users.avatar, users.display_name, 
                 winlist.last_month_win_bets, winlist.last_month_win_rate, 
                 winlist.last_week_win_bets, winlist.last_week_win_rate,
                 winlist.this_season_win_bets, winlist.this_season_win_rate,
                 winlist.this_period_win_bets, winlist.this_period_win_rate,
                 winlist.this_month_win_bets, winlist.this_month_win_rate,
                 winlist.this_week_win_bets, winlist.this_week_win_rate,
                 titles.rank_id, titles.default_title,
                 titles.continune, 
                 titles.predict_rate1, titles.predict_rate2, titles.predict_rate3, titles.win_bets_continue,
                 titles.matches_rate1, titles.matches_rate2, titles.matches_continue
            from users__win__lists winlist,
                 ( 
                   select league_id 
                     from match__leagues
                    where name = '${league}' 
                 ) leagues,
                 (
                   select * 
                     from users
                    where status in (1, 2)
                 ) users
                 left join titles on users.uid = titles.uid 
           where winlist.league_id = leagues.league_id
             and winlist.uid = users.uid
           order by ${rangeCodebook(range)} desc
        `, { limit: 30, type: db.sequelize.QueryTypes.SELECT });

        // const leagueWinBetsListsQuery = await modules.firestore.collection(`users_win_lists_${key}`)
        //   .orderBy(`${rangeCodebook(range)}`, 'desc')
        //   .limit(30)
        //   .get();

        leagueWinBetsListsQuery.forEach(function (data) { // 這裡有順序性
          leagueWinBetsLists.push( repackage(data, rangeCodebook(range)) );
        });

        winBetsLists[key] = leagueWinBetsLists;
      }
    } catch (err) {
      console.log('Error in  home/godlists by YuHsien:  %o', err);
      return reject(errs.errsMsg('500', '500', err));
    }

    resolve({ win_bets_lists: winBetsLists });
    return;
  });
}

function repackage(ele, rangstr) {
  let data = {
    win_bets: '',
    uid: ele.uid,
    avatar: ele.avatar,
    displayname: ele.display_name,
  };

  data[rangstr] = ele[rangstr];

  // 大神要 顯示 預設稱號
  if ([1, 2, 3, 4].includes(ele.rank_id)){
    data['rank'] = ele.rank_id;
    data['default_title'] = ele.default_title; // 目前 使用者資料表 只有一個預設 title 值
    data['continune'] = ele.continue; // 連贏Ｎ場
    data['predict_rate'] = [ele.predict_rate1, ele.predict_rate2, ele.predict_rate3]; // 近N日 N過 N
    data['predict_rate2'] = [ele.predict_rate1, ele.predict_rate3];  // 近N日過 N
    data['win_bets_continue'] = ele.win_bets_continue, // 勝注連過 Ｎ日
    data['matches_rate'] = [ele.matches_rate1, ele.matches_rate2], // 近 Ｎ 場過 Ｎ 場;
    data['matches_continue'] = ele.matches_continue // 連贏Ｎ場
  }

  return data;
}

function rangeCodebook(range){
  'this_week', 'last_week', 'this_month', 'last_month', 'this_session'
  switch (range) {
    case 'this_week':
      return 'this_week_win_bets';
    case 'last_week':
      return 'last_week_win_bets';
    case 'this_month':
      return 'this_month_win_bets';
    case 'last_month':
      return 'last_month_win_bets';
    case 'this_session':
      return 'this_session_win_bets';
  }
}

module.exports = winBetsLists;
