const modules = require('../../util/modules');
const AppErrors = require('../../util/AppErrors');
const db = require('../../util/dbUtil');

async function teamEvent(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const teamEvent = await queryTeamEvent(args);
      const result = await repackage(args, teamEvent);
      resolve(result);
    } catch (err) {
      reject(err);
    }
  });
}

function queryTeamEvent(args) {
  return new Promise(async function(resolve, reject) {
    // 比例為所有人
    // 盤口僅顯示過盤的那個
    try {
      const queries = await db.sequelize.query(
        `(
           SELECT game.bets_id AS id, game.home_points AS home_points,game.away_points AS away_points, game.spread_result AS spread_result, game.totals_result AS totals_result, game.scheduled AS scheduled,
                  home.name AS home_name, home.alias_ch AS home_alias_ch, away.alias AS away_alias, away.alias_ch AS away_alias_ch,
                  spread.home_tw AS spread_home_tw, spread.away_tw AS spread_away_tw, total.over_tw AS totals_over_tw
             FROM matches game,
                  match__spreads AS spread,
                  match__totals AS total,
                  match__teams AS home,
                  match__teams AS away
            WHERE (game.home_id = '${args.team_id}' OR game.away_id = '${
          args.team_id
        }')
              AND game.league_id = '${modules.leagueCodebook(args.league).id}'
              AND game.home_id = home.team_id
              AND game.away_id = away.team_id 
              AND game.spread_id = spread.spread_id
              AND game.totals_id = total.totals_id
              AND game.scheduled BETWEEN UNIX_TIMESTAMP('${
                args.date1
              }') AND UNIX_TIMESTAMP('${args.date2}')
          )
          UNION (
           SELECT game.bets_id AS id, game.home_points AS home_points,game.away_points AS away_points, game.spread_result AS spread_result, game.totals_result AS totals_result, game.scheduled AS scheduled,
                  home.name AS home_name, home.alias_ch AS home_alias_ch, away.alias AS away_alias, away.alias_ch AS away_alias_ch,
                  NULL AS spread_home_tw, NULL AS spread_away_tw, NULL AS totals_over_tw
             FROM matches AS game,
                  match__teams AS home,
                  match__teams AS away
            WHERE (game.home_id = '${args.team_id}' OR game.away_id = '${
          args.team_id
        }' )
              AND game.league_id = '${modules.leagueCodebook(args.league).id}'
              AND game.home_id = home.team_id
              AND game.away_id = away.team_id 
              AND (game.spread_id IS NULL OR game.totals_id IS NULL)
              AND game.scheduled BETWEEN UNIX_TIMESTAMP('${
                args.date1
              }') AND UNIX_TIMESTAMP('${args.date2}')
          )
         `,
        {
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      return resolve(queries);
    } catch (err) {
      return reject(`${err.stack} by DY`);
    }
  });
}

async function repackage(args, teamEvent) {
  try {
    const data = [];
    for (let i = 0; i < teamEvent.length; i++) {
      const ele = teamEvent[i];
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
      if (args.league === 'eSoccer') {
        temp = {
          scheduled: ele.scheduled,
          id: ele.id,
          home_teamname_ch: ele.home_alias_ch
            ? ele.home_alias_ch.split('(')[0].trim()
            : ele.home_alias.split('(')[0].trim(),
          home_playername_ch: ele.home_alias_ch
            ? ele.home_alias_ch.split('(')[1].replace(')', '').trim()
            : ele.home_alias.split('(')[1].replace(')', '').trim(),
          away_teamname_ch: ele.away_alias_ch
            ? ele.away_alias_ch.split('(')[0].trim()
            : ele.away_alias.split('(')[0].trim(),
          away_playername_ch: ele.away_alias_ch
            ? ele.away_alias_ch.split('(')[1].replace(')', '').trim()
            : ele.away_alias.split('(')[1].replace(')', '').trim(),
          home_points: ele.home_points,
          away_points: ele.away_points,
          spread_result: ele.spread_result,
          totals_result: ele.totals_result,
          home_tw: ele.spread_home_tw,
          away_tw: ele.spread_away_tw,
          over_tw: ele.over_tw
        };
      } else {
        temp = {
          scheduled: ele.scheduled,
          id: ele.id,
          home_teamname_ch: ele.home_alias_ch
            ? ele.home_alias_ch
            : ele.home_alias,
          home_playername_ch: null,
          away_teamname_ch: ele.away_alias_ch
            ? ele.away_alias_ch
            : ele.away_alias,
          away_playername_ch: null,
          home_points: ele.home_points,
          away_points: ele.away_points,
          spread_result: ele.spread_result,
          totals_result: ele.totals_result,
          home_tw: ele.spread_home_tw,
          away_tw: ele.spread_away_tw,
          over_tw: ele.over_tw
        };
      }

      data.push(temp);
    }
    return data;
  } catch (err) {
    console.error(`${err.stack} by DY`);
    throw AppErrors.RepackageError(`${err.stack} by DY`);
  }
}
module.exports = teamEvent;
