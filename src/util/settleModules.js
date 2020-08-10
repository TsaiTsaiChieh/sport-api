const { groupBy, NP } = require('./modules');

// 取小數位
// point = Math.abs(num) - parseInt(Math.abs(num));
/*
{
  homePoints:
  awayPoints:
  spreadHandicap:
  spreadHomeOdd:
  spreadAwayOdd:
}
*/
function settleSpread(data) {
  // handciap: 正:主讓客  負:客讓主
  const homePoints = data.homePoints;
  const awayPoints = data.awayPoints;

  const handicap = data.spreadHandicap;
  const rate = data.spreadRate;
  // const homeOdd = data.spreadHomeOdd;
  // const awayOdd = data.spreadAwayOdd;

  // 平盤有兩情況
  // fair 要計算注數，會分輸贏
  // fair2 平盤 不要計算注數
  // fair 因為前端顯示需求，需要進行變更
  //   特別顯示規定： (跟原本規則相反)
  //     1. handicap > 0 主讓客 且 rate 為 負 要顯示 代表壓客贏 fair|away
  //     2. handicap < 0 客讓主 且 rate 為 正 要顯示 代表壓客贏 fair|away
  return homePoints - handicap === awayPoints
    ? rate === 0
      ? 'fair2'
      : (handicap > 0 && rate < 0) || (handicap < 0 && rate > 0)
        ? 'fair|away'
        : 'fair|home'
    : homePoints - handicap > awayPoints
      ? 'home'
      : 'away';
}

// point 用來取得 handicap 的 小數位數值
// 整數、0.5 為一般處理
// 0.25 需要另外判斷
// 0.75 需要另外判斷
function settleSpreadSoccer(data) {
  const sp_25 = [0.25];
  // const sp_5 = [0.5];
  const sp_75 = [0.75];
  const homePoints = data.homePoints;
  const awayPoints = data.awayPoints;

  const handicap = Math.abs(data.spreadHandicap);
  const point = handicap - parseInt(handicap);
  const result = homePoints - awayPoints - handicap;

  // 整數 和局
  if (result === 0) return 'fair2';

  if (sp_25.includes(point)) {
    return result === -0.25 ? 'fair|away' : result > -0.25 ? 'home' : 'away';
  }

  if (sp_75.includes(point)) {
    return result === 0.25 ? 'fair|home' : result > 0.25 ? 'home' : 'away';
  }

  // 整數 和 0.5
  return result > 0 ? 'home' : 'away';
}

/*
{
  homePoints:
  awayPoints:
  totalsHandicap:
  totalsOverOdd:
  totalsUnderOdd:
}
*/
function settleTotals(data) {
  // handciap: 正:主讓客  負:客讓主
  const homePoints = data.homePoints;
  const awayPoints = data.awayPoints;

  const handicap = data.totalsHandicap;
  const rate = data.totalsRate;
  // const overOdd = data.totalsOverOdd;
  // const underOdd = data.totalsUnderOdd;

  // 平盤有兩情況
  // fair 因為前端顯示需求，需要進行變更
  //   特別顯示規定： (跟原本規則相反) (大小 handicap 只會大於 0，所以只考慮這個情況，跟讓分不同)
  //     1. handicap > 0 主讓客 且 rate 為 負 要顯示 代表壓客贏 fair|away
  return homePoints + awayPoints === handicap
    ? rate === 0
      ? 'fair2'
      : handicap > 0 && rate > 0
        ? 'fair|over'
        : 'fair|under'
    : homePoints + awayPoints > handicap
      ? 'over'
      : 'under';
}

// point 用來取得 handicap 的 小數位數值
// 整數、0.5 為一般處理
// 0.25 需要另外判斷
// 0.75 需要另外判斷
function settleTotalsSoccer(data) {
  const sp_25 = [0.25];
  // const sp_5 = [0.5];
  const sp_75 = [0.75];
  const homePoints = data.homePoints;
  const awayPoints = data.awayPoints;

  const handicap = Math.abs(data.totalsHandicap);
  const point = handicap - parseInt(handicap);
  const result = homePoints + awayPoints - handicap;

  // 整數 和局
  if (result === 0) return 'fair2';

  if (sp_25.includes(point)) {
    return result === -0.25 ? 'fair|under' : result > -0.25 ? 'over' : 'under';
  }

  if (sp_75.includes(point)) {
    return result === 0.25 ? 'fair|over' : result > 0.25 ? 'over' : 'under';
  }

  // 整數 和 0.5
  return result > 0 ? 'over' : 'under';
}

// option: home、away、over、under
// settleResult: home、away、over、under, fair2, 'fair|home', 'fair|away', 'fair|over', 'fair|under'
// rate: 目前固定50，將來是 +5,+10,+15...+100   -5,-10,-15...-100
function predictionsResultFlag(option, settleResult, rate = 50) {
  const rateDivide100 = NP.divide(rate, 100);
  // 先處理 fair 平盤情況 'fair|home', 'fair|away', 'fair|over', 'fair|under'
  if (
    ['fair|home', 'fair|away', 'fair|over', 'fair|under'].includes(settleResult)
  ) {
    const settleOption = settleResult.split('|')[1];

    // rateDivide100 > 0 代表 rate 為正，計算規則照舊
    // rateDivide100 < 0 代表 rate 為負，上面 讓分、大小 輸贏判斷已經有調整 (跟原本規則相反)
    //  故要倒回原本情況，計算才是正確
    if (rateDivide100 > 0) return (settleOption === option) ? rateDivide100 : -rateDivide100;
    // if (rateDivide100 < 0)
    return settleOption === option ? -rateDivide100 : rateDivide100;
  }

  // -2 未結算，-1 輸，0 不算，1 贏，0.xx 輸，-0.xx   //無效 0.5 平 (一半一半)
  return settleResult === 'fair2' ? 0 : settleResult === option ? 1 : -1;
}

/* 輸入資料格式
  [
    {
      uid: '3IB0w6G4V8QUM2Ti3iCIfX4Viux1',
      league_id: 3939,
      spread_bets: null,
      totals_bets: 1,
      spread_result_flag: -2,
      totals_result_flag: -1
    },
    {
      uid: '2WMRgHyUwvTLyHpLoANk7gWADZn1',
      league_id: 3939,
      spread_bets: 3,
      totals_bets: 3,
      spread_result_flag: -1,
      totals_result_flag: 1     // 0.95
    },
    {
      uid: '2WMRgHyUwvTLyHpLoANk7gWADZn1',
      league_id: 3939,
      spread_bets: 1,
      totals_bets: 2,
      spread_result_flag: 1,    // 0.95,
      totals_result_flag: -1
    }
  ]
*/
function predictionsWinList(data) {
  // correct 和 fault 改成 >0 <0
  // const correct = [1, 0.5]; // 0.95 // 以後可能 >0 贏  <0 輸  賠率不同情況下，計算會含在 >0 <0  裡面
  // const fault = [-1, -0.5]; // // 以後可能 >0 贏  <0 輸  賠率不同情況下，計算會含在 >0 <0  裡面
  const result = [];

  // 先以 uid 分類，再用 league_id 分類
  const rePredictMatchInfo = groupBy(data, 'uid');

  rePredictMatchInfo.forEach(function(uids) {
    const reLeagues = groupBy(uids, 'league_id');

    reLeagues.forEach(function(ele) {
      // cur.spread_bets !== null or cur.totals_bets !== null 主要是確認是否有下注的情況，有可能有盤口結果，但使用者該盤口未下注
      // cur.spread_result_flag > 0 or cur.totals_result_flag > 0 主要是用來判斷 猜對
      // cur.spread_result_flag >= -1 & < 0 or cur.totals_result_flag >=- 1 & < 0 主要是用來判斷 猜錯
      // 整理上述 有下注猜對，有下注猜錯 這兩種情況才會計算 場數 和 注數
      // 注數計算需要特別注意，如果 result_flag 為 null 會產生計算錯誤，正常情況下 result_flag 是不會產生 null 情況

      // 勝率 winRate
      const predictSpreadCorrectCounts = ele.reduce(
        (acc, cur) => (cur.spread_bets !== null && cur.spread_result_flag > 0 ? ++acc : acc), // (correct.includes(cur.spread_result_flag)
        0
      );
      const predictTotalsCorrectCounts = ele.reduce(
        (acc, cur) => (cur.totals_bets !== null && cur.totals_result_flag > 0 ? ++acc : acc), // (correct.includes(cur.totals_result_flag)
        0
      );
      const predictCorrectCounts = NP.plus(predictSpreadCorrectCounts, predictTotalsCorrectCounts);

      const predictSpreadFaultCounts = ele.reduce(
        (acc, cur) => (cur.spread_bets !== null && cur.spread_result_flag >= -1 && cur.spread_result_flag < 0 ? ++acc : acc), // fault.includes(cur.spread_result_flag)
        0
      );
      const predictTotalsFaultCounts = ele.reduce(
        (acc, cur) => (cur.totals_bets !== null && cur.totals_result_flag >= -1 && cur.totals_result_flag < 0 ? ++acc : acc), // fault.includes(cur.totals_result_flag)
        0
      );
      const predictFaultCounts = NP.plus(predictSpreadFaultCounts, predictTotalsFaultCounts);

      // 避免分母是0 平盤無效
      const spreadWinRate =
        NP.plus(predictSpreadCorrectCounts, predictSpreadFaultCounts) === 0
          ? 0
          : NP.divide(
            predictSpreadCorrectCounts,
            NP.plus(predictSpreadCorrectCounts, predictSpreadFaultCounts)
          );
      const totalsWinRate =
        NP.plus(predictTotalsCorrectCounts, predictTotalsFaultCounts) === 0
          ? 0
          : NP.divide(
            predictTotalsCorrectCounts,
            NP.plus(predictTotalsCorrectCounts, predictTotalsFaultCounts)
          );
      const winRate =
        NP.plus(predictCorrectCounts, predictFaultCounts) === 0
          ? 0
          : NP.divide(
            predictCorrectCounts,
            NP.plus(predictCorrectCounts, predictFaultCounts)
          );

      // 勝注
      const predictSpreadCorrectBets = ele.reduce( // correct.includes(cur.spread_result_flag)
        (acc, cur) =>
          cur.spread_bets !== null && cur.spread_result_flag > 0
            ? NP.plus(NP.times(cur.spread_result_flag, cur.spread_bets), acc)
            : acc,
        0
      );
      const predictTotalsCorrectBets = ele.reduce( // correct.includes(cur.totals_result_flag)
        (acc, cur) =>
          cur.totals_bets !== null && cur.totals_result_flag > 0
            ? NP.plus(NP.times(cur.totals_result_flag, cur.totals_bets), acc)
            : acc,
        0
      );
      const predictCorrectBets = NP.plus(predictSpreadCorrectBets, predictTotalsCorrectBets);

      const predictSpreadFaultBets = ele.reduce( // fault.includes(cur.spread_result_flag)
        (acc, cur) =>
          cur.spread_bets !== null && cur.spread_result_flag >= -1 && cur.spread_result_flag < 0
            ? NP.plus(NP.times(cur.spread_result_flag, cur.spread_bets), acc)
            : acc,
        0
      );
      const predictTotalsFaultBets = ele.reduce( // fault.includes(cur.totals_result_flag)
        (acc, cur) =>
          cur.totals_bets !== null && cur.totals_result_flag >= -1 && cur.totals_result_flag < 0
            ? NP.plus(NP.times(cur.totals_result_flag, cur.totals_bets), acc)
            : acc,
        0
      );
      const predictFaultBets = NP.plus(predictSpreadFaultBets, predictTotalsFaultBets);

      const spreadWinBets = NP.plus(predictSpreadCorrectBets, predictSpreadFaultBets);
      const totalsWinBets = NP.plus(predictTotalsCorrectBets, predictTotalsFaultBets);
      const winBets = NP.plus(predictCorrectBets, predictFaultBets);

      result.push({
        uid: ele[0].uid,
        league_id: ele[0].league_id,
        win_rate: winRate,
        win_bets: winBets,
        matches_count: ele.length,
        correct_counts: predictCorrectCounts,
        fault_counts: predictFaultCounts,
        spread_correct_counts: predictSpreadCorrectCounts,
        totals_correct_counts: predictTotalsCorrectCounts,
        spread_fault_counts: predictSpreadFaultCounts,
        totals_fault_counts: predictTotalsFaultCounts,
        spread_win_rate: spreadWinRate,
        totals_win_rate: totalsWinRate,
        spread_correct_bets: predictSpreadCorrectBets,
        totals_correct_bets: predictTotalsCorrectBets,
        spread_fault_bets: predictSpreadFaultBets,
        totals_fault_bets: predictTotalsFaultBets,
        spread_win_bets: spreadWinBets,
        totals_win_bets: totalsWinBets
      });

      // console.log('\n');
      // console.log('%o totalPredictCounts: %f  predictCorrectCounts: %f  predictFaultCounts: %f',
      //   ele[0].uid, totalPredictCounts, predictCorrectCounts, predictFaultCounts);
      // console.log('winRate: %f', winRate * 100);

      // console.log('%o predictCorrectBets: %f  predictFaultBets: %f ',
      //   ele[0].uid, predictCorrectBets, predictFaultBets);
      // console.log('winBets: %0.2f', winBets);

      // console.log('\n');
      // console.log('re: ', ele);
    });
  });
  return result;
}

// 結算退款 搞幣紅利 settleRefundCoinDividend
// 輸入：price, sub_price, coin, dividend
// 輸出退款：coin_real, dividend_real, coin, dividend
function settleRefundCoinDividend(price, sub_price, coin, dividend) {
  NP.enableBoundaryChecking(false);
  const refundMoney = 90; // NP.minus(price, sub_price);
  const r_coin_real = NP.round(NP.divide(NP.times(coin, refundMoney), price), 2);
  const r_dividend_real = NP.minus(refundMoney, r_coin_real);
  const r_coin = Math.ceil(r_coin_real);
  const r_dividend = NP.minus(refundMoney, r_coin);
  return { coin_real: r_coin_real, dividend_real: r_dividend_real, coin: r_coin, dividend: r_dividend };
}

// 結算 搞錠 settleIngot
// 輸入：price, sub_price
// 輸出：money_real, ingot_real, money, ingot
function settleIngot(price, sub_price) {
  NP.enableBoundaryChecking(false);
  // const refundMoney = 90; // NP.minus(price, sub_price);
  const r_money_real = NP.round(NP.divide(price, 2), 2);
  const r_ingot_real = NP.minus(price, r_money_real);
  const r_money = Math.ceil(r_money_real);
  const r_ingot = NP.minus(price, r_money);
  return { money_real: r_money_real, ingot_real: r_ingot_real, money: r_money, ingot: r_ingot };
}

// 結算 退款搞錠 settleRefundIngot
// 輸入：price, sub_price
// 輸出退款：money_real, ingot_real, money, ingot
function settleRefundIngot(price, sub_price) {
  NP.enableBoundaryChecking(false);
  const refundMoney = NP.minus(price, 90);
  const r_money_real = NP.round(NP.divide(refundMoney, 2), 2);
  const r_ingot_real = NP.minus(refundMoney, r_money_real);
  const r_money = Math.ceil(r_money_real);
  const r_ingot = NP.minus(refundMoney, r_money);
  return { money_real: r_money_real, ingot_real: r_ingot_real, money: r_money, ingot: r_ingot };
}

module.exports = {
  settleSpread,
  settleSpreadSoccer,
  settleTotals,
  settleTotalsSoccer,
  predictionsResultFlag,
  predictionsWinList,
  settleRefundCoinDividend,
  settleIngot,
  settleRefundIngot
};
