const { settleSpread, settleSpreadSoccer, settleTotals, settleTotalsSoccer,
  perdictionsResultFlag } = require('../util/modules');

const resultFlag = perdictionsResultFlag;

// ======================================================
// ======================================================
// ======================================================
//
// 冰球/棒球/籃球
//
describe('測試 球/棒球/籃球', () => {
  describe('測試 讓分 球頭(handicap) 為 小數盤口', () => {
    it('讓分 球頭 7.5 主隊 10分  客隊 10分 ', () => {
      const data = {
        spreadHandicap: 7.5,
        homePoints: 10,
        awayPoints: 10
      };

      const settleResult = settleSpread(data);
      expect(settleResult).toBe('away');

      expect(resultFlag('home', settleResult)).toBe(-1);
      expect(resultFlag('away', settleResult)).toBe(0.95);
    });

    it('讓分 球頭 7.5 主隊 10分  客隊 1分 ', () => {
      const data = {
        spreadHandicap: 7.5,
        homePoints: 10,
        awayPoints: 1
      };

      const settleResult = settleSpread(data);
      expect(settleResult).toBe('home');

      expect(resultFlag('home', settleResult)).toBe(0.95);
      expect(resultFlag('away', settleResult)).toBe(-1);
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

      const settleResult = settleSpread(data);
      expect(settleResult).toBe('away');

      expect(resultFlag('home', settleResult)).toBe(-1);
      expect(resultFlag('away', settleResult)).toBe(0.95);
    });

    it('讓分 球頭 7 主隊 10分  客隊 1分 ', () => {
      const data = {
        spreadHandicap: 7,
        homePoints: 10,
        awayPoints: 1
      };

      const settleResult = settleSpread(data);
      expect(settleResult).toBe('home');

      expect(resultFlag('home', settleResult)).toBe(0.95);
      expect(resultFlag('away', settleResult)).toBe(-1);
    });

    it('讓分 球頭 7 主隊 10分  客隊 3分 ', () => {
      const data = {
        spreadHandicap: 7,
        homePoints: 10,
        awayPoints: 3
      };

      const settleResult = settleSpread(data);
      expect(settleResult).toBe('fair2');

      expect(resultFlag('home', settleResult)).toBe(0);
      expect(resultFlag('away', settleResult)).toBe(0);
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

      const settleResult = settleSpread(data);
      expect(settleResult).toBe('away');

      expect(resultFlag('home', settleResult)).toBe(-1);
      expect(resultFlag('away', settleResult)).toBe(0.95);
    });

    it('讓分 球頭 7 主隊 10分  客隊 1分 ', () => {
      const data = {
        spreadHandicap: 7,
        homePoints: 10,
        awayPoints: 1
      };

      const settleResult = settleSpread(data);
      expect(settleResult).toBe('home');

      expect(resultFlag('home', settleResult)).toBe(0.95);
      expect(resultFlag('away', settleResult)).toBe(-1);
    });

    it('讓分 球頭 7 主隊 10分  客隊 3分 主隊賠率 1.93  客隊賠率 2.03', () => {
      const data = {
        spreadHandicap: 7,
        homePoints: 10,
        awayPoints: 3,
        spreadHomeOdd: 1.93,
        spreadAwayOdd: 2.03
      };

      const settleResult = settleSpread(data);
      expect(settleResult).toBe('fair|away');

      expect(resultFlag('home', settleResult)).toBe(-0.5);
      expect(resultFlag('away', settleResult)).toBe(0.5);
    });

    it('讓分 球頭 7 主隊 10分  客隊 3分 主隊賠率 2.03  客隊賠率 1.93', () => {
      const data = {
        spreadHandicap: 7,
        homePoints: 10,
        awayPoints: 3,
        spreadHomeOdd: 2.03,
        spreadAwayOdd: 1.93
      };

      const settleResult = settleSpread(data);
      expect(settleResult).toBe('fair|home');

      expect(resultFlag('home', settleResult)).toBe(0.5);
      expect(resultFlag('away', settleResult)).toBe(-0.5);
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

      const settleResult = settleTotals(data);
      expect(settleResult).toBe('over');

      expect(resultFlag('over', settleResult)).toBe(0.95);
      expect(resultFlag('under', settleResult)).toBe(-1);
    });

    it('大小 球頭 20.5 主隊 10分  客隊 10分 ', () => {
      const data = {
        totalsHandicap: 20.5,
        homePoints: 10,
        awayPoints: 10
      };

      const settleResult = settleTotals(data);
      expect(settleResult).toBe('under');

      expect(resultFlag('over', settleResult)).toBe(-1);
      expect(resultFlag('under', settleResult)).toBe(0.95);
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

      const settleResult = settleTotals(data);
      expect(settleResult).toBe('over');

      expect(resultFlag('over', settleResult)).toBe(0.95);
      expect(resultFlag('under', settleResult)).toBe(-1);
    });

    it('大小 球頭 20 主隊 10分  客隊 1分 ', () => {
      const data = {
        totalsHandicap: 20,
        homePoints: 10,
        awayPoints: 1
      };

      const settleResult = settleTotals(data);
      expect(settleResult).toBe('under');

      expect(resultFlag('over', settleResult)).toBe(-1);
      expect(resultFlag('under', settleResult)).toBe(0.95);
    });

    it('大小 球頭 20 主隊 10分  客隊 10分 ', () => {
      const data = {
        totalsHandicap: 20,
        homePoints: 10,
        awayPoints: 10
      };

      const settleResult = settleTotals(data);
      expect(settleResult).toBe('fair2');

      expect(resultFlag('over', settleResult)).toBe(0);
      expect(resultFlag('under', settleResult)).toBe(0);
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

      const settleResult = settleTotals(data);
      expect(settleResult).toBe('over');

      expect(resultFlag('over', settleResult)).toBe(0.95);
      expect(resultFlag('under', settleResult)).toBe(-1);
    });

    it('大小 球頭 20 主隊 10分  客隊 1分 ', () => {
      const data = {
        totalsHandicap: 20,
        homePoints: 10,
        awayPoints: 1
      };

      const settleResult = settleTotals(data);
      expect(settleResult).toBe('under');

      expect(resultFlag('over', settleResult)).toBe(-1);
      expect(resultFlag('under', settleResult)).toBe(0.95);
    });

    it('大小 球頭 20 主隊 10分  客隊 10分  主隊賠率 1.93  客隊賠率 2.03', () => {
      const data = {
        totalsHandicap: 20,
        homePoints: 10,
        awayPoints: 10,
        totalsOverOdd: 1.93,
        totalsUnderOdd: 2.03
      };

      const settleResult = settleTotals(data);
      expect(settleResult).toBe('fair|under');

      expect(resultFlag('over', settleResult)).toBe(-0.5);
      expect(resultFlag('under', settleResult)).toBe(0.5);
    });

    it('大小 球頭 20 主隊 10分  客隊 10分  主隊賠率 2.03  客隊賠率 1.93', () => {
      const data = {
        totalsHandicap: 20,
        homePoints: 10,
        awayPoints: 10,
        totalsOverOdd: 2.03,
        totalsUnderOdd: 1.93
      };

      const settleResult = settleTotals(data);
      expect(settleResult).toBe('fair|over');

      expect(resultFlag('over', settleResult)).toBe(0.5);
      expect(resultFlag('under', settleResult)).toBe(-0.5);
    });
  });
});

// ======================================================
// ======================================================
// ======================================================
//
// 足球/電子足球
//
describe('足球/電子足球', () => {
  describe('測試 讓分 球頭(handicap) 為 整數盤口', () => {
    it('讓分 球頭 7 主隊 10分  客隊 3分 ', () => {
      const data = {
        spreadHandicap: 7,
        homePoints: 10,
        awayPoints: 3
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('fair2');

      expect(resultFlag('home', settleResult)).toBe(0);
      expect(resultFlag('away', settleResult)).toBe(0);
    });

    it('讓分 球頭 -7 主隊 3分  客隊 10分 ', () => {
      const data = {
        spreadHandicap: -7,
        homePoints: 3,
        awayPoints: 10
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('fair2');

      expect(resultFlag('home', settleResult)).toBe(0);
      expect(resultFlag('away', settleResult)).toBe(0);
    });

    it('讓分 球頭 7 主隊 10分  客隊 1分 ', () => {
      const data = {
        spreadHandicap: 7,
        homePoints: 10,
        awayPoints: 1
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('home');

      expect(resultFlag('home', settleResult)).toBe(0.95);
      expect(resultFlag('away', settleResult)).toBe(-1);
    });

    it('讓分 球頭 7 主隊 1分  客隊 10分 ', () => {
      const data = {
        spreadHandicap: 7,
        homePoints: 1,
        awayPoints: 10
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('away');

      expect(resultFlag('home', settleResult)).toBe(-1);
      expect(resultFlag('away', settleResult)).toBe(0.95);
    });
  });

  // ======================================================
  describe('測試 讓分 球頭(handicap) 為 小數 .5 盤口', () => {
    it('讓分 球頭 7.5 主隊 10分  客隊 3分 ', () => {
      const data = {
        spreadHandicap: 7.5,
        homePoints: 10,
        awayPoints: 3
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('away');

      expect(resultFlag('home', settleResult)).toBe(-1);
      expect(resultFlag('away', settleResult)).toBe(0.95);
    });

    it('讓分 球頭 7.5 主隊 3分  客隊 10分 ', () => {
      const data = {
        spreadHandicap: 7.5,
        homePoints: 3,
        awayPoints: 10
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('away');

      expect(resultFlag('home', settleResult)).toBe(-1);
      expect(resultFlag('away', settleResult)).toBe(0.95);
    });
  });

  // ======================================================
  describe('測試 讓分 球頭(handicap) 為 小數 .25 .75 盤口', () => {
    // .25
    it('讓分 球頭 7.25 主隊 10分  客隊 1分 ', () => {
      const data = {
        spreadHandicap: 7.25,
        homePoints: 10,
        awayPoints: 1
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('fair|home');

      expect(resultFlag('home', settleResult)).toBe(0.5);
      expect(resultFlag('away', settleResult)).toBe(-0.5);
    });

    it('讓分 球頭 7.25 主隊 1分  客隊 10分 ', () => {
      const data = {
        spreadHandicap: 7.25,
        homePoints: 1,
        awayPoints: 10
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('fair|away');

      expect(resultFlag('home', settleResult)).toBe(-0.5);
      expect(resultFlag('away', settleResult)).toBe(0.5);
    });

    // - .25
    it('讓分 球頭 -7.25 主隊 10分  客隊 1分 ', () => {
      const data = {
        spreadHandicap: -7.25,
        homePoints: 10,
        awayPoints: 1
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('fair|home');

      expect(resultFlag('home', settleResult)).toBe(0.5);
      expect(resultFlag('away', settleResult)).toBe(-0.5);
    });

    it('讓分 球頭 -7.25 主隊 1分  客隊 10分 ', () => {
      const data = {
        spreadHandicap: -7.25,
        homePoints: 1,
        awayPoints: 10
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('fair|away');

      expect(resultFlag('home', settleResult)).toBe(-0.5);
      expect(resultFlag('away', settleResult)).toBe(0.5);
    });

    // .75
    it('讓分 球頭 7.75 主隊 10分  客隊 1分 ', () => {
      const data = {
        spreadHandicap: 7.75,
        homePoints: 10,
        awayPoints: 1
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('fair|home');

      expect(resultFlag('home', settleResult)).toBe(0.5);
      expect(resultFlag('away', settleResult)).toBe(-0.5);
    });

    it('讓分 球頭 7.75 主隊 1分  客隊 10分 ', () => {
      const data = {
        spreadHandicap: 7.75,
        homePoints: 1,
        awayPoints: 10
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('fair|away');

      expect(resultFlag('home', settleResult)).toBe(-0.5);
      expect(resultFlag('away', settleResult)).toBe(0.5);
    });

    // - .75
    it('讓分 球頭 -7.75 主隊 10分  客隊 1分 ', () => {
      const data = {
        spreadHandicap: -7.75,
        homePoints: 10,
        awayPoints: 1
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('fair|home');

      expect(resultFlag('home', settleResult)).toBe(0.5);
      expect(resultFlag('away', settleResult)).toBe(-0.5);
    });

    it('讓分 球頭 -7.75 主隊 1分  客隊 10分 ', () => {
      const data = {
        spreadHandicap: -7.75,
        homePoints: 1,
        awayPoints: 10
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('fair|away');

      expect(resultFlag('home', settleResult)).toBe(-0.5);
      expect(resultFlag('away', settleResult)).toBe(0.5);
    });
  });

  // ======================================================
  // ======================================================
  // ======================================================
  describe('測試 大小 球頭(handicap) 為 整數盤口', () => {
    it('大小 球頭 20 主隊 10分  客隊 10分 ', () => {
      const data = {
        totalsHandicap: 20,
        homePoints: 10,
        awayPoints: 10
      };

      const settleResult = settleTotalsSoccer(data);
      expect(settleResult).toBe('fair2');

      expect(resultFlag('over', settleResult)).toBe(0);
      expect(resultFlag('under', settleResult)).toBe(0);
    });

    it('大小 球頭 20 主隊 10分  客隊 1分 ', () => {
      const data = {
        totalsHandicap: 20,
        homePoints: 10,
        awayPoints: 1
      };

      const settleResult = settleTotalsSoccer(data);
      expect(settleResult).toBe('under');

      expect(resultFlag('over', settleResult)).toBe(-1);
      expect(resultFlag('under', settleResult)).toBe(0.95);
    });

    it('大小 球頭 20 主隊 11分  客隊 10分 ', () => {
      const data = {
        totalsHandicap: 20,
        homePoints: 11,
        awayPoints: 10
      };

      const settleResult = settleTotalsSoccer(data);
      expect(settleResult).toBe('over');

      expect(resultFlag('over', settleResult)).toBe(0.95);
      expect(resultFlag('under', settleResult)).toBe(-1);
    });
  });

  // ======================================================
  describe('測試 大小 球頭(handicap) 為 小數 .5 盤口', () => {
    it('大小 球頭 20.5 主隊 10分  客隊 10分 ', () => {
      const data = {
        totalsHandicap: 20.5,
        homePoints: 10,
        awayPoints: 10
      };

      const settleResult = settleTotalsSoccer(data);
      expect(settleResult).toBe('under');

      expect(resultFlag('over', settleResult)).toBe(-1);
      expect(resultFlag('under', settleResult)).toBe(0.95);
    });

    it('大小 球頭 20.5 主隊 13分  客隊 10分 ', () => {
      const data = {
        totalsHandicap: 20.5,
        homePoints: 13,
        awayPoints: 10
      };

      const settleResult = settleTotalsSoccer(data);
      expect(settleResult).toBe('over');

      expect(resultFlag('over', settleResult)).toBe(0.95);
      expect(resultFlag('under', settleResult)).toBe(-1);
    });
  });

  // ======================================================
  describe('測試 大小 球頭(handicap) 為 小數 .25 .75 盤口', () => {
    // .25
    it('大小 球頭 20.25 主隊 10分  客隊 10分 ', () => {
      const data = {
        totalsHandicap: 20.25,
        homePoints: 10,
        awayPoints: 10
      };

      const settleResult = settleTotalsSoccer(data);
      expect(settleResult).toBe('fair|under');

      expect(resultFlag('over', settleResult)).toBe(-0.5);
      expect(resultFlag('under', settleResult)).toBe(0.5);
    });

    it('大小 球頭 20.25 主隊 11分  客隊 10分 ', () => {
      const data = {
        totalsHandicap: 20.25,
        homePoints: 11,
        awayPoints: 10
      };

      const settleResult = settleTotalsSoccer(data);
      expect(settleResult).toBe('fair|over');

      expect(resultFlag('over', settleResult)).toBe(0.5);
      expect(resultFlag('under', settleResult)).toBe(-0.5);
    });


    // .75
    it('大小 球頭 20.75 主隊 10分  客隊 10分 ', () => {
      const data = {
        totalsHandicap: 20.75,
        homePoints: 10,
        awayPoints: 10
      };

      const settleResult = settleTotalsSoccer(data);
      expect(settleResult).toBe('fair|under');

      expect(resultFlag('over', settleResult)).toBe(-0.5);
      expect(resultFlag('under', settleResult)).toBe(0.5);
    });

    it('大小 球頭 20.75 主隊 11分  客隊 10分 ', () => {
      const data = {
        totalsHandicap: 20.75,
        homePoints: 11,
        awayPoints: 10
      };

      const settleResult = settleTotalsSoccer(data);
      expect(settleResult).toBe('fair|over');

      expect(resultFlag('over', settleResult)).toBe(0.5);
      expect(resultFlag('under', settleResult)).toBe(-0.5);
    });

  });


});
