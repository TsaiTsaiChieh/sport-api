const modules = require('../../util/modules');
const AppErrors = require('../../util/AppErrors');
const db = require('../../util/dbUtil');

async function teamEvent(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const teamEvent = await queryTeamEvent(args);
      const predictions = await queryRate(teamEvent);
      const result = await repackage(args, predictions, teamEvent);
      resolve(result);
    } catch (err) {
      reject(err);
    }
  });
}

async function queryRate(teamEvent) {
  return new Promise(async function(resolve, reject) {
    const matchArray = [];

    for (let i = 0; i < teamEvent.length; i++) {
      matchArray.push(teamEvent[i].id);
    }
    if (teamEvent.length > 0) {
      try {
        const queriesForRate = await db.sequelize.query(
          `SELECT bets_id, spread_option, totals_option
        FROM user__predictions AS prediction
        WHERE bets_id IN (:matchArray)`,
          {
            replacements: {
              matchArray: matchArray
            },
            type: db.sequelize.QueryTypes.SELECT
          }
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

function queryTeamEvent(args) {
  const move = 86400; // 一天的秒數

  return new Promise(async function(resolve, reject) {
    try {
      const queries = await db.sequelize.query(
        `(
           SELECT game.bets_id AS id, game.home_points AS home_points,game.away_points AS away_points, game.spread_result AS spread_result, game.totals_result AS totals_result, game.scheduled AS scheduled,
                  home.name AS home_name, home.alias_ch AS home_alias_ch, away.alias AS away_alias, away.alias_ch AS away_alias_ch,
                  spread.home_tw AS spread_home_tw, spread.away_tw AS spread_away_tw, total.over_tw AS totals_over_tw
             FROM matches AS game,
                  match__spreads AS spread,
                  match__totals AS total,
                  match__teams AS home,
                  match__teams AS away
            WHERE (game.home_id = :team_id OR game.away_id = :team_id)
              AND game.league_id = :leagueID
              AND game.status = ${modules.MATCH_STATUS.END}
              AND game.home_id = home.team_id
              AND game.away_id = away.team_id 
              AND game.spread_id = spread.spread_id
              AND game.totals_id = total.totals_id
              AND game.scheduled BETWEEN UNIX_TIMESTAMP(:date1) AND UNIX_TIMESTAMP(:date2)+${move}
					)
					UNION (
						SELECT game.bets_id AS id, game.home_points AS home_points,game.away_points AS away_points, game.spread_result AS spread_result, game.totals_result AS totals_result, game.scheduled AS scheduled,
									 home.name AS home_name, home.alias_ch AS home_alias_ch, away.alias AS away_alias, away.alias_ch AS away_alias_ch,
									 NULL AS spread_home_tw, NULL AS spread_away_tw, total.over_tw AS totals_over_tw
							FROM matches AS game,
									 match__teams AS home,
                   match__totals AS total,
									 match__teams AS away
						 WHERE (game.home_id = :team_id OR game.away_id = :team_id )
							 AND game.league_id = :leagueID
							 AND game.status = ${modules.MATCH_STATUS.END}
							 AND game.home_id = home.team_id
							 AND game.away_id = away.team_id 
							 AND game.spread_id IS NULL
							 AND game.totals_id = total.totals_id
							 AND game.scheduled BETWEEN UNIX_TIMESTAMP(:date1) AND UNIX_TIMESTAMP(:date2)+${move}
									 
					 )
					 UNION (
						SELECT game.bets_id AS id, game.home_points AS home_points,game.away_points AS away_points, game.spread_result AS spread_result, game.totals_result AS totals_result, game.scheduled AS scheduled,
									 home.name AS home_name, home.alias_ch AS home_alias_ch, away.alias AS away_alias, away.alias_ch AS away_alias_ch,
									 spread.home_tw AS spread_home_tw, spread.away_tw AS spread_away_tw, NULL AS totals_over_tw
							FROM matches AS game,
									 match__teams AS home,
									 match__spreads AS spread,                 
									 match__teams AS away
						 WHERE (game.home_id = :team_id OR game.away_id = :team_id )
							 AND game.league_id = :leagueID
							 AND game.status = ${modules.MATCH_STATUS.END}
							 AND game.home_id = home.team_id
							 AND game.away_id = away.team_id 
							 AND game.spread_id = spread.spread_id
							 AND game.totals_id = NULL
							 AND game.scheduled BETWEEN UNIX_TIMESTAMP(:date1) AND UNIX_TIMESTAMP(:date2)+${move}					 
					 )
          UNION (
           SELECT game.bets_id AS id, game.home_points AS home_points,game.away_points AS away_points, game.spread_result AS spread_result, game.totals_result AS totals_result, game.scheduled AS scheduled,
                  home.name AS home_name, home.alias_ch AS home_alias_ch, away.alias AS away_alias, away.alias_ch AS away_alias_ch,
                  NULL AS spread_home_tw, NULL AS spread_away_tw, NULL AS totals_over_tw
             FROM matches AS game,
                  match__teams AS home,
                  match__teams AS away
            WHERE (game.home_id = :team_id OR game.away_id = :team_id )
              AND game.league_id = :leagueID
              AND game.status = ${modules.MATCH_STATUS.END}
              AND game.home_id = home.team_id
              AND game.away_id = away.team_id 
              AND (game.spread_id IS NULL AND game.totals_id IS NULL)
              AND game.scheduled BETWEEN UNIX_TIMESTAMP(:date1) AND UNIX_TIMESTAMP(:date2)+${move}
                  
          )
          ORDER BY scheduled 
         `,
        {
          replacements: {
            team_id: args.team_id,
            leagueID: modules.leagueCodebook(args.league).id,
            date1: args.date1,
            date2: args.date2
          },
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      return resolve(queries);
    } catch (err) {
      return reject(`${err.stack} by DY`);
    }
  });
}

async function repackage(args, predictions, teamEvent) {
  for (let i = 0; i < teamEvent.length; i++) {
    teamEvent[i].spread = {
      home: 0,
      away: 0,
      home_rate: '0%',
      away_rate: '0%'
    };
    teamEvent[i].totals = {
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
  const eachMatchRate = filloutStatsRate(teamEvent, statsRate);

  try {
    const data = [];
    for (let i = 0; i < eachMatchRate.length; i++) {
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
module.exports = teamEvent;
