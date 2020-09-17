const { getCurrentPeriod, date3UnixInfo, moment } = require('../util/modules');
const { zone_tw } = require('../config/env_values');
function getRatioOfPredictCounts(ratio, range) {
  // const ratio = league === 'ALL' ? 0.5 : leagueCodebook(league).predicts_perDay;
  const nowDate = new Date();
  const nowInfo = date3UnixInfo(nowDate);
  switch (range) {
    case 'this_period': {
      const currentPeriod = getCurrentPeriod(nowDate);
      const periodBegin = moment.tz(currentPeriod.periodBeginDateBeginUnix * 1000, zone_tw);
      const nowMoment = moment.tz(nowDate, zone_tw);
      const days = nowMoment.diff(periodBegin, 'days');
      return days * ratio;
    }
    case 'this_week': {
      const weekDays = nowInfo.mdate.isoWeekday();
      return weekDays * ratio;
    }
    case 'last_week': {
      return 7 * ratio;
    }
    case 'this_month': {
      const monthDays = nowInfo.mdate.format('D');
      return monthDays * ratio;
    }
    case 'last_month': {
      const lastMonthDays = moment().subtract(1, 'months').endOf('month').date();
      return lastMonthDays * ratio;
    }
    case 'this_season': {
      return 30 * ratio;
    }
    default:
      return 0;
  }
}

function repackage(ele, rangstr, type) {
  const data = {
    // win_bets: ele.win_bets,
    uid: ele.uid,
    league_id: ele.league_id,
    avatar: ele.avatar,
    display_name: ele.display_name,
    status: ele.status
  };

  data[`win_${type}`] = ele[rangstr];

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

module.exports = {
  getRatioOfPredictCounts,
  repackage
};
