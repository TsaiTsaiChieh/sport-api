const modules = require('../util/modules');
const db = require('../util/dbUtil');
const AppErrors = require('../util/AppErrors');
const oddsURL = 'https://api.betsapi.com/v2/event/odds';
const Match = db.Match;
const MatchSpread = db.Spread;
const MatchTotals = db.Totals;
const leagueUniteID = ['22000'];
const sports = ['1'];
async function handicap_esport() {
  for (let i = 0; i < sports.length; i++) {
    const querysForEvent = await query_event(leagueUniteID[i]);
    if (querysForEvent.length > 0) {
      await upsertHandicap(querysForEvent, sports[i], leagueUniteID[i]);
    }
  }
  console.log('handicap_esports success');
}
async function axiosForURL(URL) {
  return new Promise(async function(resolve, reject) {
    try {
      const { data } = await modules.axios(URL);
      return resolve(data);
    } catch (err) {
      return reject(
        new AppErrors.AxiosError(
          `${err.stack} at prematchFunctions_ESoccer by DY`
        )
      );
    }
  });
}
async function query_event(league) {
  return new Promise(async function(resolve, reject) {
    const unix = Math.floor(Date.now() / 1000);
    const tomorrow = modules.convertTimezoneFormat(unix, {
      op: 'add',
      value: 2,
      unit: 'days'
    });
    const now = modules.convertTimezoneFormat(unix);
    const queries = await db.sequelize.query(
      `(
				 SELECT game.bets_id AS bets_id
					 FROM matches AS game
					WHERE game.status = ${modules.MATCH_STATUS.SCHEDULED}
						AND game.scheduled BETWEEN UNIX_TIMESTAMP('${now}') AND UNIX_TIMESTAMP('${tomorrow}')
						AND game.league_id =  '${league}'
			 )`,
      {
        type: db.sequelize.QueryTypes.SELECT
      }
    );
    return resolve(queries);
  });
}
async function upsertHandicap(querysForEvent, sport, league) {
  return new Promise(async function(resolve, reject) {
    try {
      for (let i = 0; i < querysForEvent.length; i++) {
        const ele = querysForEvent[i];
        const URL = `${oddsURL}?token=${modules.betsToken}&event_id=${ele.bets_id}&odds_market=2,3`;
        const data = await axiosForURL(URL);
        let spread_odds = [];
        let totals_odds = [];
        /* 因為 res 可能為 {
        "success": 1,
        "results": {}
        } */
        if (data.results.odds) {
          if (data.results.odds[`${sport}_2`]) {
            spread_odds = data.results.odds[`${sport}_2`];
          }
          if (data.results.odds[`${sport}_3`]) {
            totals_odds = data.results.odds[`${sport}_3`];
          }
        }
        let newest_spread;

        if (spread_odds.length > 0) {
          if (
            spread_odds[0].home_od !== null &&
            spread_odds[0].handicap !== null &&
            spread_odds[0].away_od !== null &&
            spread_odds[0].home_od !== '-' &&
            spread_odds[0].away_od !== '-'
          ) {
            newest_spread = spread_odds[0];
            newest_spread = spreadCalculator(newest_spread);
            await write2MysqlOfMatchAboutNewestSpread(ele, newest_spread);
            await write2MysqlOfMatchSpread(newest_spread, ele, league);
          }
        }
        let newest_totals;
        if (totals_odds.length > 0) {
          if (
            totals_odds[0].over_od !== null &&
            totals_odds[0].handicap !== null &&
            totals_odds[0].under_od !== null &&
            totals_odds[0].over_od !== '-' &&
            totals_odds[0].under_od !== '-'
          ) {
            newest_totals = totals_odds[0];
          }
          newest_totals = totalsCalculator(newest_totals);
          await write2MysqlOfMatchAboutNewestTotals(ele, newest_totals);
          await write2MysqlOfMatchTotals(newest_totals, ele, league);
        }
        // for (let j = 0; j < spread_odds.length; j++) {
        //  let odd = spread_odds[j];
        //  odd = spreadCalculator(odd);
        //  if (
        //    odd.home_od !== null &&
        //    odd.handicap !== null &&
        //    odd.away_od !== null
        //  ) {
        //    await write2MysqlOfMatchSpread(odd, ele, league);
        //  }
        // }
        // for (let k = 0; k < totals_odds.length; k++) {
        //  let odd = totals_odds[k];
        //  odd = totalsCalculator(odd);
        //  if (
        //    odd.over_od !== null &&
        //    odd.handicap !== null &&
        //    odd.under_od !== null
        //  ) {
        //    await write2MysqlOfMatchTotals(odd, ele, league);
        //  }
        // }
      }
      return resolve('ok');
    } catch (err) {
      return reject(
        new AppErrors.HandicapEsoccerError(
          `${err.stack} at handicap_esports by DY`
        )
      );
    }
  });
}

async function write2MysqlOfMatchAboutNewestSpread(ele, newest_spread) {
  return new Promise(async function(resolve, reject) {
    try {
      await Match.upsert({
        bets_id: ele.bets_id,
        spread_id: newest_spread.id
      });
      return resolve('ok');
    } catch (err) {
      return reject(
        new AppErrors.MysqlError(
          `${err.stack} at handicap_esports ${ele.bets_id} by DY`
        )
      );
    }
  });
}

async function write2MysqlOfMatchAboutNewestTotals(ele, newest_totals) {
  return new Promise(async function(resolve, reject) {
    try {
      await Match.upsert({
        bets_id: ele.bets_id,
        totals_id: newest_totals.id
      });
      return resolve('ok');
    } catch (err) {
      return reject(
        new AppErrors.MysqlError(
          `${err.stack} at handicap_esports ${ele.bets_id} by DY`
        )
      );
    }
  });
}

async function write2MysqlOfMatchSpread(odd, ele, league) {
  return new Promise(async function(resolve, reject) {
    try {
      await MatchSpread.upsert({
        spread_id: odd.id,
        match_id: ele.bets_id,
        league_id: league,
        handicap: Number.parseFloat(odd.handicap),
        rate: Number.parseFloat(odd.rate),
        home_odd: Number.parseFloat(odd.home_od),
        away_odd: Number.parseFloat(odd.away_od),
        home_tw: odd.home_tw,
        away_tw: odd.away_tw,
        add_time: Number.parseInt(odd.add_time) * 1000
      });
      return resolve('ok');
    } catch (err) {
      return reject(
        new AppErrors.MysqlError(
          `${err.stack} at handicap_esports of MatchSpread ${ele.bets_id} by DY`
        )
      );
    }
  });
}

async function write2MysqlOfMatchTotals(odd, ele, league) {
  return new Promise(async function(resolve, reject) {
    try {
      await MatchTotals.upsert({
        totals_id: odd.id,
        match_id: ele.bets_id,
        league_id: league,
        handicap: Number.parseFloat(odd.handicap),
        rate: Number.parseFloat(odd.rate),
        over_odd: Number.parseFloat(odd.over_od),
        under_odd: Number.parseFloat(odd.under_od),
        over_tw: odd.over_tw,
        add_time: Number.parseInt(odd.add_time) * 1000
      });
      return resolve('ok');
    } catch (err) {
      return reject(
        new AppErrors.MysqlError(
          `${err.stack} at handicap_esports of MatchTotals ${ele.bets_id} by DY`
        )
      );
    }
  });
}

function spreadCalculator(handicapObj) {
  if (handicapObj.handicap) {
    handicapObj.handicap = handicapObj.handicap.toString();
    if (handicapObj.handicap.indexOf(',') !== -1) {
      // 有兩個以上盤口
      const firstHandicap = Math.abs(
        parseFloat(handicapObj.handicap.split(',')[0])
      );
      const secondHandicap = Math.abs(
        parseFloat(handicapObj.handicap.split(',')[1])
      );
      if (firstHandicap % 1 !== 0) {
        // 第一盤口為小數
        if (firstHandicap >= 0 && secondHandicap >= 0) {
          // 顯示在主隊區，代表主讓客
          handicapObj.home_tw = firstHandicap + '/' + secondHandicap;
          handicapObj.away_tw = null;
          handicapObj.handicap =
            (parseFloat(Math.abs(firstHandicap)) +
              parseFloat(Math.abs(secondHandicap))) /
            2;
          handicapObj.rate = 50;
        } else {
          // 顯示在客隊區
          handicapObj.home_tw = null;
          handicapObj.away_tw = firstHandicap + '/' + secondHandicap;
          handicapObj.handicap =
            (parseFloat(Math.abs(firstHandicap)) +
              parseFloat(Math.abs(secondHandicap))) /
            2;
          handicapObj.rate = 50;
        }
      } else {
        // 第一盤口為整數
        if (firstHandicap >= 0) {
          // 顯示在主隊區
          handicapObj.home_tw = firstHandicap + '/' + secondHandicap;
          handicapObj.away_tw = null;
          handicapObj.handicap =
            (parseFloat(Math.abs(firstHandicap)) +
              parseFloat(Math.abs(secondHandicap))) /
            2;
          handicapObj.rate = -50;
        } else {
          // 顯示在客隊區
          handicapObj.home_tw = null;
          handicapObj.away_tw = firstHandicap + '/' + secondHandicap;
          handicapObj.handicap =
            (parseFloat(Math.abs(firstHandicap)) +
              parseFloat(Math.abs(secondHandicap))) /
            2;
          handicapObj.rate = -50;
        }
      }
    } else {
      // 只有一個盤口值
      handicapObj.handicap = parseFloat(handicapObj.handicap);
      if (handicapObj.handicap === 0) {
        // 讓 0 分
        handicapObj.home_tw = 'pk';
        handicapObj.away_tw = null;
        handicapObj.rate = 0;
      } else if (handicapObj.handicap % 1 === 0) {
        // 整數
        if (handicapObj.handicap > 0) {
          // 主讓客
          handicapObj.home_tw = handicapObj.handicap;
          handicapObj.away_tw = null;
          handicapObj.rate = 0;
        } else {
          // 客讓主
          handicapObj.home_tw = null;
          handicapObj.away_tw = handicapObj.handicap;
          handicapObj.rate = 0;
        }
      } else if (handicapObj.handicap % 1 !== 0) {
        // 小數
        if (handicapObj.handicap > 0) {
          // 主讓客
          const str = handicapObj.handicap.toString();
          const str1 = str.split('.')[0];
          const str2 = str.split('.')[1];
          if (str2 === '25') {
            handicapObj.home_tw = `${str1}/${str1}.5`;
            handicapObj.away_tw = null;
            handicapObj.rate = -50;
          } else if (str2 === '75') {
            handicapObj.home_tw = `${str1}.5/${parseFloat(str1) + 1}`;
            handicapObj.away_tw = null;
            handicapObj.rate = 50;
          } else {
            handicapObj.home_tw = Math.abs(handicapObj.handicap);
            handicapObj.away_tw = null;
            handicapObj.rate = -100;
          }
        } else {
          // 客讓主
          handicapObj.handicap = Math.abs(handicapObj.handicap);
          const str = handicapObj.handicap.toString();
          const str1 = str.split('.')[0];
          const str2 = str.split('.')[1];
          if (str2 === '25') {
            handicapObj.home_tw = null;
            handicapObj.away_tw = `${str1}/${str1}.5`;
            handicapObj.rate = -50;
          } else if (str2 === '75') {
            handicapObj.home_tw = null;
            handicapObj.away_tw = `${str1}.5/${parseFloat(str1) + 1}`;
            handicapObj.rate = 50;
          } else {
            handicapObj.home_tw = null;
            handicapObj.away_tw = Math.abs(handicapObj.handicap);
            handicapObj.rate = -100;
          }
        }
      }
    }
  }
  return handicapObj;
}
function totalsCalculator(handicapObj) {
  handicapObj.handicap = handicapObj.handicap.toString();
  if (handicapObj.handicap.indexOf(',') !== -1) {
    const firstHandicap = Math.abs(
      parseFloat(handicapObj.handicap.split(',')[0])
    );
    const secondHandicap = Math.abs(
      parseFloat(handicapObj.handicap.split(',')[1])
    );
    if (firstHandicap % 1 !== 0) {
      // 第一盤口為小數
      handicapObj.over_tw = firstHandicap + '/' + secondHandicap;
      handicapObj.handicap =
        (parseFloat(Math.abs(firstHandicap)) +
          parseFloat(Math.abs(secondHandicap))) /
        2;
      handicapObj.rate = 50;
    } else {
      // 第一盤口為整數
      // 顯示在主隊區
      handicapObj.over_tw = firstHandicap + '/' + secondHandicap;
      handicapObj.handicap =
        (parseFloat(Math.abs(firstHandicap)) +
          parseFloat(Math.abs(secondHandicap))) /
        2;
      handicapObj.rate = -50;
    }
  } else {
    // 盤口只有一個數
    const str = Math.abs(handicapObj.handicap).toString();
    const str1 = str.split('.')[0];
    const str2 = str.split('.')[1];
    if (str2 === '25') {
      handicapObj.over_tw = `${str1}/${str1}.5`;
      handicapObj.rate = -50;
    } else if (str2 === '75') {
      handicapObj.over_tw = `${str1}.5/${parseFloat(str1) + 1}`;
      handicapObj.rate = 50;
    } else {
      handicapObj.over_tw = Math.abs(handicapObj.handicap);
      handicapObj.rate = 0;
    }
  }
  return handicapObj;
}
module.exports = handicap_esport;
