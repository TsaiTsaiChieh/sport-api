require('dotenv').config();
const { predictionsWinList } = require('../util/settleModules');

describe('計算 使用者 擁有預測單 合計 勝率、勝注', () => {
  it('兩個人 各一筆 ', () => {
    const data =
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
          totals_result_flag: 1
        }
      ];

    const settleResult = predictionsWinList(data);

    expect(settleResult[0]).toHaveProperty('uid', '3IB0w6G4V8QUM2Ti3iCIfX4Viux1');
    expect(settleResult[0]).toHaveProperty('win_rate', 0);
    expect(settleResult[0]).toHaveProperty('win_bets', -1);
    expect(settleResult[0]).toHaveProperty('matches_count', 1);
    expect(settleResult[0]).toHaveProperty('correct_counts', 0);
    expect(settleResult[0]).toHaveProperty('fault_counts', 1);
    expect(settleResult[0]).toHaveProperty('spread_correct_counts', 0);
    expect(settleResult[0]).toHaveProperty('totals_correct_counts', 0);
    expect(settleResult[0]).toHaveProperty('spread_fault_counts', 0);
    expect(settleResult[0]).toHaveProperty('totals_fault_counts', 1);
    expect(settleResult[0]).toHaveProperty('spread_win_rate', 0);
    expect(settleResult[0]).toHaveProperty('totals_win_rate', 0);
    expect(settleResult[0]).toHaveProperty('spread_correct_bets', 0);
    expect(settleResult[0]).toHaveProperty('totals_correct_bets', 0);
    expect(settleResult[0]).toHaveProperty('spread_fault_bets', 0);
    expect(settleResult[0]).toHaveProperty('totals_fault_bets', -1);
    expect(settleResult[0]).toHaveProperty('spread_win_bets', 0);
    expect(settleResult[0]).toHaveProperty('totals_win_bets', -1);

    expect(settleResult[1]).toHaveProperty('uid', '2WMRgHyUwvTLyHpLoANk7gWADZn1');
    expect(settleResult[1]).toHaveProperty('win_rate', 0.5);
    expect(settleResult[1]).toHaveProperty('win_bets', 0);
    expect(settleResult[1]).toHaveProperty('matches_count', 1);
    expect(settleResult[1]).toHaveProperty('correct_counts', 1);
    expect(settleResult[1]).toHaveProperty('fault_counts', 1);
    expect(settleResult[1]).toHaveProperty('spread_correct_counts', 0);
    expect(settleResult[1]).toHaveProperty('totals_correct_counts', 1);
    expect(settleResult[1]).toHaveProperty('spread_fault_counts', 1);
    expect(settleResult[1]).toHaveProperty('totals_fault_counts', 0);
    expect(settleResult[1]).toHaveProperty('spread_win_rate', 0);
    expect(settleResult[1]).toHaveProperty('totals_win_rate', 1);
    expect(settleResult[1]).toHaveProperty('spread_correct_bets', 0);
    expect(settleResult[1]).toHaveProperty('totals_correct_bets', 3);
    expect(settleResult[1]).toHaveProperty('spread_fault_bets', -3);
    expect(settleResult[1]).toHaveProperty('totals_fault_bets', 0);
    expect(settleResult[1]).toHaveProperty('spread_win_bets', -3);
    expect(settleResult[1]).toHaveProperty('totals_win_bets', 3);
  });

  it('兩個人 1人一筆 1人二筆 ', () => {
    const data =
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
          totals_result_flag: 1
        },
        {
          uid: '2WMRgHyUwvTLyHpLoANk7gWADZn1',
          league_id: 3939,
          spread_bets: 2,
          totals_bets: 1,
          spread_result_flag: 1,
          totals_result_flag: -1
        }
      ];

    const settleResult = predictionsWinList(data);

    expect(settleResult[0]).toHaveProperty('uid', '3IB0w6G4V8QUM2Ti3iCIfX4Viux1');
    expect(settleResult[0]).toHaveProperty('win_rate', 0);
    expect(settleResult[0]).toHaveProperty('win_bets', -1);
    expect(settleResult[0]).toHaveProperty('matches_count', 1);
    expect(settleResult[0]).toHaveProperty('correct_counts', 0);
    expect(settleResult[0]).toHaveProperty('fault_counts', 1);
    expect(settleResult[0]).toHaveProperty('spread_correct_counts', 0);
    expect(settleResult[0]).toHaveProperty('totals_correct_counts', 0);
    expect(settleResult[0]).toHaveProperty('spread_fault_counts', 0);
    expect(settleResult[0]).toHaveProperty('totals_fault_counts', 1);
    expect(settleResult[0]).toHaveProperty('spread_win_rate', 0);
    expect(settleResult[0]).toHaveProperty('totals_win_rate', 0);
    expect(settleResult[0]).toHaveProperty('spread_correct_bets', 0);
    expect(settleResult[0]).toHaveProperty('totals_correct_bets', 0);
    expect(settleResult[0]).toHaveProperty('spread_fault_bets', 0);
    expect(settleResult[0]).toHaveProperty('totals_fault_bets', -1);
    expect(settleResult[0]).toHaveProperty('spread_win_bets', 0);
    expect(settleResult[0]).toHaveProperty('totals_win_bets', -1);

    expect(settleResult[1]).toHaveProperty('uid', '2WMRgHyUwvTLyHpLoANk7gWADZn1');
    expect(settleResult[1]).toHaveProperty('win_rate', 0.5);
    expect(settleResult[1]).toHaveProperty('win_bets', 1);
    expect(settleResult[1]).toHaveProperty('matches_count', 2);
    expect(settleResult[1]).toHaveProperty('correct_counts', 2);
    expect(settleResult[1]).toHaveProperty('fault_counts', 2);
    expect(settleResult[1]).toHaveProperty('spread_correct_counts', 1);
    expect(settleResult[1]).toHaveProperty('totals_correct_counts', 1);
    expect(settleResult[1]).toHaveProperty('spread_fault_counts', 1);
    expect(settleResult[1]).toHaveProperty('totals_fault_counts', 1);
    expect(settleResult[1]).toHaveProperty('spread_win_rate', 0.5);
    expect(settleResult[1]).toHaveProperty('totals_win_rate', 0.5);
    expect(settleResult[1]).toHaveProperty('spread_correct_bets', 2);
    expect(settleResult[1]).toHaveProperty('totals_correct_bets', 3);
    expect(settleResult[1]).toHaveProperty('spread_fault_bets', -3);
    expect(settleResult[1]).toHaveProperty('totals_fault_bets', -1);
    expect(settleResult[1]).toHaveProperty('spread_win_bets', -1);
    expect(settleResult[1]).toHaveProperty('totals_win_bets', 2);
  });

  it('兩個人 1人一筆 1人二筆 flag 有小數', () => {
    const data =
      [
        {
          uid: '3IB0w6G4V8QUM2Ti3iCIfX4Viux1',
          league_id: 3939,
          spread_bets: null,
          totals_bets: 1,
          spread_result_flag: -2,
          totals_result_flag: -0.5
        },
        {
          uid: '2WMRgHyUwvTLyHpLoANk7gWADZn1',
          league_id: 3939,
          spread_bets: 3,
          totals_bets: null,
          spread_result_flag: -1,
          totals_result_flag: 0.5
        },
        {
          uid: '2WMRgHyUwvTLyHpLoANk7gWADZn1',
          league_id: 3939,
          spread_bets: 2,
          totals_bets: 1,
          spread_result_flag: 1,
          totals_result_flag: -1
        }
      ];

    const settleResult = predictionsWinList(data);

    expect(settleResult[0]).toHaveProperty('uid', '3IB0w6G4V8QUM2Ti3iCIfX4Viux1');
    expect(settleResult[0]).toHaveProperty('win_rate', 0);
    expect(settleResult[0]).toHaveProperty('win_bets', -0.5);
    expect(settleResult[0]).toHaveProperty('matches_count', 1);
    expect(settleResult[0]).toHaveProperty('correct_counts', 0);
    expect(settleResult[0]).toHaveProperty('fault_counts', 1);
    expect(settleResult[0]).toHaveProperty('spread_correct_counts', 0);
    expect(settleResult[0]).toHaveProperty('totals_correct_counts', 0);
    expect(settleResult[0]).toHaveProperty('spread_fault_counts', 0);
    expect(settleResult[0]).toHaveProperty('totals_fault_counts', 1);
    expect(settleResult[0]).toHaveProperty('spread_win_rate', 0);
    expect(settleResult[0]).toHaveProperty('totals_win_rate', 0);
    expect(settleResult[0]).toHaveProperty('spread_correct_bets', 0);
    expect(settleResult[0]).toHaveProperty('totals_correct_bets', 0);
    expect(settleResult[0]).toHaveProperty('spread_fault_bets', 0);
    expect(settleResult[0]).toHaveProperty('totals_fault_bets', -0.5);
    expect(settleResult[0]).toHaveProperty('spread_win_bets', 0);
    expect(settleResult[0]).toHaveProperty('totals_win_bets', -0.5);

    expect(settleResult[1]).toHaveProperty('uid', '2WMRgHyUwvTLyHpLoANk7gWADZn1');
    expect(settleResult[1]).toHaveProperty('win_rate', 0.3333333333333333);
    expect(settleResult[1]).toHaveProperty('win_bets', -2);
    expect(settleResult[1]).toHaveProperty('matches_count', 2);
    expect(settleResult[1]).toHaveProperty('correct_counts', 1);
    expect(settleResult[1]).toHaveProperty('fault_counts', 2);
    expect(settleResult[1]).toHaveProperty('spread_correct_counts', 1);
    expect(settleResult[1]).toHaveProperty('totals_correct_counts', 0);
    expect(settleResult[1]).toHaveProperty('spread_fault_counts', 1);
    expect(settleResult[1]).toHaveProperty('totals_fault_counts', 1);
    expect(settleResult[1]).toHaveProperty('spread_win_rate', 0.5);
    expect(settleResult[1]).toHaveProperty('totals_win_rate', 0);
    expect(settleResult[1]).toHaveProperty('spread_correct_bets', 2);
    expect(settleResult[1]).toHaveProperty('totals_correct_bets', 0);
    expect(settleResult[1]).toHaveProperty('spread_fault_bets', -3);
    expect(settleResult[1]).toHaveProperty('totals_fault_bets', -1);
    expect(settleResult[1]).toHaveProperty('spread_win_bets', -1);
    expect(settleResult[1]).toHaveProperty('totals_win_bets', -1);
  });

  it('兩個人 1人一筆 1人二筆 result_flag 都是負的異常情況', () => {
    const data =
      [
        {
          uid: '3IB0w6G4V8QUM2Ti3iCIfX4Viux1',
          league_id: 3939,
          spread_bets: null,
          totals_bets: 1,
          spread_result_flag: -2,
          totals_result_flag: -2
        },
        {
          uid: '2WMRgHyUwvTLyHpLoANk7gWADZn1',
          league_id: 3939,
          spread_bets: 3,
          totals_bets: 3,
          spread_result_flag: -2,
          totals_result_flag: -2
        },
        {
          uid: '2WMRgHyUwvTLyHpLoANk7gWADZn1',
          league_id: 3939,
          spread_bets: 2,
          totals_bets: 1,
          spread_result_flag: -2,
          totals_result_flag: -2
        }
      ];

    const settleResult = predictionsWinList(data);

    expect(settleResult[0]).toHaveProperty('uid', '3IB0w6G4V8QUM2Ti3iCIfX4Viux1');
    expect(settleResult[0]).toHaveProperty('win_rate', 0);
    expect(settleResult[0]).toHaveProperty('win_bets', 0);
    expect(settleResult[0]).toHaveProperty('matches_count', 1);
    expect(settleResult[0]).toHaveProperty('correct_counts', 0);
    expect(settleResult[0]).toHaveProperty('fault_counts', 0);
    expect(settleResult[0]).toHaveProperty('spread_correct_counts', 0);
    expect(settleResult[0]).toHaveProperty('totals_correct_counts', 0);
    expect(settleResult[0]).toHaveProperty('spread_fault_counts', 0);
    expect(settleResult[0]).toHaveProperty('totals_fault_counts', 0);
    expect(settleResult[0]).toHaveProperty('spread_win_rate', 0);
    expect(settleResult[0]).toHaveProperty('totals_win_rate', 0);
    expect(settleResult[0]).toHaveProperty('spread_correct_bets', 0);
    expect(settleResult[0]).toHaveProperty('totals_correct_bets', 0);
    expect(settleResult[0]).toHaveProperty('spread_fault_bets', 0);
    expect(settleResult[0]).toHaveProperty('totals_fault_bets', 0);
    expect(settleResult[0]).toHaveProperty('spread_win_bets', 0);
    expect(settleResult[0]).toHaveProperty('totals_win_bets', 0);

    expect(settleResult[1]).toHaveProperty('uid', '2WMRgHyUwvTLyHpLoANk7gWADZn1');
    expect(settleResult[1]).toHaveProperty('win_rate', 0);
    expect(settleResult[1]).toHaveProperty('win_bets', 0);
    expect(settleResult[1]).toHaveProperty('matches_count', 2);
    expect(settleResult[1]).toHaveProperty('correct_counts', 0);
    expect(settleResult[1]).toHaveProperty('fault_counts', 0);
    expect(settleResult[1]).toHaveProperty('spread_correct_counts', 0);
    expect(settleResult[1]).toHaveProperty('totals_correct_counts', 0);
    expect(settleResult[1]).toHaveProperty('spread_fault_counts', 0);
    expect(settleResult[1]).toHaveProperty('totals_fault_counts', 0);
    expect(settleResult[1]).toHaveProperty('spread_win_rate', 0);
    expect(settleResult[1]).toHaveProperty('totals_win_rate', 0);
    expect(settleResult[1]).toHaveProperty('spread_correct_bets', 0);
    expect(settleResult[1]).toHaveProperty('totals_correct_bets', 0);
    expect(settleResult[1]).toHaveProperty('spread_fault_bets', 0);
    expect(settleResult[1]).toHaveProperty('totals_fault_bets', 0);
    expect(settleResult[1]).toHaveProperty('spread_win_bets', 0);
    expect(settleResult[1]).toHaveProperty('totals_win_bets', 0);
  });
});
