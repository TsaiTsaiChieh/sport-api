const { getCurrentPeriod, coreDateInfo, date3UnixInfo, to, moment } = require('../../util/modules');
const { leagueCodebook } = require('../../util/leagueUtil');
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');
const { acceptLeague } = require('../../config/acceptValues');
const { zone_tw } = require('../../config/env_values');
// const { CacheQuery } = require('../../util/redisUtil');

async function winRateLists(args) {
  const range = args.range;
  const league = args.league;
  const nowDate = new Date();
  const currentPeriod = getCurrentPeriod(nowDate);
  const period = currentPeriod.period;
  const nowInfo = coreDateInfo(nowDate);
  const d3 = date3UnixInfo(nowDate);
  const beginUnix = nowInfo.dateBeginUnix;
  const endUnix = d3.tomorrowEndUnix; // nowInfo.dateEndUnix;

  const league_id = [];
  if (league === 'ALL') {
    const len = acceptLeague.length;
    for (let i = 0; i < len; i++) {
      league_id.push(leagueCodebook(acceptLeague[i]).id);
    }
  } else {
    league_id.push(leagueCodebook(league).id);
  }

  // 將來如果要用 參數 或 後台參數 來鎖定聯盟，只要把格式改對應格式即可
  // let winRateLists = {
  //   NBA: [],
  //   MLB: []
  // }
  const winRateLists = {};
  winRateLists[league] = []; // 像上面的範例

  // eslint-disable-next-line no-unused-vars
  for (const [key, value] of Object.entries(winRateLists)) { // 依 聯盟 進行排序
    const leagueWinRateLists = []; // 儲存 聯盟處理完成資料
    const predictCountsCondition = getRatioOfPredictCounts(key, range);

    // 當賣牌時，快取會無法跟上更新
    // const redisKey = ['rank', 'winRateLists', 'users__win__lists', 'titles', league_id, period].join(':');

    const [err, leagueWinRateListsQuery] = await to(db.sequelize.query(`
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
                                   this_week_win_bets, this_week_win_rate,
                                   this_week1_of_period_win_bets, this_week1_of_period_win_rate,
                                   ${range}_correct_counts,${range}_fault_counts
                              from users__win__lists
                             where users__win__lists.league_id in ( :league_id )
                             order by ${rangeWinRateCodebook(range)} desc
                          ) winlist,
                          (
                            select * 
                              from users
                             where status in (1, 2)
                          ) users
                   where winlist.uid = users.uid
                     and (winlist.${range}_correct_counts + winlist.${range}_fault_counts) >= :counts
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
           order by ${rangeWinRateCodebook(range)} desc limit 30
        `, {
      replacements: {
        league_id: league_id,
        period: period,
        begin: beginUnix,
        end: endUnix,
        counts: predictCountsCondition
      },
      type: db.sequelize.QueryTypes.SELECT
    }));
    if (err) {
      console.error('[Error][rank][winRateListsModel] ', err);
      throw errs.dbErrsMsg('404', '14010');
    }
    if (!leagueWinRateListsQuery || leagueWinRateListsQuery.length <= 0) return { userlists: winRateLists }; // 如果沒有找到資料回傳 []
    leagueWinRateListsQuery.forEach(function(data) { // 這裡有順序性
      leagueWinRateLists.push(repackage(data, rangeWinRateCodebook(range)));
    });
    winRateLists[key] = leagueWinRateLists;
  }
  return { userlists: winRateLists[league] };
}

function repackage(ele, rangstr) {
  const data = {
    // win_rate: ele.win_rate,
    uid: ele.uid,
    league_id: ele.league_id,
    avatar: ele.avatar,
    display_name: ele.display_name,
    status: ele.status
  };

  data.win_rate = ele[rangstr];

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

function rangeWinRateCodebook(range) {
  switch (range) {
    case 'this_period':
      return 'this_period_win_rate';
    case 'this_week':
      return 'this_week_win_rate';
    case 'last_week':
      return 'last_week_win_rate';
    case 'this_month':
      return 'this_month_win_rate';
    case 'last_month':
      return 'last_month_win_rate';
    case 'this_season':
      return 'this_season_win_rate';
  }
}

function getRatioOfPredictCounts(league, range) {
  const ratio = league === 'ALL' ? 0.5 : leagueCodebook(league).predicts_perDay;
  const nowDate = new Date();
  const nowInfo = date3UnixInfo(nowDate);
  switch (range) {
    case 'this_period':
    {
      const currentPeriod = getCurrentPeriod(nowDate);
      const periodBegin = moment.tz(currentPeriod.periodBeginDateBeginUnix * 1000, zone_tw);
      const nowMoment = moment.tz(nowDate, zone_tw);
      const days = nowMoment.diff(periodBegin, 'days');
      return days * ratio;
    }
    case 'this_week':
    {
      const weekDays = nowInfo.mdate.isoWeekday();
      return weekDays * ratio;
    }
    case 'last_week':
    {
      return 7 * ratio;
    }
    case 'this_month':
    {
      const monthDays = nowInfo.mdate.format('D');
      return monthDays * ratio;
    }
    case 'last_month': {
      const lastMonthDays = moment().subtract(1, 'months').endOf('month').date();
      return lastMonthDays * ratio;
    }
    case 'this_season':
    {
      return 120 * ratio;
    }
    default:
      return 0;
  }
}
module.exports = winRateLists;
