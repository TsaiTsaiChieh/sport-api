const { getTitlesPeriod, leagueCodebook, coreDateInfo, to } = require('../../util/modules');
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');

async function winBetsLists(args) {
  const range = args.range;
  const league = args.league;
  const league_id = leagueCodebook(league).id;
  const period = getTitlesPeriod(new Date()).period;
  const nowInfo = coreDateInfo(new Date());
  const beginUnix = nowInfo.dateBeginUnix;
  const endUnix = nowInfo.dateEndUnix;

  const winBetsLists = {};
  winBetsLists[league] = [];

  // eslint-disable-next-line no-unused-vars
  for (const [key, value] of Object.entries(winBetsLists)) { // 依 聯盟 進行排序
    const leagueWinBetsLists = []; // 儲存 聯盟處理完成資料

    // 大神賣牌狀態 sell (-1：無狀態  0：免費  1：賣牌)
    const [err, leagueWinBetsListsQuery] = await to(db.sequelize.query(`
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
                   select winlist.*, users.avatar, users.display_name, users.status
                     from (
                            select uid, users__win__lists.league_id, 
                                   last_month_win_bets, last_month_win_rate, 
                                   last_week_win_bets, last_week_win_rate,
                                   this_season_win_bets, this_season_win_rate,
                                   this_period_win_bets, this_period_win_rate,
                                   this_month_win_bets, this_month_win_rate,
                                   this_week_win_bets, this_week_win_rate
                              from users__win__lists
                              where users__win__lists.league_id = :league_id
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
            left join 
                 (
                   select uid, max(sell) sell
                     from user__predictions
                    where match_scheduled between :begin and :end
                    group by uid
                 ) prediction
              on titles.uid = prediction.uid
           order by ${rangeWinBetsCodebook(range)} desc
      `, {
      replacements: {
        league_id: league_id,
        period: period,
        begin: beginUnix,
        end: endUnix
      },
      limit: 30,
      type: db.sequelize.QueryTypes.SELECT
    }));
    if (err) {
      console.error('Error 2. in rank/winBetsListsModel by YuHsien', err);
      throw errs.dbErrsMsg('404', '13910');
    }

    leagueWinBetsListsQuery.forEach(function(data) { // 這裡有順序性
      leagueWinBetsLists.push(repackage(data, rangeWinBetsCodebook(range)));
    });

    winBetsLists[key] = leagueWinBetsLists;
  }

  return { userlists: winBetsLists[league] };
}

function repackage(ele, rangstr) {
  const data = {
    // win_bets: ele.win_bets,
    uid: ele.uid,
    avatar: ele.avatar,
    display_name: ele.display_name,
    status: ele.status
  };

  data.win_bets = ele[rangstr];

  // 大神要 顯示 預設稱號
  if ([1, 2, 3, 4].includes(ele.rank_id)) {
    data.rank = `${ele.rank_id}`;
    data.sell = ele.sell;
    data.default_title = ele.default_title;
    data.continue = ele.continue; // 連贏Ｎ場
    data.predict_rate = [ele.predict_rate1, ele.predict_rate2, ele.predict_rate3]; // 近N日 N過 N
    data.predict_rate2 = [ele.predict_rate1, ele.predict_rate3]; // 近N日過 N
    data.win_bets_continue = ele.win_bets_continue; // 勝注連過 Ｎ日
    data.matches_rate = [ele.matches_rate1, ele.matches_rate2]; // 近 Ｎ 場過 Ｎ 場;
    data.matches_continue = ele.matches_continue; // 連贏Ｎ場
  }

  return data;
}

function rangeWinBetsCodebook(range) {
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
