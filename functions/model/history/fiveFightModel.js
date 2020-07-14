const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
const AppErrors = require('../../util/AppErrors');

async function fiveFight(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const events = await queryFiveFightEvent(args);
      const predictions = await queryRate(events);
      const result = await repackage(args, events, predictions);
      resolve(result);
    } catch (err) {
      reject(err);
    }
  });
}

async function queryRate(events) {
  return new Promise(async function(resolve, reject) {
    const matchArray = [];
    for (let i = 0; i < events.length; i++) {
      matchArray.push(events[i].id);
    }
    if (events.length > 0) {
      try {
        const queriesForRate = await db.sequelize.query(
          `SELECT bets_id, spread_option, totals_option
        FROM user__predictions AS prediction
        WHERE bets_id IN (${matchArray})`,
          { type: db.sequelize.QueryTypes.SELECT }
        );

        return resolve(queriesForRate);
      } catch (err) {
        return reject(`${err.stack} by DY`);
      }
    } else {
      return resolve([]);
    }
  });
}

function queryFiveFightEvent(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const queries = await db.sequelize.query(
        // take 169 ms
        `(
          SELECT five.bets_id AS id, five.home_points AS home_points, five.away_points AS away_points, five.spread_result AS spread_result, five.totals_result AS totals_result, five.scheduled AS scheduled,
                   home.name AS home_name, home.alias_ch AS home_alias_ch, away.alias AS away_alias, away.alias_ch AS away_alias_ch,
                   spread.home_tw AS spread_home_tw, spread.away_tw AS spread_away_tw, total.over_tw AS totals_over_tw
              FROM matches AS game,
                   matches AS five,
                   match__spreads AS spread,
                   match__totals AS total,
                   match__teams AS home,
                   match__teams AS away
             WHERE game.bets_id = :event_id
               AND five.bets_id != :event_id
               AND five.status = ${modules.MATCH_STATUS.END}
               AND ((game.home_id = five.home_id AND game.away_id = five.away_id) OR (game.home_id = five.away_id AND game.away_id = five.home_id))
               AND five.league_id = :leagueID
               AND five.home_id = home.team_id
               AND five.away_id = away.team_id 
               AND five.spread_id = spread.spread_id
               AND five.totals_id = total.totals_id
					 )
					 UNION(
            SELECT five.bets_id AS id, five.home_points AS home_points, five.away_points AS away_points, five.spread_result AS spread_result, five.totals_result AS totals_result, five.scheduled AS scheduled,
                   home.name AS home_name, home.alias_ch AS home_alias_ch, away.alias AS away_alias, away.alias_ch AS away_alias_ch,
                   NULL AS spread_home_tw, NULL AS spread_away_tw, total.over_tw AS totals_over_tw
              FROM matches AS game,
                   matches AS five,
									 match__teams AS home,
									 match__totals AS total,
                   match__teams AS away
             WHERE game.bets_id = :event_id
               AND five.status = ${modules.MATCH_STATUS.END}
               AND five.bets_id != :event_id
               AND ((game.home_id = five.home_id AND game.away_id = five.away_id) OR (game.home_id = five.away_id AND game.away_id = five.home_id))
               AND five.league_id = :leagueID
               AND five.home_id = home.team_id
               AND five.away_id = away.team_id 
							 AND five.spread_id IS NULL 
							 AND five.totals_id = total.totals_id    
					) 
					UNION(
            SELECT five.bets_id AS id, five.home_points AS home_points, five.away_points AS away_points, five.spread_result AS spread_result, five.totals_result AS totals_result, five.scheduled AS scheduled,
                   home.name AS home_name, home.alias_ch AS home_alias_ch, away.alias AS away_alias, away.alias_ch AS away_alias_ch,
                   spread.home_tw AS spread_home_tw, spread.away_tw AS spread_away_tw, NULL AS totals_over_tw
              FROM matches AS game,
                   matches AS five,
									 match__teams AS home,
									 match__spreads AS spread,
                   match__teams AS away
             WHERE game.bets_id = :event_id
               AND five.status = ${modules.MATCH_STATUS.END}
               AND five.bets_id != :event_id
               AND ((game.home_id = five.home_id AND game.away_id = five.away_id) OR (game.home_id = five.away_id AND game.away_id = five.home_id))
               AND five.league_id = :leagueID
               AND five.home_id = home.team_id
							 AND five.away_id = away.team_id 
							 AND five.spread_id = spread.spread_id
               AND five.totals_id IS NULL  
          ) 
          UNION(
            SELECT five.bets_id AS id, five.home_points AS home_points, five.away_points AS away_points, five.spread_result AS spread_result, five.totals_result AS totals_result, five.scheduled AS scheduled,
                   home.name AS home_name, home.alias_ch AS home_alias_ch, away.alias AS away_alias, away.alias_ch AS away_alias_ch,
                   NULL AS spread_home_tw, NULL AS spread_away_tw, NULL AS totals_over_tw
              FROM matches AS game,
                   matches AS five,
                   match__teams AS home,
                   match__teams AS away
             WHERE game.bets_id = :event_id
               AND five.status = ${modules.MATCH_STATUS.END}
               AND five.bets_id != :event_id
               AND ((game.home_id = five.home_id AND game.away_id = five.away_id) OR (game.home_id = five.away_id AND game.away_id = five.home_id))
               AND five.league_id = :leagueID
               AND five.home_id = home.team_id
               AND five.away_id = away.team_id 
               AND (five.spread_id IS NULL AND five.totals_id IS NULL)       
          ) 
          ORDER BY scheduled   
          LIMIT 10             
          `,
        {
          replacements: {
            leagueID: modules.leagueCodebook(args.league).id,
            event_id: args.event_id
          },
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      return resolve(await queries);
    } catch (err) {
      return reject(`${err.stack} by DY`);
    }
  });
}

async function repackage(args, events, predictions) {
  for (let i = 0; i < events.length; i++) {
    events[i].spread = {
      home: 0,
      away: 0,
      home_rate: '0%',
      away_rate: '0%'
    };
    events[i].totals = {
      under: 0,
      over: 0,
      under_rate: '0%',
      over_rate: '0%'
    };
  }
  const predictionGroupedMatchId = modules.groupBy(predictions, 'bets_id');
  const statsRate = [];
  for (const key in predictionGroupedMatchId) {
    statsRate.push(calculatePredictionRate(predictionGroupedMatchId[key]));
  }
  const eachMatchRate = filloutStatsRate(events, statsRate);
  try {
    const data = [];
    for (let i = 0; i < events.length; i++) {
      const ele = eachMatchRate[i];

      let temp;
      if (ele.spread_result === 'fair|away') {
        ele.spread_result = 'away';
      }
      if (ele.spread_result === 'fair|home') {
        ele.spread_result = 'home';
      }
      if (ele.totals_result === 'fair|over') {
        ele.totals_result = 'over';
      }
      if (ele.totals_result === 'fair|under') {
        ele.totals_result = 'under';
      }
      let result_tw;
      if (ele.spread_home_tw && ele.spread_home_tw !== 'pk') {
        if (ele.spread_result === 'home') {
          result_tw = `讓${ele.spread_home_tw}`;
        } else if (ele.spread_result === 'away') {
          result_tw = `受讓${ele.spread_home_tw}`;
        } else {
        }
      } else if (ele.spread_away_tw && ele.spread_away_tw !== 'pk') {
        if (ele.spread_result === 'home') {
          result_tw = `受讓${ele.spread_away_tw}`;
        } else if (ele.spread_result === 'away') {
          result_tw = `讓${ele.spread_away_tw}`;
        } else {
        }
      } else if (ele.spread_home_tw === 'pk' || ele.spread_away_tw === 'pk') {
        result_tw = 'pk';
      } else {
        result_tw = null;
      }
      if (args.league === 'eSoccer') {
        temp = {
          scheduled: ele.scheduled,
          id: ele.id,
          home_teamname_ch: ele.home_alias_ch
            ? ele.home_alias_ch.split('(')[0].trim()
            : ele.home_alias.split('(')[0].trim(),
          // home_playername_ch: ele.home_alias_ch
          //   ? ele.home_alias_ch.split('(')[1].replace(')', '').trim()
          //   : ele.home_alias.split('(')[1].replace(')', '').trim(),
          away_teamname_ch: ele.away_alias_ch
            ? ele.away_alias_ch.split('(')[0].trim()
            : ele.away_alias.split('(')[0].trim(),
          // away_playername_ch: ele.away_alias_ch
          //   ? ele.away_alias_ch.split('(')[1].replace(')', '').trim()
          //   : ele.away_alias.split('(')[1].replace(')', '').trim(),
          home_points: ele.home_points,
          away_points: ele.away_points,
          spread_result: ele.spread_result,
          totals_result: ele.totals_result,
          home_tw: ele.spread_home_tw,
          away_tw: ele.spread_away_tw,
          result_tw: result_tw,
          over_tw: ele.totals_over_tw,
          home_rate: ele.spread.home_rate,
          away_rate: ele.spread.away_rate,
          over_rate: ele.totals.over_rate,
          under_rate: ele.totals.under_rate
        };
      } else {
        temp = {
          scheduled: ele.scheduled,
          id: ele.id,
          home_teamname_ch: ele.home_alias_ch
            ? ele.home_alias_ch
            : ele.home_alias,
          // home_playername_ch: null,
          away_teamname_ch: ele.away_alias_ch
            ? ele.away_alias_ch
            : ele.away_alias,
          // away_playername_ch: null,
          home_points: ele.home_points,
          away_points: ele.away_points,
          spread_result: ele.spread_result,
          totals_result: ele.totals_result,
          home_tw: ele.spread_home_tw,
          away_tw: ele.spread_away_tw,
          result_tw: result_tw,
          over_tw: ele.totals_over_tw,
          home_rate: ele.spread.home_rate,
          away_rate: ele.spread.away_rate,
          over_rate: ele.totals.over_rate,
          under_rate: ele.totals.under_rate
        };
      }
      data.push(temp);
    }

    return data;
  } catch (err) {
    console.error(`${err.stack} by DY`);
    throw new AppErrors.RepackageError(`${err.stack} by DY`);
  }
}

function calculatePredictionRate(prediction) {
  const result = {
    id: '',
    spread: { home: 0, away: 0, home_rate: 0, away_rate: 0 },
    totals: { under: 0, over: 0, under_rate: 0, over_rate: 0 }
  };

  for (let i = 0; i < prediction.length; i++) {
    result.id = prediction[i].bets_id;
    if (prediction[i].spread_option === 'home') result.spread.home += 1;
    if (prediction[i].spread_option === 'away') result.spread.away += 1;
    if (prediction[i].totals_option === 'under') result.totals.under += 1;
    if (prediction[i].totals_option === 'over') result.totals.over += 1;
  }
  // console.log(result);

  const { spread, totals } = result;
  // 避免分母為零
  const spreadDeno = spread.home + spread.away ? spread.home + spread.away : 1;
  const totalsDeno =
    totals.under + totals.over ? totals.under + totals.over : 1;

  spread.home_rate = `${Math.floor((spread.home / spreadDeno) * 100)}%`;
  spread.away_rate = `${Math.floor((spread.away / spreadDeno) * 100)}%`;
  totals.under_rate = `${Math.floor((totals.under / totalsDeno) * 100)}%`;
  totals.over_rate = `${Math.floor((totals.over / totalsDeno) * 100)}%`;

  return result;
}

function filloutStatsRate(matches, statsRate) {
  for (let i = 0; i < matches.length; i++) {
    for (let j = 0; j < statsRate.length; j++) {
      if (matches[i].id === statsRate[j].id) {
        matches[i].spread = statsRate[j].spread;
        matches[i].totals = statsRate[j].totals;
      }
    }
  }
  return matches;
}
module.exports = fiveFight;
