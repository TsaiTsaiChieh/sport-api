const modules = require('../util/modules');

describe('計算 使用者 擁有預測單 合計 勝率、勝注', () => {
  it('兩個人 各一筆 ', () => {
    const data =
      [
        {
          uid: '3IB0w6G4V8QUM2Ti3iCIfX4Viux1',
          spread_bets: null,
          totals_bets: 1,
          spread_result_flag: -2,
          totals_result_flag: -1
        },
        {
          uid: '2WMRgHyUwvTLyHpLoANk7gWADZn1',
          spread_bets: 3,
          totals_bets: 3,
          spread_result_flag: -1,
          totals_result_flag: 0.95
        }
      ];

    const settleResult = modules.predictionsWinList(data);
    expect(settleResult['3IB0w6G4V8QUM2Ti3iCIfX4Viux1']).toHaveProperty('winRate', 0);
    expect(settleResult['3IB0w6G4V8QUM2Ti3iCIfX4Viux1']).toHaveProperty('winBets', -1.00);

    expect(settleResult['2WMRgHyUwvTLyHpLoANk7gWADZn1']).toHaveProperty('winRate', 50);
    expect(settleResult['2WMRgHyUwvTLyHpLoANk7gWADZn1']).toHaveProperty('winBets', -0.15);
  });

  it('兩個人 1人一筆 1人二筆 ', () => {
    const data =
      [
        {
          uid: '3IB0w6G4V8QUM2Ti3iCIfX4Viux1',
          spread_bets: null,
          totals_bets: 1,
          spread_result_flag: -2,
          totals_result_flag: -1
        },
        {
          uid: '2WMRgHyUwvTLyHpLoANk7gWADZn1',
          spread_bets: 3,
          totals_bets: 3,
          spread_result_flag: -1,
          totals_result_flag: 0.95
        },
        {
          uid: '2WMRgHyUwvTLyHpLoANk7gWADZn1',
          spread_bets: 2,
          totals_bets: 1,
          spread_result_flag: 0.95,
          totals_result_flag: -1
        }
      ];

    const settleResult = modules.predictionsWinList(data);
    expect(settleResult['3IB0w6G4V8QUM2Ti3iCIfX4Viux1']).toHaveProperty('winRate', 0);
    expect(settleResult['3IB0w6G4V8QUM2Ti3iCIfX4Viux1']).toHaveProperty('winBets', -1.00);

    expect(settleResult['2WMRgHyUwvTLyHpLoANk7gWADZn1']).toHaveProperty('winRate', 50);
    expect(settleResult['2WMRgHyUwvTLyHpLoANk7gWADZn1']).toHaveProperty('winBets', 0.75);
  });
});
