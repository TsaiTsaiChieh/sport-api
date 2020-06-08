const modules = require('../../util/modules');
const AppErrors = require('../../util/AppErrors');
const db = require('../../util/dbUtil');

async function livescoreInProgress(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const inplayMathes = await queryInplayMatches(args);
      const result = await repackage(args, inplayMathes);
      resolve(result);
    } catch (err) {
      reject(err);
    }
  });
}

function queryInplayMatches(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const begin = modules.convertTimezone(args.date);
      const end = modules.convertTimezone(args.date, {
        op: 'add',
        value: 1,
        unit: 'days'
      });

      const queries = await db.sequelize.query(
        // take 169 ms
        `(
             SELECT game.bets_id AS id, game.status AS status, game.scheduled AS scheduled,
                    home.name AS home_name, away.name AS away_name, home.alias AS home_alias,home.alias_ch AS home_alias_ch, away.alias AS away_alias, away.alias_ch AS away_alias_ch, home.image_id AS home_image_id, away.image_id AS away_image_id,
                    spread.home_tw AS spread_home_tw, spread.away_tw AS spread_away_tw, spread.handicap AS handicap,
                    league.name_ch AS league_name_ch
               FROM matches AS game,
                    match__teams AS home,
                    match__teams AS away,
                    match__spreads AS spread,
                    match__leagues AS league
              WHERE game.league_id = :leagueID
                AND game.home_id = home.team_id
                AND game.away_id = away.team_id
                AND game.spread_id = spread.spread_id
                AND game.scheduled*1000 BETWEEN :begin AND :end
                AND game.ori_league_id = league.ori_league_id
                AND game.status = '${modules.MATCH_STATUS.INPLAY}'
           )
           UNION(
             SELECT game.bets_id AS id, game.status AS status, game.scheduled AS scheduled,
                    home.name AS home_name, away.name AS away_name, home.alias AS home_alias,home.alias_ch AS home_alias_ch, away.alias AS away_alias, away.alias_ch AS away_alias_ch, home.image_id AS home_image_id, away.image_id AS away_image_id,
                    NULL AS spread_home_tw, NULL AS spread_away_tw, NULL AS handicap,
                    league.name_ch AS league_name_ch
               FROM matches AS game,
                    match__teams AS home,
                    match__teams AS away,
                    match__leagues AS league
              WHERE game.league_id = :leagueID
                AND game.home_id = home.team_id
                AND game.away_id = away.team_id
                AND game.spread_id IS NULL
                AND game.scheduled*1000 BETWEEN :begin AND :end
                AND game.ori_league_id = league.ori_league_id
                AND game.status = '${modules.MATCH_STATUS.INPLAY}'
           )
           ORDER BY scheduled
           `,
        {
          replacements: {
            leagueID: modules.leagueCodebook(args.league).id,
            begin: begin * 1000,
            end: end * 1000 - 1
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

async function repackage(args, matches) {
  try {
    const data = [];
    for (let i = 0; i < matches.length; i++) {
      const ele = matches[i];
      let temp;
      if (args.league === 'eSoccer') {
        temp = {
          id: ele.id,
          status: ele.status,
          sport: modules.league2Sport(args.league).sport,
          league: ele.league_name_ch,
          ori_league: args.league,
          scheduled: ele.scheduled * 1000,
          newest_spread: {
            handicap: ele.handicap ? ele.handicap : null,
            home_tw: ele.spread_home_tw ? ele.spread_home_tw : null,
            away_tw: ele.spread_away_tw ? ele.spread_away_tw : null
          },
          home: {
            team_name:
              ele.home_name.indexOf('(') > 0
                ? ele.home_name.split('(')[0].trim()
                : ele.home_name,
            player_name:
              ele.home_name.indexOf('(') > 0
                ? ele.home_name.split('(')[1].replace(')', '').trim()
                : null,
            name: ele.home_name,
            alias: ele.home_alias,
            alias_ch: ele.home_alias_ch,
            image_id: ele.home_image_id
          },
          away: {
            team_name:
              ele.away_name.indexOf('(') > 0
                ? ele.away_name.split('(')[0].trim()
                : ele.away_name,
            player_name:
              ele.away_name.indexOf('(') > 0
                ? ele.away_name.split('(')[1].replace(')', '').trim()
                : null,
            name: ele.away_name,
            alias: ele.away_alias,
            alias_ch: ele.away_alias_ch,
            image_id: ele.away_image_id
          }
        };
      } else {
        temp = {
          id: ele.id,
          status: ele.status,
          sport: modules.league2Sport(args.league).sport,
          league: ele.league_name_ch,
          ori_league: args.league,
          scheduled: ele.scheduled * 1000,
          newest_spread: {
            handicap: ele.handicap ? ele.handicap : null,
            home_tw: ele.spread_home_tw ? ele.spread_home_tw : null,
            away_tw: ele.spread_away_tw ? ele.spread_away_tw : null
          },
          home: {
            team_name: ele.home_name,
            player_name: null,
            name: ele.home_name,
            alias: ele.home_alias,
            alias_ch: ele.home_alias_ch,
            image_id: ele.home_image_id
          },
          away: {
            team_name: ele.away_name,
            player_name: null,
            name: ele.away_name,
            alias: ele.away_alias,
            alias_ch: ele.away_alias_ch,
            image_id: ele.away_image_id
          }
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
module.exports = livescoreInProgress;
