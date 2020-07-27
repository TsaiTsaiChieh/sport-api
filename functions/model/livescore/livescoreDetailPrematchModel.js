const modules = require('../../util/modules');
const AppErrors = require('../../util/AppErrors');
const db = require('../../util/dbUtil');

async function livescore(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const match = await queryMatch(args);
      const result = await repackage(args, match);
      resolve(result);
    } catch (err) {
      reject(err);
    }
  });
}
function queryMatch(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const queries = await db.sequelize.query(
        // take 169 ms
        `(
             SELECT game.bets_id AS id, game.status AS status, game.scheduled AS scheduled,
                    home.name AS home_name, away.name AS away_name, home.alias AS home_alias,home.alias_ch AS home_alias_ch, away.alias AS away_alias, away.alias_ch AS away_alias_ch, home.image_id AS home_image_id, away.image_id AS away_image_id,
                    spread.home_tw AS spread_home_tw, spread.away_tw AS spread_away_tw, spread.handicap AS spread_handicap, total.over_tw AS total_over_tw, total.handicap AS total_handicap,
                    league.name_ch AS league_name_ch
               FROM matches AS game,
                    match__teams AS home,
                    match__teams AS away,
                    match__spreads AS spread,
                    match__totals AS total,
                    match__leagues AS league
              WHERE game.league_id = :leagueID
                AND game.bets_id = :eventID
                AND game.home_id = home.team_id
                AND game.away_id = away.team_id
                AND game.spread_id = spread.spread_id
                AND game.totals_id = total.totals_id
                AND game.ori_league_id = league.ori_league_id      
           )
           UNION(
             SELECT game.bets_id AS id, game.status AS status, game.scheduled AS scheduled,
                    home.name AS home_name, away.name AS away_name, home.alias AS home_alias,home.alias_ch AS home_alias_ch, away.alias AS away_alias, away.alias_ch AS away_alias_ch, home.image_id AS home_image_id, away.image_id AS away_image_id,
                    NULL AS spread_home_tw, NULL AS spread_away_tw, NULL AS spread_handicap, NULL AS total_over_tw, NULL AS total_handicap,
                    league.name_ch AS league_name_ch
               FROM matches AS game,
                    match__teams AS home,
                    match__teams AS away,
                    match__leagues AS league
              WHERE game.league_id = :leagueID
                AND game.bets_id = :eventID
                AND game.home_id = home.team_id
                AND game.away_id = away.team_id
                AND (game.spread_id IS NULL OR game.totals_id IS NULL)
                AND game.ori_league_id = league.ori_league_id
           )
           `,
        {
          replacements: {
            leagueID: modules.leagueCodebook(args.league).id,
            eventID: args.eventID
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
async function repackage(args, match) {
  try {
    if (match.length > 0) {
      if (args.league === 'NBA') {
        match.sport = modules.league2Sport(args.league);
        return match;
      } else if (args.league === 'MLB') {
        match.sport = modules.league2Sport(args.league);

        return match;
      } else if (args.league === 'eSoccer') {
        const ele = match[0];
        const temp = {
          id: ele.id,
          status: ele.status,
          sport: modules.league2Sport(args.league).sport,
          league: args.league,
          ori_league: ele.league_name_ch,
          scheduled: ele.scheduled,
          spread: {
            handicap:
              ele.spread_handicap || ele.spread_handicap === 0
                ? ele.spread_handicap
                : null,
            home_tw: ele.spread_home_tw ? ele.spread_home_tw : null,
            away_tw: ele.spread_away_tw ? ele.spread_away_tw : null
          },
          totals: {
            handicap:
              ele.total_handicap || ele.total_handicap === 0
                ? ele.total_handicap
                : null,
            over_tw: ele.total_over_tw ? ele.total_over_tw : null
          },
          home: {
            team_name:
              ele.home_alias_ch.indexOf('(') > 0
                ? ele.home_alias_ch.split('(')[0].trim()
                : ele.home_alias_ch,
            player_name:
              ele.home_name.indexOf('(') > 0
                ? ele.home_name.split('(')[1].replace(')', '').trim()
                : null,
            name: ele.home_name,
            alias: ele.home_alias,
            alias_ch:
              ele.home_alias_ch.indexOf('(') > 0
                ? ele.home_alias_ch.split('(')[0].trim()
                : ele.home_alias_ch,
            image_id: ele.home_image_id
          },
          away: {
            team_name:
              ele.away_alias_ch.indexOf('(') > 0
                ? ele.away_alias_ch.split('(')[0].trim()
                : ele.away_alias_ch,
            player_name:
              ele.away_name.indexOf('(') > 0
                ? ele.away_name.split('(')[1].replace(')', '').trim()
                : null,
            name: ele.away_name,
            alias: ele.away_alias,
            alias_ch:
              ele.away_alias_ch.indexOf('(') > 0
                ? ele.away_alias_ch.split('(')[0].trim()
                : ele.away_alias_ch,
            image_id: ele.away_image_id
          }
        };

        return temp;
      } else {
        const ele = match[0];
        match.sport = modules.league2Sport(args.league);
        const temp = {
          id: ele.id,
          status: ele.status,
          sport: modules.league2Sport(args.league).sport,
          league: args.league,
          ori_league: ele.league_name_ch,
          scheduled: ele.scheduled,
          spread: {
            handicap:
              ele.spread_handicap || ele.spread_handicap === 0
                ? ele.spread_handicap
                : null,
            home_tw: ele.spread_home_tw ? ele.spread_home_tw : null,
            away_tw: ele.spread_away_tw ? ele.spread_away_tw : null
          },
          totals: {
            handicap:
              ele.total_handicap || ele.total_handicap === 0
                ? ele.total_handicap
                : null,
            over_tw: ele.total_over_tw ? ele.total_over_tw : null
          },
          home: {
            team_name: ele.home_alias_ch,
            player_name: null,
            name: ele.home_name,
            alias: ele.home_alias,
            alias_ch: ele.home_alias_ch,
            image_id: ele.home_image_id
          },
          away: {
            team_name: ele.away_alias_ch,
            player_name: null,
            name: ele.away_name,
            alias: ele.away_alias,
            alias_ch: ele.away_alias_ch,
            image_id: ele.away_image_id
          }
        };
        return temp;
      }
    } else {
      return [];
    }
  } catch (err) {
    console.error(`${err.stack} by DY`);
    throw new AppErrors.RepackageError(`${err.stack} by DY`);
  }
}

module.exports = livescore;
