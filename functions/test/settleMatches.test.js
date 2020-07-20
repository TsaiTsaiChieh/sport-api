const { settleSpread, settleSpreadSoccer, settleTotals, settleTotalsSoccer,
  predictionsResultFlag } = require('../util/settleModules');

const resultFlag = predictionsResultFlag;

// ======================================================
// ======================================================
// ======================================================
//
// 冰球/籃球
//
describe('測試 冰球/籃球', () => {
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
      expect(resultFlag('away', settleResult)).toBe(1); // 0.95
    });

    it('讓分 球頭 7.5 主隊 10分  客隊 1分 ', () => {
      const data = {
        spreadHandicap: 7.5,
        homePoints: 10,
        awayPoints: 1
      };

      const settleResult = settleSpread(data);
      expect(settleResult).toBe('home');

      expect(resultFlag('home', settleResult)).toBe(1); // 0.95
      expect(resultFlag('away', settleResult)).toBe(-1);
    });
  });

  // ======================================================
  describe('測試 讓分 球頭(handicap) 為 整數盤口 和 平局(中分洞)', () => {
    it('讓分 球頭 7 主隊 10分  客隊 10分 ', () => {
      const data = {
        spreadHandicap: 7,
        homePoints: 10,
        awayPoints: 10
      };

      const settleResult = settleSpread(data);
      expect(settleResult).toBe('away');

      expect(resultFlag('home', settleResult)).toBe(-1);
      expect(resultFlag('away', settleResult)).toBe(1); // 0.95
    });

    it('讓分 球頭 7 主隊 10分  客隊 1分 ', () => {
      const data = {
        spreadHandicap: 7,
        homePoints: 10,
        awayPoints: 1
      };

      const settleResult = settleSpread(data);
      expect(settleResult).toBe('home');

      expect(resultFlag('home', settleResult)).toBe(1); // 0.95
      expect(resultFlag('away', settleResult)).toBe(-1);
    });

    it('讓分 球頭 7 Rate 0  主隊 10分  客隊 3分 ', () => {
      const data = {
        spreadHandicap: 7,
        spreadRate: 0,
        homePoints: 10,
        awayPoints: 3
      };

      const settleResult = settleSpread(data);
      expect(settleResult).toBe('fair2');

      expect(resultFlag('home', settleResult)).toBe(0);
      expect(resultFlag('away', settleResult)).toBe(0);
    });

    it('讓分 球頭 7 Rate 10  主隊 10分  客隊 3分 ', () => {
      const data = {
        spreadHandicap: 7,
        spreadRate: 10,
        homePoints: 10,
        awayPoints: 3
      };

      const settleResult = settleSpread(data);
      expect(settleResult).toBe('fair|home');

      expect(resultFlag('home', settleResult, data.spreadRate)).toBe(0.1);
      expect(resultFlag('away', settleResult, data.spreadRate)).toBe(-0.1);
    });

    it('讓分 球頭 7 Rate -10  主隊 10分  客隊 3分 ', () => {
      const data = {
        spreadHandicap: 7,
        spreadRate: -10,
        homePoints: 10,
        awayPoints: 3
      };

      const settleResult = settleSpread(data);
      expect(settleResult).toBe('fair|away');

      expect(resultFlag('home', settleResult, data.spreadRate)).toBe(-0.1);
      expect(resultFlag('away', settleResult, data.spreadRate)).toBe(0.1);
    });

    it('讓分 球頭 -7 Rate 10  主隊 3分  客隊 10分 ', () => {
      const data = {
        spreadHandicap: -7,
        spreadRate: 10,
        homePoints: 3,
        awayPoints: 10
      };

      const settleResult = settleSpread(data);
      expect(settleResult).toBe('fair|away');

      expect(resultFlag('home', settleResult, data.spreadRate)).toBe(-0.1);
      expect(resultFlag('away', settleResult, data.spreadRate)).toBe(0.1);
    });

    it('讓分 球頭 -7 Rate -10  主隊 3分  客隊 10分 ', () => {
      const data = {
        spreadHandicap: -7,
        spreadRate: -10,
        homePoints: 3,
        awayPoints: 10
      };

      const settleResult = settleSpread(data);
      expect(settleResult).toBe('fair|home');

      expect(resultFlag('home', settleResult, data.spreadRate)).toBe(0.1);
      expect(resultFlag('away', settleResult, data.spreadRate)).toBe(-0.1);
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

      expect(resultFlag('over', settleResult)).toBe(1); // 0.95
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
      expect(resultFlag('under', settleResult)).toBe(1); // 0.95
    });
  });

  // ======================================================
  describe('測試 大小 球頭(handicap) 為 整數盤口 和 平局(中分洞)', () => {
    it('大小 球頭 20 主隊 11分  客隊 10分 ', () => {
      const data = {
        totalsHandicap: 20,
        homePoints: 11,
        awayPoints: 10
      };

      const settleResult = settleTotals(data);
      expect(settleResult).toBe('over');

      expect(resultFlag('over', settleResult)).toBe(1); // 0.95
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
      expect(resultFlag('under', settleResult)).toBe(1); // 0.95
    });

    it('大小 球頭 20 Rate 0  主隊 10分  客隊 10分 ', () => {
      const data = {
        totalsHandicap: 20,
        totalsRate: 0,
        homePoints: 10,
        awayPoints: 10
      };

      const settleResult = settleTotals(data);
      expect(settleResult).toBe('fair2');

      expect(resultFlag('over', settleResult)).toBe(0);
      expect(resultFlag('under', settleResult)).toBe(0);
    });

    it('大小 球頭 20 Rate 10  主隊 10分  客隊 10分 ', () => {
      const data = {
        totalsHandicap: 20,
        totalsRate: 10,
        homePoints: 10,
        awayPoints: 10
      };

      const settleResult = settleTotals(data);
      expect(settleResult).toBe('fair|over');

      expect(resultFlag('over', settleResult, data.totalsRate)).toBe(0.1);
      expect(resultFlag('under', settleResult, data.totalsRate)).toBe(-0.1);
    });

    it('大小 球頭 20 Rate -10  主隊 10分  客隊 10分 ', () => {
      const data = {
        totalsHandicap: 20,
        totalsRate: -10,
        homePoints: 10,
        awayPoints: 10
      };

      const settleResult = settleTotals(data);
      expect(settleResult).toBe('fair|under');

      expect(resultFlag('over', settleResult, data.totalsRate)).toBe(-0.1);
      expect(resultFlag('under', settleResult, data.totalsRate)).toBe(0.1);
    });
  });

});

// ======================================================
// ======================================================
// ======================================================
//
// 足球/電子足球
//
describe('測試 足球/電子足球', () => {
  describe('測試 讓分 球頭(handicap) 為 0 整數盤口', () => {
    it('讓分 球頭 0 主隊 0分  客隊 0分 ', () => {
      const data = {
        spreadHandicap: 0,
        homePoints: 0,
        awayPoints: 0
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('fair2');

      expect(resultFlag('home', settleResult)).toBe(0);
      expect(resultFlag('away', settleResult)).toBe(0);
    });

    it('讓分 球頭 0 主隊 1分  客隊 0分 ', () => {
      const data = {
        spreadHandicap: 0,
        homePoints: 1,
        awayPoints: 0
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('home');

      expect(resultFlag('home', settleResult)).toBe(1); // 0.95
      expect(resultFlag('away', settleResult)).toBe(-1);
    });

    it('讓分 球頭 0 主隊 0分  客隊 1分 ', () => {
      const data = {
        spreadHandicap: 0,
        homePoints: 0,
        awayPoints: 1
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('away');

      expect(resultFlag('home', settleResult)).toBe(-1);
      expect(resultFlag('away', settleResult)).toBe(1); // 0.95
    });
  });

  // ======================================================
  describe('測試 讓分 球頭(handicap) 為 小數 .25 盤口 ( =>< -.25 )', () => {
    // .25
    it('讓分 球頭 0.25 主隊 0分  客隊 0分', () => {
      const data = {
        spreadHandicap: 0.25,
        homePoints: 0,
        awayPoints: 0
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('fair|away');

      expect(resultFlag('home', settleResult)).toBe(-0.5);
      expect(resultFlag('away', settleResult)).toBe(0.5);
    });

    it('讓分 球頭 0.25 主隊 1分  客隊 0分', () => {
      const data = {
        spreadHandicap: 0.25,
        homePoints: 1,
        awayPoints: 0
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('home');

      expect(resultFlag('home', settleResult)).toBe(1); // 0.95
      expect(resultFlag('away', settleResult)).toBe(-1);
    });

    it('讓分 球頭 0.25 主隊 0分  客隊 1分', () => {
      const data = {
        spreadHandicap: 0.25,
        homePoints: 0,
        awayPoints: 1
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('away');

      expect(resultFlag('home', settleResult)).toBe(-1);
      expect(resultFlag('away', settleResult)).toBe(1); // 0.95
    });

    it('讓分 球頭 0.25 主隊 1分  客隊 1分', () => {
      const data = {
        spreadHandicap: 0.25,
        homePoints: 1,
        awayPoints: 1
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('fair|away');

      expect(resultFlag('home', settleResult)).toBe(-0.5);
      expect(resultFlag('away', settleResult)).toBe(0.5);
    });

    it('讓分 球頭 0.25 主隊 2分  客隊 0分', () => {
      const data = {
        spreadHandicap: 0.25,
        homePoints: 2,
        awayPoints: 0
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('home');

      expect(resultFlag('home', settleResult)).toBe(1); // 0.95
      expect(resultFlag('away', settleResult)).toBe(-1);
    });

    it('讓分 球頭 0.25 主隊 0分  客隊 2分', () => {
      const data = {
        spreadHandicap: 0.25,
        homePoints: 0,
        awayPoints: 2
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('away');

      expect(resultFlag('home', settleResult)).toBe(-1);
      expect(resultFlag('away', settleResult)).toBe(1); // 0.95
    });

    // - .25
    it('讓分 球頭 -0.25 主隊 0分  客隊 0分', () => {
      const data = {
        spreadHandicap: -0.25,
        homePoints: 0,
        awayPoints: 0
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('fair|away');

      expect(resultFlag('home', settleResult)).toBe(-0.5);
      expect(resultFlag('away', settleResult)).toBe(0.5);
    });

    it('讓分 球頭 -0.25 主隊 1分  客隊 0分', () => {
      const data = {
        spreadHandicap: -0.25,
        homePoints: 1,
        awayPoints: 0
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('home');

      expect(resultFlag('home', settleResult)).toBe(1); // 0.95
      expect(resultFlag('away', settleResult)).toBe(-1);
    });

    it('讓分 球頭 -0.25 主隊 0分  客隊 1分', () => {
      const data = {
        spreadHandicap: -0.25,
        homePoints: 0,
        awayPoints: 1
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('away');

      expect(resultFlag('home', settleResult)).toBe(-1);
      expect(resultFlag('away', settleResult)).toBe(1); // 0.95
    });

    it('讓分 球頭 -0.25 主隊 1分  客隊 1分', () => {
      const data = {
        spreadHandicap: 0.25,
        homePoints: 1,
        awayPoints: 1
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('fair|away');

      expect(resultFlag('home', settleResult)).toBe(-0.5);
      expect(resultFlag('away', settleResult)).toBe(0.5);
    });

    it('讓分 球頭 -0.25 主隊 2分  客隊 0分', () => {
      const data = {
        spreadHandicap: -0.25,
        homePoints: 2,
        awayPoints: 0
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('home');

      expect(resultFlag('home', settleResult)).toBe(1); // 0.95
      expect(resultFlag('away', settleResult)).toBe(-1);
    });

    it('讓分 球頭 -0.25 主隊 0分  客隊 2分', () => {
      const data = {
        spreadHandicap: -0.25,
        homePoints: 0,
        awayPoints: 2
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('away');

      expect(resultFlag('home', settleResult)).toBe(-1);
      expect(resultFlag('away', settleResult)).toBe(1); // 0.95
    });
  });


  // ======================================================
  describe('測試 讓分 球頭(handicap) 為 小數 .5 盤口', () => {
    it('讓分 球頭 .5 主隊 0分  客隊 0分 ', () => {
      const data = {
        spreadHandicap: .5,
        homePoints: 0,
        awayPoints: 0
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('away');

      expect(resultFlag('home', settleResult)).toBe(-1);
      expect(resultFlag('away', settleResult)).toBe(1); // 0.95
    });

    it('讓分 球頭 .5 主隊 1分  客隊 0分 ', () => {
      const data = {
        spreadHandicap: .5,
        homePoints: 1,
        awayPoints: 0
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('home');

      expect(resultFlag('home', settleResult)).toBe(1); // 0.95
      expect(resultFlag('away', settleResult)).toBe(-1);
    });

    it('讓分 球頭 .5 主隊 0分  客隊 1分 ', () => {
      const data = {
        spreadHandicap: .5,
        homePoints: 0,
        awayPoints: 1
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('away');

      expect(resultFlag('home', settleResult)).toBe(-1);
      expect(resultFlag('away', settleResult)).toBe(1); // 0.95
    });

    it('讓分 球頭 .5 主隊 1分  客隊 1分 ', () => {
      const data = {
        spreadHandicap: .5,
        homePoints: 1,
        awayPoints: 1
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('away');

      expect(resultFlag('home', settleResult)).toBe(-1);
      expect(resultFlag('away', settleResult)).toBe(1); // 0.95
    });

    it('讓分 球頭 .5 主隊 2分  客隊 0分 ', () => {
      const data = {
        spreadHandicap: .5,
        homePoints: 2,
        awayPoints: 1
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('home');

      expect(resultFlag('home', settleResult)).toBe(1); // 0.95
      expect(resultFlag('away', settleResult)).toBe(-1);
    });

    it('讓分 球頭 .5 主隊 0分  客隊 2分 ', () => {
      const data = {
        spreadHandicap: .5,
        homePoints: 0,
        awayPoints: 2
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('away');

      expect(resultFlag('home', settleResult)).toBe(-1);
      expect(resultFlag('away', settleResult)).toBe(1); // 0.95
    });
  });


  // ======================================================
  describe('測試 讓分 球頭(handicap) 為 小數 .75 盤口 ( =>< -.75 )', () => {
    // .75
    it('讓分 球頭 0.75 主隊 0分  客隊 0分 ', () => {
      const data = {
        spreadHandicap: 0.75,
        homePoints: 0,
        awayPoints: 0
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('away');

      expect(resultFlag('home', settleResult)).toBe(-1);
      expect(resultFlag('away', settleResult)).toBe(1); // 0.95
    });

    it('讓分 球頭 0.75 主隊 1分  客隊 0分 ', () => {
      const data = {
        spreadHandicap: 0.75,
        homePoints: 1,
        awayPoints: 0
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('fair|home');

      expect(resultFlag('home', settleResult)).toBe(0.5);
      expect(resultFlag('away', settleResult)).toBe(-0.5);
    });

    it('讓分 球頭 0.75 主隊 0分  客隊 1分 ', () => {
      const data = {
        spreadHandicap: 0.75,
        homePoints: 0,
        awayPoints: 1
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('away');

      expect(resultFlag('home', settleResult)).toBe(-1);
      expect(resultFlag('away', settleResult)).toBe(1); // 0.95
    });

    it('讓分 球頭 0.75 主隊 1分  客隊 1分 ', () => {
      const data = {
        spreadHandicap: 0.75,
        homePoints: 1,
        awayPoints: 1
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('away');

      expect(resultFlag('home', settleResult)).toBe(-1);
      expect(resultFlag('away', settleResult)).toBe(1); // 0.95
    });

    it('讓分 球頭 0.75 主隊 2分  客隊 0分 ', () => {
      const data = {
        spreadHandicap: 0.75,
        homePoints: 2,
        awayPoints: 0
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('home');

      expect(resultFlag('home', settleResult)).toBe(1); // 0.95
      expect(resultFlag('away', settleResult)).toBe(-1);
    });

    it('讓分 球頭 0.75 主隊 0分  客隊 2分 ', () => {
      const data = {
        spreadHandicap: 0.75,
        homePoints: 0,
        awayPoints: 2
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('away');

      expect(resultFlag('home', settleResult)).toBe(-1);
      expect(resultFlag('away', settleResult)).toBe(1); // 0.95
    });

    // - .75
    it('讓分 球頭 -0.75 主隊 0分  客隊 0分 ', () => {
      const data = {
        spreadHandicap: -0.75,
        homePoints: 0,
        awayPoints: 0
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('away');

      expect(resultFlag('home', settleResult)).toBe(-1);
      expect(resultFlag('away', settleResult)).toBe(1); // 0.95
    });

    it('讓分 球頭 -0.75 主隊 1分  客隊 0分 ', () => {
      const data = {
        spreadHandicap: -0.75,
        homePoints: 1,
        awayPoints: 0
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('fair|home');

      expect(resultFlag('home', settleResult)).toBe(0.5);
      expect(resultFlag('away', settleResult)).toBe(-0.5);
    });

    it('讓分 球頭 -0.75 主隊 0分  客隊 1分 ', () => {
      const data = {
        spreadHandicap: -0.75,
        homePoints: 0,
        awayPoints: 1
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('away');

      expect(resultFlag('home', settleResult)).toBe(-1);
      expect(resultFlag('away', settleResult)).toBe(1); // 0.95
    });

    it('讓分 球頭 -0.75 主隊 1分  客隊 1分 ', () => {
      const data = {
        spreadHandicap: -0.75,
        homePoints: 1,
        awayPoints: 1
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('away');

      expect(resultFlag('home', settleResult)).toBe(-1);
      expect(resultFlag('away', settleResult)).toBe(1); // 0.95
    });

    it('讓分 球頭 -0.75 主隊 2分  客隊 0分 ', () => {
      const data = {
        spreadHandicap: -0.75,
        homePoints: 2,
        awayPoints: 0
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('home');

      expect(resultFlag('home', settleResult)).toBe(1); // 0.95
      expect(resultFlag('away', settleResult)).toBe(-1);
    });

    it('讓分 球頭 -0.75 主隊 0分  客隊 2分 ', () => {
      const data = {
        spreadHandicap: -0.75,
        homePoints: 0,
        awayPoints: 2
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('away');

      expect(resultFlag('home', settleResult)).toBe(-1);
      expect(resultFlag('away', settleResult)).toBe(1); // 0.95
    });
  });

  // ======================================================
  describe('測試 讓分 球頭(handicap) 為 整數 1 盤口', () => {
    // .75
    it('讓分 球頭 1 主隊 0分  客隊 0分 ', () => {
      const data = {
        spreadHandicap: 1,
        homePoints: 0,
        awayPoints: 0
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('away');

      expect(resultFlag('home', settleResult)).toBe(-1);
      expect(resultFlag('away', settleResult)).toBe(1); // 0.95
    });

    it('讓分 球頭 1 主隊 1分  客隊 0分 ', () => {
      const data = {
        spreadHandicap: 1,
        homePoints: 1,
        awayPoints: 0
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('fair2');

      expect(resultFlag('home', settleResult)).toBe(0);
      expect(resultFlag('away', settleResult)).toBe(0);
    });

    it('讓分 球頭 1 主隊 0分  客隊 1分 ', () => {
      const data = {
        spreadHandicap: 1,
        homePoints: 0,
        awayPoints: 1
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('away');

      expect(resultFlag('home', settleResult)).toBe(-1);
      expect(resultFlag('away', settleResult)).toBe(1); // 0.95
    });

    it('讓分 球頭 1 主隊 1分  客隊 1分 ', () => {
      const data = {
        spreadHandicap: 1,
        homePoints: 1,
        awayPoints: 1
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('away');

      expect(resultFlag('home', settleResult)).toBe(-1);
      expect(resultFlag('away', settleResult)).toBe(1); // 0.95
    });

    it('讓分 球頭 1 主隊 2分  客隊 0分 ', () => {
      const data = {
        spreadHandicap: 1,
        homePoints: 2,
        awayPoints: 0
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('home');

      expect(resultFlag('home', settleResult)).toBe(1); // 0.95
      expect(resultFlag('away', settleResult)).toBe(-1);
    });

    it('讓分 球頭 1 主隊 0分  客隊 2分 ', () => {
      const data = {
        spreadHandicap: 1,
        homePoints: 0,
        awayPoints: 2
      };

      const settleResult = settleSpreadSoccer(data);
      expect(settleResult).toBe('away');

      expect(resultFlag('home', settleResult)).toBe(-1);
      expect(resultFlag('away', settleResult)).toBe(1); // 0.95
    });
  });
  

  // ======================================================
  // ======================================================
  // ======================================================
  describe('測試 大小 球頭(handicap) 為 0 整數盤口', () => {
    it('大小 球頭 0 主隊 0分  客隊 0分 ', () => {
      const data = {
        totalsHandicap: 0,
        homePoints: 0,
        awayPoints: 0
      };

      const settleResult = settleTotalsSoccer(data);
      expect(settleResult).toBe('fair2');

      expect(resultFlag('over', settleResult)).toBe(0);
      expect(resultFlag('under', settleResult)).toBe(0);
    });

    it('大小 球頭 0 主隊 1分  客隊 0分 ', () => {
      const data = {
        totalsHandicap: 0,
        homePoints: 1,
        awayPoints: 0
      };

      const settleResult = settleTotalsSoccer(data);
      expect(settleResult).toBe('over');

      expect(resultFlag('over', settleResult)).toBe(1); // 0.95
      expect(resultFlag('under', settleResult)).toBe(-1);
    });

    it('大小 球頭 0 主隊 0分  客隊 1分 ', () => {
      const data = {
        totalsHandicap: 0,
        homePoints: 0,
        awayPoints: 1
      };

      const settleResult = settleTotalsSoccer(data);
      expect(settleResult).toBe('over');

      expect(resultFlag('over', settleResult)).toBe(1); // 0.95
      expect(resultFlag('under', settleResult)).toBe(-1);
    });
  });

  // ======================================================
  describe('測試 大小 球頭(handicap) 為 小數 .25 盤口 ( =>< -.25 )', () => {
    // .25
    it('大小 球頭 .25 主隊 0分  客隊 0分 ', () => {
      const data = {
        totalsHandicap: .25,
        homePoints: 0,
        awayPoints: 0
      };

      const settleResult = settleTotalsSoccer(data);
      expect(settleResult).toBe('fair|under');

      expect(resultFlag('over', settleResult)).toBe(-0.5);
      expect(resultFlag('under', settleResult)).toBe(0.5);
    });

    it('大小 球頭 .25 主隊 1分  客隊 0分 ', () => {
      const data = {
        totalsHandicap: .25,
        homePoints: 1,
        awayPoints: 0
      };

      const settleResult = settleTotalsSoccer(data);
      expect(settleResult).toBe('over');

      expect(resultFlag('over', settleResult)).toBe(1); // 0.95
      expect(resultFlag('under', settleResult)).toBe(-1);
    });

    it('大小 球頭 .25 主隊 0分  客隊 1分 ', () => {
      const data = {
        totalsHandicap: .25,
        homePoints: 0,
        awayPoints: 1
      };

      const settleResult = settleTotalsSoccer(data);
      expect(settleResult).toBe('over');

      expect(resultFlag('over', settleResult)).toBe(1); // 0.95
      expect(resultFlag('under', settleResult)).toBe(-1);
    });

    it('大小 球頭 .25 主隊 1分  客隊 1分 ', () => {
      const data = {
        totalsHandicap: .25,
        homePoints: 1,
        awayPoints: 1
      };

      const settleResult = settleTotalsSoccer(data);
      expect(settleResult).toBe('over');

      expect(resultFlag('over', settleResult)).toBe(1); // 0.95
      expect(resultFlag('under', settleResult)).toBe(-1);
    });

    // - .25
    it('大小 球頭 -0.25 主隊 0分  客隊 0分 ', () => {
      const data = {
        totalsHandicap: -0.25,
        homePoints: 0,
        awayPoints: 0
      };

      const settleResult = settleTotalsSoccer(data);
      expect(settleResult).toBe('fair|under');

      expect(resultFlag('over', settleResult)).toBe(-0.5);
      expect(resultFlag('under', settleResult)).toBe(0.5);
    });

    it('大小 球頭 -0.25 主隊 1分  客隊 0分 ', () => {
      const data = {
        totalsHandicap: -0.25,
        homePoints: 1,
        awayPoints: 0
      };

      const settleResult = settleTotalsSoccer(data);
      expect(settleResult).toBe('over');

      expect(resultFlag('over', settleResult)).toBe(1); // 0.95
      expect(resultFlag('under', settleResult)).toBe(-1);
    });

    it('大小 球頭 -0.25 主隊 0分  客隊 1分 ', () => {
      const data = {
        totalsHandicap: -0.25,
        homePoints: 0,
        awayPoints: 1
      };

      const settleResult = settleTotalsSoccer(data);
      expect(settleResult).toBe('over');

      expect(resultFlag('over', settleResult)).toBe(1); // 0.95
      expect(resultFlag('under', settleResult)).toBe(-1);
    });

    it('大小 球頭 -0.25 主隊 1分  客隊 1分 ', () => {
      const data = {
        totalsHandicap: -0.25,
        homePoints: 1,
        awayPoints: 1
      };

      const settleResult = settleTotalsSoccer(data);
      expect(settleResult).toBe('over');

      expect(resultFlag('over', settleResult)).toBe(1); // 0.95
      expect(resultFlag('under', settleResult)).toBe(-1);
    });
  });

  // ======================================================
  describe('測試 大小 球頭(handicap) 為 小數 .5 盤口', () => {
    it('大小 球頭 .5 主隊 0分  客隊 0分 ', () => {
      const data = {
        totalsHandicap: .5,
        homePoints: 0,
        awayPoints: 0
      };

      const settleResult = settleTotalsSoccer(data);
      expect(settleResult).toBe('under');

      expect(resultFlag('over', settleResult)).toBe(-1);
      expect(resultFlag('under', settleResult)).toBe(1); // 0.95
    });

    it('大小 球頭 .5 主隊 1分  客隊 0分 ', () => {
      const data = {
        totalsHandicap: .5,
        homePoints: 1,
        awayPoints: 0
      };

      const settleResult = settleTotalsSoccer(data);
      expect(settleResult).toBe('over');

      expect(resultFlag('over', settleResult)).toBe(1); // 0.95
      expect(resultFlag('under', settleResult)).toBe(-1);
    });

    it('大小 球頭 .5 主隊 0分  客隊 1分 ', () => {
      const data = {
        totalsHandicap: .5,
        homePoints: 0,
        awayPoints: 1
      };

      const settleResult = settleTotalsSoccer(data);
      expect(settleResult).toBe('over');

      expect(resultFlag('over', settleResult)).toBe(1); // 0.95
      expect(resultFlag('under', settleResult)).toBe(-1);
    });

    it('大小 球頭 .5 主隊 1分  客隊 1分 ', () => {
      const data = {
        totalsHandicap: .5,
        homePoints: 1,
        awayPoints: 1
      };

      const settleResult = settleTotalsSoccer(data);
      expect(settleResult).toBe('over');

      expect(resultFlag('over', settleResult)).toBe(1); // 0.95
      expect(resultFlag('under', settleResult)).toBe(-1);
    });
  });


  // ======================================================
  describe('測試 大小 球頭(handicap) 為 小數 .75 盤口  ( =>< -.75 )', () => {
    // .75
    it('大小 球頭 .75 主隊 0分  客隊 0分 ', () => {
      const data = {
        totalsHandicap: .75,
        homePoints: 0,
        awayPoints: 0
      };

      const settleResult = settleTotalsSoccer(data);
      expect(settleResult).toBe('under');

      expect(resultFlag('over', settleResult)).toBe(-1);
      expect(resultFlag('under', settleResult)).toBe(1); // 0.95
    });

    it('大小 球頭 .75 主隊 1分  客隊 0分 ', () => {
      const data = {
        totalsHandicap: .75,
        homePoints: 1,
        awayPoints: 0
      };

      const settleResult = settleTotalsSoccer(data);
      expect(settleResult).toBe('fair|over');

      expect(resultFlag('over', settleResult)).toBe(0.5);
      expect(resultFlag('under', settleResult)).toBe(-0.5);
    });

    it('大小 球頭 .75 主隊 0分  客隊 1分 ', () => {
      const data = {
        totalsHandicap: .75,
        homePoints: 0,
        awayPoints: 1
      };

      const settleResult = settleTotalsSoccer(data);
      expect(settleResult).toBe('fair|over');

      expect(resultFlag('over', settleResult)).toBe(0.5);
      expect(resultFlag('under', settleResult)).toBe(-0.5);
    });

    it('大小 球頭 .75 主隊 1分  客隊 1分  ', () => {
      const data = {
        totalsHandicap: .75,
        homePoints: 1,
        awayPoints: 1
      };

      const settleResult = settleTotalsSoccer(data);
      expect(settleResult).toBe('over');

      expect(resultFlag('over', settleResult)).toBe(1); // 0.95
      expect(resultFlag('under', settleResult)).toBe(-1);
    });

    // - .75
    it('大小 球頭 -0.75 主隊 0分  客隊 0分 ', () => {
      const data = {
        totalsHandicap: -0.75,
        homePoints: 0,
        awayPoints: 0
      };

      const settleResult = settleTotalsSoccer(data);
      expect(settleResult).toBe('under');

      expect(resultFlag('over', settleResult)).toBe(-1);
      expect(resultFlag('under', settleResult)).toBe(1); // 0.95
    });

    it('大小 球頭 -0.75 主隊 1分  客隊 0分 ', () => {
      const data = {
        totalsHandicap: -0.75,
        homePoints: 1,
        awayPoints: 0
      };

      const settleResult = settleTotalsSoccer(data);
      expect(settleResult).toBe('fair|over');

      expect(resultFlag('over', settleResult)).toBe(0.5);
      expect(resultFlag('under', settleResult)).toBe(-0.5);
    });

    it('大小 球頭 -0.75 主隊 0分  客隊 1分 ', () => {
      const data = {
        totalsHandicap: -0.75,
        homePoints: 0,
        awayPoints: 1
      };

      const settleResult = settleTotalsSoccer(data);
      expect(settleResult).toBe('fair|over');

      expect(resultFlag('over', settleResult)).toBe(0.5);
      expect(resultFlag('under', settleResult)).toBe(-0.5);
    });

    it('大小 球頭 -0.75 主隊 1分  客隊 1分 ', () => {
      const data = {
        totalsHandicap: -0.75,
        homePoints: 1,
        awayPoints: 1
      };

      const settleResult = settleTotalsSoccer(data);
      expect(settleResult).toBe('over');

      expect(resultFlag('over', settleResult)).toBe(1); // 0.95
      expect(resultFlag('under', settleResult)).toBe(-1);
    });
  });

  // ======================================================
  describe('測試 大小 球頭(handicap) 為 1 整數盤口', () => {
    it('大小 球頭 1 主隊 0分  客隊 0分 ', () => {
      const data = {
        totalsHandicap: 1,
        homePoints: 0,
        awayPoints: 0
      };

      const settleResult = settleTotalsSoccer(data);
      expect(settleResult).toBe('under');

      expect(resultFlag('over', settleResult)).toBe(-1);
      expect(resultFlag('under', settleResult)).toBe(1); // 0.95
    });

    it('大小 球頭 1 主隊 1分  客隊 0分 ', () => {
      const data = {
        totalsHandicap: 1,
        homePoints: 1,
        awayPoints: 0
      };

      const settleResult = settleTotalsSoccer(data);
      expect(settleResult).toBe('fair2');

      expect(resultFlag('over', settleResult)).toBe(0);
      expect(resultFlag('under', settleResult)).toBe(0);
    });

    it('大小 球頭 1 主隊 0分  客隊 1分 ', () => {
      const data = {
        totalsHandicap: 1,
        homePoints: 0,
        awayPoints: 1
      };

      const settleResult = settleTotalsSoccer(data);
      expect(settleResult).toBe('fair2');

      expect(resultFlag('over', settleResult)).toBe(0);
      expect(resultFlag('under', settleResult)).toBe(0);
    });

    it('大小 球頭 1 主隊 1分  客隊 1分 ', () => {
      const data = {
        totalsHandicap: 1,
        homePoints: 1,
        awayPoints: 1
      };

      const settleResult = settleTotalsSoccer(data);
      expect(settleResult).toBe('over');

      expect(resultFlag('over', settleResult)).toBe(1); // 0.95
      expect(resultFlag('under', settleResult)).toBe(-1);
    });
  });

  // ======================================================
  describe('測試 大小 球頭(handicap) 為 1.25 整數盤口 ( =>< -.25 )', () => {
    it('大小 球頭 1.25 主隊 0分  客隊 0分 ', () => {
      const data = {
        totalsHandicap: 1.25,
        homePoints: 0,
        awayPoints: 0
      };

      const settleResult = settleTotalsSoccer(data);
      expect(settleResult).toBe('under');

      expect(resultFlag('over', settleResult)).toBe(-1);
      expect(resultFlag('under', settleResult)).toBe(1); // 0.95
    });

    it('大小 球頭 1.25 主隊 1分  客隊 0分 ', () => {
      const data = {
        totalsHandicap: 1.25,
        homePoints: 1,
        awayPoints: 0
      };

      const settleResult = settleTotalsSoccer(data);
      expect(settleResult).toBe('fair|under');

      expect(resultFlag('over', settleResult)).toBe(-0.5);
      expect(resultFlag('under', settleResult)).toBe(0.5);
    });

    it('大小 球頭 1.25 主隊 0分  客隊 1分 ', () => {
      const data = {
        totalsHandicap: 1.25,
        homePoints: 0,
        awayPoints: 1
      };

      const settleResult = settleTotalsSoccer(data);
      expect(settleResult).toBe('fair|under');

      expect(resultFlag('over', settleResult)).toBe(-0.5);
      expect(resultFlag('under', settleResult)).toBe(0.5);
    });

    it('大小 球頭 1.25 主隊 1分  客隊 1分 ', () => {
      const data = {
        totalsHandicap: 1.25,
        homePoints: 1,
        awayPoints: 1
      };

      const settleResult = settleTotalsSoccer(data);
      expect(settleResult).toBe('over');

      expect(resultFlag('over', settleResult)).toBe(1); // 0.95
      expect(resultFlag('under', settleResult)).toBe(-1);
    });
  });
  

});
