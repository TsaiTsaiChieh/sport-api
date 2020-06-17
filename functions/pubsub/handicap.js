const modules = require('../util/modules');
const db = require('../util/dbUtil');
const AppErrors = require('../util/AppErrors');
const oddsURL = 'https://api.betsapi.com/v2/event/odds';
const sports = [
  // 18,
  // 18,
  // 16,
  16,
  16,
  16
];
const leagueUniteIDArray = [
  // 2274
  // 8251
  // 225
  347, // 日職
  349, // 韓職
  11235 // 台職
];
const Match = db.Match;
const MatchSpread = db.Spread;
const MatchTotals = db.Totals;
async function handicap() {
  // go through each league
  for (let i = 0; i < sports.length; i++) {
    const querysForEvent = await query_event(leagueUniteIDArray[i]);
    if (querysForEvent.length > 0) {
      await upsertHandicap(querysForEvent, sports[i], leagueUniteIDArray[i]);
    }
  }
  console.log('handicap success');
}
async function axiosForURL(URL) {
  return new Promise(async function(resolve, reject) {
    try {
      const { data } = await modules.axios(URL);
      return resolve(data);
    } catch (err) {
      return reject(
        new AppErrors.AxiosError(`${err} at prematchFunctions by DY`)
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
    try {
      const queries = await db.sequelize.query(
        `(
				 SELECT game.bets_id AS bets_id
					 FROM matches AS game
					WHERE game.status = ${modules.MATCH_STATUS.SCHEDULED}
						AND game.scheduled BETWEEN UNIX_TIMESTAMP('${now}') AND UNIX_TIMESTAMP('${tomorrow}')
						AND game.league_id = ${league}
			 )`,
        {
          type: db.sequelize.QueryTypes.SELECT
        }
      );
      return resolve(queries);
    } catch (err) {
      return reject(new AppErrors.MysqlError(`${err.stack} at handicap by DY`));
    }
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
            spread_odds[spread_odds.length - 1].home_od !== null &&
            spread_odds[spread_odds.length - 1].handicap !== null &&
            spread_odds[spread_odds.length - 1].away_od !== null &&
            spread_odds[spread_odds.length - 1].home_od !== '-' &&
            spread_odds[spread_odds.length - 1].away_od !== '-'
          ) {
            newest_spread = spread_odds[0];
            newest_spread = spreadCalculator(newest_spread);
            await write2MysqlOfMatchAboutNewestSpread(ele, newest_spread);
          }
        }
        let newest_totals;
        if (totals_odds.length > 0) {
          if (
            totals_odds[totals_odds.length - 1].over_od !== null &&
            totals_odds[totals_odds.length - 1].handicap !== null &&
            totals_odds[totals_odds.length - 1].under_od !== null &&
            totals_odds[totals_odds.length - 1].over_od !== '-' &&
            totals_odds[totals_odds.length - 1].under_od !== '-'
          ) {
            newest_totals = totals_odds[0];
            newest_totals = totalsCalculator(newest_totals);
            await write2MysqlOfMatchAboutNewestTotals(ele, newest_totals);
          }
        }
        for (let j = 0; j < spread_odds.length; j++) {
          let odd = spread_odds[j];
          odd = spreadCalculator(odd);
          if (
            odd.home_od !== null &&
            odd.handicap !== null &&
            odd.away_od !== null &&
            odd.home_od !== '-' &&
            odd.away_od !== '-'
          ) {
            await write2MysqlOfMatchSpread(odd, ele, league);
          }
        }
        for (let k = 0; k < totals_odds.length; k++) {
          let odd = totals_odds[k];
          odd = totalsCalculator(odd);
          if (
            odd.over_od !== null &&
            odd.handicap !== null &&
            odd.under_od !== null &&
            odd.over_od !== '-' &&
            odd.over_od !== '-'
          ) {
            await write2MysqlOfMatchTotals(odd, ele, league);
          }
        }
      }
      return resolve('ok');
    } catch (err) {
      return reject(new AppErrors.MysqlError(`${err.stack} at handicap by DY`));
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
        new AppErrors.MysqlError(`${err} at handicap ${ele.bets_id} by DY`)
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
        new AppErrors.MysqlError(`${err} at handicap ${ele.bets_id} by DY`)
      );
    }
  });
}

async function write2MysqlOfMatchSpread(odd, ele, leagueUniteID) {
  return new Promise(async function(resolve, reject) {
    try {
      await MatchSpread.upsert({
        spread_id: odd.id,
        match_id: ele.bets_id,
        league_id: leagueUniteID,
        handicap: Number.parseFloat(odd.handicap),
        home_odd: Number.parseFloat(odd.away_od),
        away_odd: Number.parseFloat(odd.home_od),
        home_tw: odd.home_tw,
        away_tw: odd.away_tw,
        add_time: Number.parseInt(odd.add_time) * 1000
      });
      return resolve('ok');
    } catch (err) {
      return reject(
        new AppErrors.MysqlError(
          `${err} at handicap of MatchSpread ${ele.bets_id} by DY`
        )
      );
    }
  });
}
async function write2MysqlOfMatchTotals(odd, ele, leagueUniteID) {
  return new Promise(async function(resolve, reject) {
    try {
      await MatchTotals.upsert({
        totals_id: odd.id,
        match_id: ele.bets_id,
        league_id: leagueUniteID,
        handicap: Number.parseFloat(odd.handicap),
        over_odd: Number.parseFloat(odd.over_od),
        under_odd: Number.parseFloat(odd.under_od),
        over_tw: odd.over_tw,
        add_time: Number.parseInt(odd.add_time) * 1000
      });
      return resolve('ok');
    } catch (err) {
      return reject(
        new AppErrors.MysqlError(
          `${err} at handicap of MatchTotals ${ele.bets_id} by DY`
        )
      );
    }
  });
}

function totalsCalculator(handicapObj) {
  if (
    handicapObj.over_odd === handicapObj.under_odd ||
    handicapObj.handicap % 1 !== 0
  ) {
    handicapObj.over_tw = `${handicapObj.handicap}`;
  } else if (
    handicapObj.handicap % 1 === 0 &&
    handicapObj.over_odd !== handicapObj.under_odd
  ) {
    if (handicapObj.over_odd > handicapObj.under_odd) {
      handicapObj.over_tw = `${handicapObj.handicap}贏 +50`;
    } else if (handicapObj.over_odd < handicapObj.under_odd) {
      handicapObj.over_tw = `${handicapObj.handicap}輸 -50`;
    }
  } else if (
    handicapObj.handicap % 1 === 0 &&
    handicapObj.over_odd === handicapObj.under_odd
  ) {
    handicapObj.over_tw = `${handicapObj.handicap}平`;
  }
  return handicapObj;
}
function spreadCalculator(handicapObj) {
  // 賠率相同
  handicapObj.handicap = parseFloat(handicapObj.handicap);
  if (handicapObj.handicap % 1 !== 0 && handicapObj.handicap < 0) {
    handicapObj.home_tw = null;
    handicapObj.away_tw = `${Math.abs(Math.ceil(handicapObj.handicap))}輸`;
  } else if (handicapObj.handicap % 1 !== 0 && handicapObj.handicap >= 0) {
    handicapObj.home_tw = `${Math.floor(handicapObj.handicap)}輸`;
    handicapObj.away_tw = null;
  } else if (
    handicapObj.handicap % 1 === 0 &&
    handicapObj.handicap >= 0 &&
    handicapObj.home_odd === handicapObj.away_odd
  ) {
    handicapObj.home_tw = `${handicapObj.handicap}平`;
    handicapObj.away_tw = null;
  } else if (
    handicapObj.handicap % 1 === 0 &&
    handicapObj.handicap < 0 &&
    handicapObj.home_odd === handicapObj.away_odd
  ) {
    handicapObj.home_tw = null;
    handicapObj.away_tw = `${Math.abs(handicapObj.handicap)}平`;
  } else if (
    handicapObj.handicap % 1 === 0 &&
    handicapObj.handicap >= 0 &&
    handicapObj.home_odd > handicapObj.away_odd
  ) {
    // 盤口為正，代表主讓客，所以主要減
    if (handicapObj.home_odd > handicapObj.away_odd) {
      handicapObj.home_tw = null;
      handicapObj.away_tw = ` ${handicapObj.handicap}輸 +50`;
    } else if (handicapObj.home_odd < handicapObj.away_odd) {
      handicapObj.home_tw = null;
      handicapObj.away_tw = ` ${handicapObj.handicap}贏 +50`;
    }
  } else if (
    handicapObj.handicap % 1 === 0 &&
    handicapObj.handicap >= 0 &&
    handicapObj.home_odd < handicapObj.away_odd
  ) {
    // 盤口為正，代表主讓客，所以主要減
    if (handicapObj.home_odd > handicapObj.away_odd) {
      handicapObj.home_tw = null;
      handicapObj.away_tw = ` ${handicapObj.handicap}輸 -50`;
    } else if (handicapObj.home_odd < handicapObj.away_odd) {
      handicapObj.home_tw = null;
      handicapObj.away_tw = ` ${handicapObj.handicap}贏 -50`;
    }
  } else if (
    // 盤口為負，代表客讓主，所以客要減
    handicapObj.handicap % 1 === 0 &&
    handicapObj.handicap < 0 &&
    handicapObj.home_odd > handicapObj.away_odd
  ) {
    if (handicapObj.home_odd > handicapObj.away_odd) {
      handicapObj.home_tw = `${Math.abs(handicapObj.handicap)}贏 -50`;
      handicapObj.away_tw = null;
    } else if (handicapObj.home_odd < handicapObj.away_odd) {
      handicapObj.home_tw = `${Math.abs(handicapObj.handicap)}輸 -50`;
      handicapObj.away_tw = null;
    }
  } else if (
    // 盤口為負，代表客讓主，所以客要減
    handicapObj.handicap % 1 === 0 &&
    handicapObj.handicap < 0 &&
    handicapObj.home_odd < handicapObj.away_odd
  ) {
    if (handicapObj.home_odd > handicapObj.away_odd) {
      handicapObj.home_tw = `${Math.abs(handicapObj.handicap)}贏 +50`;
      handicapObj.away_tw = null;
    } else if (handicapObj.home_odd < handicapObj.away_odd) {
      handicapObj.home_tw = `${Math.abs(handicapObj.handicap)}輸 +50`;
      handicapObj.away_tw = null;
    }
  } else if (
    // 盤口為負，代表客讓主，所以客要減
    handicapObj.handicap % 1 === 0 &&
    handicapObj.handicap >= 0 &&
    handicapObj.home_odd === handicapObj.away_odd
  ) {
    if (handicapObj.home_odd > handicapObj.away_odd) {
      handicapObj.home_tw = null;
      handicapObj.away_tw = `${Math.abs(handicapObj.handicap)}平`;
    } else if (handicapObj.home_odd < handicapObj.away_odd) {
      handicapObj.home_tw = null;
      handicapObj.away_tw = `${Math.abs(handicapObj.handicap)}平`;
    }
  } else if (
    // 盤口為負，代表客讓主，所以客要減
    handicapObj.handicap % 1 === 0 &&
    handicapObj.handicap < 0 &&
    handicapObj.home_odd === handicapObj.away_odd
  ) {
    if (handicapObj.home_odd > handicapObj.away_odd) {
      handicapObj.home_tw = `+${Math.abs(handicapObj.handicap)}平`;
      handicapObj.away_tw = null;
    } else if (handicapObj.home_odd < handicapObj.away_odd) {
      handicapObj.home_tw = `+${Math.abs(handicapObj.handicap)}平`;
      handicapObj.away_tw = null;
    }
  }
  return handicapObj;
}
module.exports = handicap;
