const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
const AppErrors = require('../../util/AppErrors');
const endStatus = 0;
const spreadResult = {
  home: 'home',
  away: 'away',
  fair: 'fair'
};
async function settlement(req, res) {
  // 1. query match status = 0 and spread_id is not null
  let spreadMetadata = await queryMatchWhichSpreadIsNotNull();
  // 2. query match__spreads table with spread_id
  spreadMetadata = await querySpread(spreadMetadata);
  // 3. settle the spread result
  spreadMetadata = calculateSpreads(spreadMetadata);
  // 4. insert to db
  await insertSpreadData(spreadMetadata);
}

function queryMatchWhichSpreadIsNotNull() {
  return new Promise(async function (resolve, reject) {
    try {
      // index is range
      // TODO AND spread_result IS NULL
      const result = await db.sequelize.query(
        `SELECT bets_id, spread_id, home_points, away_points
           FROM matches
          WHERE status = ${endStatus}
            AND spread_id IS NOT NULL
            AND home_points IS NOT NULL
            AND away_points IS NOT NULL`,
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
function querySpread(spreadMetadata) {
  return new Promise(async function (resolve, reject) {
    try {
      for (let i = 0; i < spreadMetadata.length; i++) {
        const ele = spreadMetadata[i];
        // index is const
        const result = await db.sequelize.query(
          `SELECT handicap, home_odd, away_odd, home_tw, away_tw
             FROM match__spreads
            WHERE spread_id = ${ele.spread_id}
              AND match_id = ${ele.bets_id}`,
          {
            type: db.sequelize.QueryTypes.SELECT
          }
        );

        if (result.length !== 0) {
          spreadMetadata[i].valid = true;
          spreadMetadata[i].handicap = result[0].handicap;
          spreadMetadata[i].home_odd = result[0].home_odd;
          spreadMetadata[i].away_odd = result[0].away_odd;
          spreadMetadata[i].home_tw = result[0].home_tw;
          spreadMetadata[i].away_tw = result[0].away_tw;
        } else {
          spreadMetadata[i].valid = false;
        }
      }
      return resolve(spreadMetadata);
    } catch (err) {
      return reject(new AppErrors.MysqlError(`${err} by TsaiChieh`));
    }
  });
}
function calculateSpreads(spreadMetadata) {
  for (let i = 0; i < spreadMetadata.length; i++) {
    if (spreadMetadata[i].valid) {
      settleSpread(spreadMetadata[i]);
    }
  }
  return spreadMetadata;
}
function settleSpread(ele) {
  /**
   * @description handicap 為正，代表主隊讓客隊；反之，代表客隊讓主隊，讓分隊須減去盤口數
   * @example 1. 當盤口為正「小數」：若主隊總分減去讓分數大於客隊總分，則押主隊的為贏；反之，押客隊為贏，沒有平盤狀況
   * @example 2. 當盤口為負「小數」：若客隊總分減去讓分數大於主隊總分，則押客隊的為贏；反之，押主隊為贏，沒有平盤狀
   * @example 3. 當盤口為正「整數」且賠率皆一樣時：若主隊總分減去讓分數大於客隊總分，則押主隊的為贏；反之，押客隊為贏，中分洞則平盤
   * @example 4. 當盤口為負「整數」且賠率皆一樣時：若客隊總分減去讓分數大於主隊總分，則押客隊的為贏；反之，押主隊為贏，中分洞則平盤
   * @example 5. 當盤口為正「整數」且主隊賠率大於客隊時：若主隊總分減去讓分數大於客隊總分，則押主隊的為贏；反之，押客隊為贏，中分洞則押主隊贏，因為主隊賠率大於客隊
   * @example 6. 當盤口為正「整數」且客隊賠率大於主隊時：若主隊總分減去讓分數大於客隊總分，則押主隊的為贏；反之，押客隊為贏，中分洞則押客隊贏，因為客隊賠率大於主隊
   * @example 7. 當盤口為負「整數」且主隊賠率大於客隊時：若主隊總分減去讓分數大於客隊總分，則押主隊的為贏；反之，押客隊為贏，中分洞則押主隊贏，因為主隊賠率大於客隊
   * @example 8. 當盤口為負「整數」且客隊賠率大於主隊時：若客隊總分減去讓分數大於主隊總分，則押客隊的為贏；反之，押主隊為贏，中分洞則押客隊贏，因為客隊賠率大於主隊
   */

  const homeSubtraction = ele.home_points - ele.handicap;
  const awaySubtraction = ele.home_points - ele.handicap;
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
      ele.spread_result = spreadResult.home;
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
      ele.spread_result = spreadResult.away;
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
      ele.spread_result = spreadResult.home;
  } else if (
    // 8. 當盤口為負整數且客隊賠率大於主隊賠率時
    Number.isInteger(ele.handicap) &&
    ele.handicap < 0 &&
    ele.home_odd < ele.away_odd
  ) {
    if (awaySubtraction > ele.home_points)
      ele.spread_result = spreadResult.away;
    else if (subtraction < ele.home_points)
      ele.spread_result = spreadResult.home;
    else if (awaySubtraction === ele.home_points)
      ele.spread_result = spreadResult.away;
  }
}
function insertSpreadData(spreadMetadata) {
  return new Promise(async function (resolve, reject) {
    try {
      const results = [];
      for (let i = 0; i < spreadMetadata.length; i++) {
        const ele = spreadMetadata[i];
        if (ele.valid) {
          results.push(
            db.Match.update(
              {
                spread_result: ele.spread_result
              },
              { where: { bets_id: ele.bets_id } }
            )
          );
        }
      }
      return resolve(await Promise.all(results));
    } catch (err) {
      return reject(new AppErrors.MysqlError(`${err} by TsaiChieh`));
    }
  });
}

// function
module.exports = settlement;
