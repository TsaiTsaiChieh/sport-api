const settle = require('../model/user/settleMatchesModel');

// ======================================================
// ======================================================
// ======================================================
describe('測試 讓分 球頭(handicap) 為 小數盤口', () => {
  it('讓分 球頭 7.5 主隊 10分  客隊 10分 ', () => {
    const data = {
      spreadHandicap: 7.5,
      homePoints: 10,
      awayPoints: 10
    };

    const settleResult = settle.settleSpread(data);
    expect(settleResult).toBe('away');

    expect(settle.resultFlag('home', settleResult)).toBe(-1);
    expect(settle.resultFlag('away', settleResult)).toBe(0.95);
  });

  it('讓分 球頭 7.5 主隊 10分  客隊 1分 ', () => {
    const data = {
      spreadHandicap: 7.5,
      homePoints: 10,
      awayPoints: 1
    };

    const settleResult = settle.settleSpread(data);
    expect(settleResult).toBe('home');

    expect(settle.resultFlag('home', settleResult)).toBe(0.95);
    expect(settle.resultFlag('away', settleResult)).toBe(-1);
  });
});

// ======================================================
describe('測試 讓分 球頭(handicap) 為 整數盤口 賠率相同', () => {
  it('讓分 球頭 7 主隊 10分  客隊 10分 ', () => {
    const data = {
      spreadHandicap: 7,
      homePoints: 10,
      awayPoints: 10
    };

    const settleResult = settle.settleSpread(data);
    expect(settleResult).toBe('away');

    expect(settle.resultFlag('home', settleResult)).toBe(-1);
    expect(settle.resultFlag('away', settleResult)).toBe(0.95);
  });

  it('讓分 球頭 7 主隊 10分  客隊 1分 ', () => {
    const data = {
      spreadHandicap: 7,
      homePoints: 10,
      awayPoints: 1
    };

    const settleResult = settle.settleSpread(data);
    expect(settleResult).toBe('home');

    expect(settle.resultFlag('home', settleResult)).toBe(0.95);
    expect(settle.resultFlag('away', settleResult)).toBe(-1);
  });

  it('讓分 球頭 7 主隊 10分  客隊 3分 ', () => {
    const data = {
      spreadHandicap: 7,
      homePoints: 10,
      awayPoints: 3
    };

    const settleResult = settle.settleSpread(data);
    expect(settleResult).toBe('fair2');

    expect(settle.resultFlag('home', settleResult)).toBe(0);
    expect(settle.resultFlag('away', settleResult)).toBe(0);
  });
});

// ======================================================
describe('測試 讓分 球頭(handicap) 為 整數盤口 賠率有分大小', () => {
  it('讓分 球頭 7 主隊 10分  客隊 10分 ', () => {
    const data = {
      spreadHandicap: 7,
      homePoints: 10,
      awayPoints: 10
    };

    const settleResult = settle.settleSpread(data);
    expect(settleResult).toBe('away');

    expect(settle.resultFlag('home', settleResult)).toBe(-1);
    expect(settle.resultFlag('away', settleResult)).toBe(0.95);
  });

  it('讓分 球頭 7 主隊 10分  客隊 1分 ', () => {
    const data = {
      spreadHandicap: 7,
      homePoints: 10,
      awayPoints: 1
    };

    const settleResult = settle.settleSpread(data);
    expect(settleResult).toBe('home');

    expect(settle.resultFlag('home', settleResult)).toBe(0.95);
    expect(settle.resultFlag('away', settleResult)).toBe(-1);
  });

  it('讓分 球頭 7 主隊 10分  客隊 3分 主隊賠率 1.93  客隊賠率 2.03', () => {
    const data = {
      spreadHandicap: 7,
      homePoints: 10,
      awayPoints: 3,
      spreadHomeOdd: 1.93,
      spreadAwayOdd: 2.03
    };

    const settleResult = settle.settleSpread(data);
    expect(settleResult).toBe('fair|away');

    expect(settle.resultFlag('home', settleResult)).toBe(-0.5);
    expect(settle.resultFlag('away', settleResult)).toBe(0.5);
  });

  it('讓分 球頭 7 主隊 10分  客隊 3分 主隊賠率 2.03  客隊賠率 1.93', () => {
    const data = {
      spreadHandicap: 7,
      homePoints: 10,
      awayPoints: 3,
      spreadHomeOdd: 2.03,
      spreadAwayOdd: 1.93
    };

    const settleResult = settle.settleSpread(data);
    expect(settleResult).toBe('fair|home');

    expect(settle.resultFlag('home', settleResult)).toBe(0.5);
    expect(settle.resultFlag('away', settleResult)).toBe(-0.5);
  });
});

// ======================================================
// ======================================================
// ======================================================
describe('測試 大小 球頭(handicap) 為 小數盤口', () => {
  it('大小 球頭 20.5 主隊 11分  客隊 10分 ', () => {
    const data = {
      totalsHandicap: 20.5,
      homePoints: 11,
      awayPoints: 10
    };

    const settleResult = settle.settleTotals(data);
    expect(settleResult).toBe('over');

    expect(settle.resultFlag('over', settleResult)).toBe(0.95);
    expect(settle.resultFlag('under', settleResult)).toBe(-1);
  });

  it('大小 球頭 20.5 主隊 10分  客隊 10分 ', () => {
    const data = {
      totalsHandicap: 20.5,
      homePoints: 10,
      awayPoints: 10
    };

    const settleResult = settle.settleTotals(data);
    expect(settleResult).toBe('under');

    expect(settle.resultFlag('over', settleResult)).toBe(-1);
    expect(settle.resultFlag('under', settleResult)).toBe(0.95);
  });
});

// ======================================================
describe('測試 大小 球頭(handicap) 為 整數盤口 賠率相同', () => {
  it('大小 球頭 20 主隊 11分  客隊 10分 ', () => {
    const data = {
      totalsHandicap: 20,
      homePoints: 11,
      awayPoints: 10
    };

    const settleResult = settle.settleTotals(data);
    expect(settleResult).toBe('over');

    expect(settle.resultFlag('over', settleResult)).toBe(0.95);
    expect(settle.resultFlag('under', settleResult)).toBe(-1);
  });

  it('大小 球頭 20 主隊 10分  客隊 1分 ', () => {
    const data = {
      totalsHandicap: 20,
      homePoints: 10,
      awayPoints: 1
    };

    const settleResult = settle.settleTotals(data);
    expect(settleResult).toBe('under');

    expect(settle.resultFlag('over', settleResult)).toBe(-1);
    expect(settle.resultFlag('under', settleResult)).toBe(0.95);
  });

  it('大小 球頭 20 主隊 10分  客隊 10分 ', () => {
    const data = {
      totalsHandicap: 20,
      homePoints: 10,
      awayPoints: 10
    };

    const settleResult = settle.settleTotals(data);
    expect(settleResult).toBe('fair2');

    expect(settle.resultFlag('over', settleResult)).toBe(0);
    expect(settle.resultFlag('under', settleResult)).toBe(0);
  });
});

// ======================================================
describe('測試 大小 球頭(handicap) 為 整數盤口 賠率有分大小', () => {
  it('大小 球頭 20 主隊 11分  客隊 10分 ', () => {
    const data = {
      totalsHandicap: 20,
      homePoints: 11,
      awayPoints: 10
    };

    const settleResult = settle.settleTotals(data);
    expect(settleResult).toBe('over');

    expect(settle.resultFlag('over', settleResult)).toBe(0.95);
    expect(settle.resultFlag('under', settleResult)).toBe(-1);
  });

  it('大小 球頭 20 主隊 10分  客隊 1分 ', () => {
    const data = {
      totalsHandicap: 20,
      homePoints: 10,
      awayPoints: 1
    };

    const settleResult = settle.settleTotals(data);
    expect(settleResult).toBe('under');

    expect(settle.resultFlag('over', settleResult)).toBe(-1);
    expect(settle.resultFlag('under', settleResult)).toBe(0.95);
  });

  it('大小 球頭 20 主隊 10分  客隊 10分  主隊賠率 1.93  客隊賠率 2.03', () => {
    const data = {
      totalsHandicap: 20,
      homePoints: 10,
      awayPoints: 10,
      totalsOverOdd: 1.93,
      totalsUnderOdd: 2.03
    };

    const settleResult = settle.settleTotals(data);
    expect(settleResult).toBe('fair|under');

    expect(settle.resultFlag('over', settleResult)).toBe(-0.5);
    expect(settle.resultFlag('under', settleResult)).toBe(0.5);
  });

  it('大小 球頭 20 主隊 10分  客隊 10分  主隊賠率 2.03  客隊賠率 1.93', () => {
    const data = {
      totalsHandicap: 20,
      homePoints: 10,
      awayPoints: 10,
      totalsOverOdd: 2.03,
      totalsUnderOdd: 1.93
    };

    const settleResult = settle.settleTotals(data);
    expect(settleResult).toBe('fair|over');

    expect(settle.resultFlag('over', settleResult)).toBe(0.5);
    expect(settle.resultFlag('under', settleResult)).toBe(-0.5);
  });
});
