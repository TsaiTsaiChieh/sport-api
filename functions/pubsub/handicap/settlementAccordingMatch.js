const db = require('../../util/dbUtil');
const AppErrors = require('../../util/AppErrors');
const endStatus = 0;
const validMatch = 1;
const spreadResult = {
  home: 'home',
  away: 'away',
  fair: 'fair2',
  fairHome: 'fair|home',
  fairAway: 'fair|away'
};
const totalsResult = {
  over: 'over',
  under: 'under',
  fair: 'fair2',
  fairUnder: 'fair|under',
  fairOver: 'fair|over'
};

function settlement() {
  return new Promise(async function (resolve, reject) {
    try {
      // 1. query match status = 0 and spread_id || totals_id is not null
      let spreadMetadata = await queryMatchWhichHandicapIsNotNull('spread');
      let totalsMetadata = await queryMatchWhichHandicapIsNotNull('totals');
      // 2. settle the spread || totals result
      spreadMetadata = calculateSpreads(spreadMetadata);
      totalsMetadata = calculateTotals(totalsMetadata);
      // 3. update to db
      await updateSpreadData(spreadMetadata);
      await updateTotalsData(totalsMetadata);
      return resolve();
    } catch (err) {
      return reject(
        new AppErrors.SettlementAccordingMatch(`${err} by TsaiChieh`)
      );
    }
  });
}

function queryMatchWhichHandicapIsNotNull(handicapType) {
  return new Promise(async function (resolve, reject) {
    try {
      // index is ref, taking 171ms
      handicapName = handicapType === 'spread' ? 'spreads' : handicapType;
      method =
        handicapType === 'spread'
          ? { mode1: 'home', mode2: 'away' }
          : { mode1: 'under', mode2: 'over' };
      const result = await db.sequelize.query(
        `SELECT bets_id, matches.${handicapType}_id, home_points, away_points, 
                handicap, ${method.mode1}_odd, ${method.mode2}_odd
           FROM matches
     INNER JOIN match__${handicapName} AS ${handicapName} on matches.${handicapType}_id = ${handicapName}.${handicapType}_id
          WHERE status = ${endStatus}
            AND matches.${handicapType}_id IS NOT NULL
            AND (home_points IS NOT NULL AND home_points != '' OR home_points = 0)
            AND (away_points IS NOT NULL AND away_points != '' OR away_points = 0)
            AND (${handicapType}_result IS NULL OR ${handicapType}_result = '')
            AND flag_prematch = ${validMatch}`,
        {
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      return resolve(result);
    } catch (err) {
      return reject(new AppErrors.MysqlError(`${err} by TsaiChieh`));
    }
  });
}

function calculateSpreads(spreadMetadata) {
  for (let i = 0; i < spreadMetadata.length; i++) {
    /**
     * @description handicap 為正，代表主隊讓客隊；反之，代表客隊讓主隊，讓分隊須減去盤口數
     * @example 1. 當盤口為正「小數」：若主隊總分減去讓分數大於客隊總分，則押主隊的為贏；反之，押客隊為贏，沒有平盤狀況
     * @example 2. 當盤口為負「小數」：若客隊總分減去讓分數大於主隊總分，則押客隊的為贏；反之，押主隊為贏，沒有平盤狀況
     * @example 3. 當盤口為正「整數」且賠率皆一樣時：若主隊總分減去讓分數大於客隊總分，則押主隊的為贏；反之，押客隊為贏，中分洞則平盤
     * @example 4. 當盤口為負「整數」且賠率皆一樣時：若客隊總分減去讓分數大於主隊總分，則押客隊的為贏；反之，押主隊為贏，中分洞則平盤
     * @example 5. 當盤口為正「整數」且主隊賠率大於客隊時：若主隊總分減去讓分數大於客隊總分，則押主隊的為贏；反之，押客隊為贏，中分洞則押主隊贏，因為主隊賠率大於客隊
     * @example 6. 當盤口為正「整數」且客隊賠率大於主隊時：若主隊總分減去讓分數大於客隊總分，則押主隊的為贏；反之，押客隊為贏，中分洞則押客隊贏，因為客隊賠率大於主隊
     * @example 7. 當盤口為負「整數」且主隊賠率大於客隊時：若主隊總分減去讓分數大於客隊總分，則押主隊的為贏；反之，押客隊為贏，中分洞則押主隊贏，因為主隊賠率大於客隊
     * @example 8. 當盤口為負「整數」且客隊賠率大於主隊時：若客隊總分減去讓分數大於主隊總分，則押客隊的為贏；反之，押主隊為贏，中分洞則押客隊贏，因為客隊賠率大於主隊
     */
    const ele = spreadMetadata[i];
    const homeSubtraction = ele.home_points - ele.handicap;
    const awaySubtraction = ele.away_points - Math.abs(ele.handicap);
    // 1. 當盤口為正小數
    if (!Number.isInteger(ele.handicap) && ele.handicap > 0) {
      if (homeSubtraction > ele.away_points)
        ele.spread_result = spreadResult.home;
      else if (homeSubtraction < ele.away_points)
        ele.spread_result = spreadResult.away;
      // 2. 當盤口為負小數
    } else if (!Number.isInteger(ele.handicap) && ele.handicap < 0) {
      if (awaySubtraction > ele.home_points)
        ele.spread_result = spreadResult.away;
      else if (awaySubtraction < ele.home_points)
        ele.spread_result = spreadResult.home;
      // 3. 當盤口為正整數且賠率皆一樣時
    } else if (
      Number.isInteger(ele.handicap) &&
      ele.handicap >= 0 &&
      ele.home_odd === ele.away_odd
    ) {
      if (homeSubtraction > ele.away_points)
        ele.spread_result = spreadResult.home;
      else if (homeSubtraction < ele.away_points)
        ele.spread_result = spreadResult.away;
      else if (homeSubtraction === ele.away_points)
        ele.spread_result = spreadResult.fair;
      // 4. 當盤口為負整數且賠率皆一樣時
    } else if (
      Number.isInteger(ele.handicap) &&
      ele.handicap < 0 &&
      ele.home_odd === ele.away_odd
    ) {
      if (awaySubtraction > ele.home_points)
        ele.spread_result = spreadResult.away;
      else if (awaySubtraction < ele.home_points)
        ele.spread_result = spreadResult.home;
      else if (awaySubtraction === ele.home_points)
        ele.spread_result = spreadResult.fair;
      // 5. 當盤口為正整數且主隊賠率大於客隊時
    } else if (
      Number.isInteger(ele.handicap) &&
      ele.handicap >= 0 &&
      ele.home_odd > ele.away_odd
    ) {
      if (homeSubtraction > ele.away_points)
        ele.spread_result = spreadResult.home;
      else if (homeSubtraction < ele.away_points)
        ele.spread_result = spreadResult.away;
      else if (homeSubtraction === ele.away_points)
        ele.spread_result = spreadResult.fairHome;
      // 6. 當盤口為正整數且客隊賠率大於主隊賠率時
    } else if (
      Number.isInteger(ele.handicap) &&
      ele.handicap >= 0 &&
      ele.home_odd < ele.away_odd
    ) {
      if (homeSubtraction > ele.away_points)
        ele.spread_result = spreadResult.home;
      else if (homeSubtraction < ele.away_points)
        ele.spread_result = spreadResult.away;
      else if (homeSubtraction === ele.away_points)
        ele.spread_result = spreadResult.fairAway;
      // 7. 當盤口為負整數且主隊賠率大於客隊賠率時
    } else if (
      Number.isInteger(ele.handicap) &&
      ele.handicap < 0 &&
      ele.home_odd > ele.away_odd
    ) {
      if (awaySubtraction > ele.home_points)
        ele.spread_result = spreadResult.away;
      else if (awaySubtraction < ele.home_points)
        ele.spread_result = spreadResult.home;
      else if (awaySubtraction === ele.home_points)
        ele.spread_result = spreadResult.fairHome;
    } else if (
      // 8. 當盤口為負整數且客隊賠率大於主隊賠率時
      Number.isInteger(ele.handicap) &&
      ele.handicap < 0 &&
      ele.home_odd < ele.away_odd
    ) {
      if (awaySubtraction > ele.home_points)
        ele.spread_result = spreadResult.away;
      else if (awaySubtraction < ele.home_points)
        ele.spread_result = spreadResult.home;
      else if (awaySubtraction === ele.home_points)
        ele.spread_result = spreadResult.fairAway;
    }
  }
  return spreadMetadata;
}

function updateSpreadData(spreadMetadata) {
  return new Promise(async function (resolve, reject) {
    try {
      const results = [];
      for (let i = 0; i < spreadMetadata.length; i++) {
        const ele = spreadMetadata[i];
        results.push(
          db.Match.update(
            {
              spread_result: ele.spread_result
            },
            { where: { bets_id: ele.bets_id } }
          )
        );
        console.log(
          `Update the result of match_id: ${ele.bets_id}, spread_id: ${ele.spread_id} to [${ele.spread_result}]`
        );
      }
      return resolve(await Promise.all(results));
    } catch (err) {
      return reject(new AppErrors.MysqlError(`${err} by TsaiChieh`));
    }
  });
}

function updateTotalsData(metadata) {
  return new Promise(async function (resolve, reject) {
    try {
      const results = [];
      for (let i = 0; i < metadata.length; i++) {
        const ele = metadata[i];
        results.push(
          db.Match.update(
            {
              totals_result: ele.totals_result
            },
            { where: { bets_id: ele.bets_id } }
          )
        );
        console.log(
          `Update the result of match_id: ${ele.bets_id}, totals_id: ${ele.totals_id} to [${ele.totals_result}]`
        );
      }
      return resolve(await Promise.all(results));
    } catch (err) {
      return reject(new AppErrors.MysqlError(`${err} by TsaiChieh`));
    }
  });
}

function calculateTotals(totalsMetadata) {
  for (let i = 0; i < totalsMetadata.length; i++) {
    /**
     * @description 大小分的盤口皆為正
     * @example 1. 當盤口為小數：主客隊總分相加大於大小分數，押大分贏；反之，押小分贏，無平盤情況
     * @example 2. 當盤口為整數且賠率皆一樣時：主客隊總分相加大於大小分數，押大分贏；反之，押小分贏，中分洞則平盤
     * @example 3. 當盤口為整數且大分的賠率大於小分時：主客隊總分相加大於大小分數，押大分贏；反之，押小分贏，中分洞則押大分贏，因為大分的賠率大於小分
     * @example 4. 當盤口為整數且小分的賠率大於大分時：主客隊總分相加大於大小分數，押大分贏；反之，押小分贏，中分洞則押小分贏，因為小分的賠率大於大分
     */
    const ele = totalsMetadata[i];
    const sum = ele.home_points + ele.away_points;
    // 1. 當盤口為小數
    if (!Number.isInteger(ele.handicap)) {
      if (sum > ele.handicap) ele.totals_result = totalsResult.over;
      else if (sum < ele.handicap) ele.totals_result = totalsResult.under;
      // 2. 當盤口為整數且賠率皆一樣
    } else if (
      Number.isInteger(ele.handicap) &&
      ele.over_odd === ele.under_odd
    ) {
      if (sum > ele.handicap) ele.totals_result = totalsResult.over;
      else if (sum < ele.handicap) ele.totals_result = totalsResult.under;
      else if (sum === ele.handicap) ele.totals_result = totalsResult.fair;
      // 3. 當盤口為整數且大分賠率大於小分
    } else if (Number.isInteger(ele.handicap) && ele.over_odd > ele.under_odd) {
      if (sum > ele.handicap) ele.totals_result = totalsResult.over;
      else if (sum < ele.handicap) ele.totals_result = totalsResult.under;
      else if (sum === ele.handicap) ele.totals_result = totalsResult.fairOver;
      // 3. 當盤口為整數且小分賠率大於大分
    } else if (Number.isInteger(ele.handicap) && ele.over_odd < ele.under_odd) {
      if (sum > ele.handicap) ele.totals_result = totalsResult.over;
      else if (sum < ele.handicap) ele.totals_result = totalsResult.under;
      else if (sum === ele.handicap) ele.totals_result = totalsResult.fairUnder;
    }
  }
  return totalsMetadata;
}

module.exports = settlement;
