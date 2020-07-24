const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
const AppErrors = require('../../util/AppErrors');

function prematchBaseball(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const teamsDataFromMySQL = await getHomeAndAwayTeamFromMySQL(args);
      const teamsDataFromFirestore = await getPrematchFromFirestore(args, teamsDataFromMySQL);
      return resolve(repackagePrematch(teamsDataFromFirestore, teamsDataFromMySQL));
    } catch (err) {
      return reject(err);
    }
  });
}

function getHomeAndAwayTeamFromMySQL(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const result = await db.sequelize.query(
        // index is const, except match__seasons table is ref, taking 170ms
        `SELECT game.bets_id, game.home_id, game.away_id, game.season,
                home.name AS home_name, home.name_ch AS home_name_ch, home.alias AS home_alias, home.alias_ch AS home_alias_ch, 
                away.name AS away_name, away.name_ch AS away_name_ch, away.alias AS away_alias, away.alias_ch AS away_alias_ch
          FROM (
                  SELECT matches.league_id, matches.bets_id, matches.home_id, matches.away_id, matches.scheduled, season.season
                    FROM matches
               LEFT JOIN match__seasons AS season ON season.league_id = matches.league_id
                   WHERE matches.scheduled BETWEEN UNIX_TIMESTAMP(season.start_date) AND UNIX_TIMESTAMP(season.end_date)
               ) 
            AS game
     LEFT JOIN match__teams AS home ON game.home_id = home.team_id
     LEFT JOIN match__teams AS away ON game.away_id = away.team_id
         WHERE game.league_id = :league_id
           AND bets_id = :bets_id`,
        {
          type: db.sequelize.QueryTypes.SELECT,
          replacements: {
            league_id: modules.leagueCodebook(args.league).id,
            bets_id: args.event_id
          }
        });

      !result.length ? reject(new AppErrors.MatchNotFound()) : resolve(result[0]);
    } catch (err) {
      return reject(new AppErrors.MysqlError(`${err.stack} by TsaiChieh`));
    }
  });
}

function getPrematchFromFirestore(args, matchData) {
  return new Promise(async function(resolve, reject) {
    try {
      const { home_id, away_id, season } = matchData;
      const homeData = await modules.getSnapshot(`baseball_${args.league}`, home_id);
      const awayData = await modules.getSnapshot(`baseball_${args.league}`, away_id);
      // error handle when home or away data is not found
      if (!homeData.exists || !awayData.exists) return reject(new AppErrors.TeamInformationNotFound());
      return resolve({ homeData: homeData.data()[`season_${season}`], awayData: awayData.data()[`season_${season}`] });
    } catch (err) {
      return reject(new AppErrors.FirestoreQueryError(`${err.stack} by TsaiChieh`));
    }
  });
}

function repackagePrematch(teamsFromFirestore, teamsFromMySQL) {
  const { homeData, awayData } = teamsFromFirestore;
  try {
    const data = {
      season: teamsFromMySQL.season,
      home: {
        id: teamsFromMySQL.home_id,
        alias: teamsFromMySQL.home_alias,
        alias_ch: teamsFromMySQL.home_alias_ch,
        name: teamsFromMySQL.home_name,
        name_ch: teamsFromMySQL.home_name_ch,
        team_base: {
          L10: homeData.team_base.L10,
          W: homeData.team_base.W,
          L: homeData.team_base.L,
          D: homeData.team_base.D,
          at_home: homeData.team_base.at_home,
          at_away: homeData.team_base.at_away,
          per_R: homeData.team_base.per_R,
          allow_per_R: homeData.team_base.allow_per_R
        },
        team_hit: {
          R: homeData.team_hit.R,
          H: homeData.team_hit.H,
          HR: homeData.team_hit.HR,
          AVG: homeData.team_hit.AVG,
          OBP: homeData.team_hit.OBP,
          SLG: homeData.team_hit.SLG
        }
      },
      away: {
        id: teamsFromMySQL.away_id,
        alias: teamsFromMySQL.away_alias,
        alias_ch: teamsFromMySQL.away_alias_ch,
        name: teamsFromMySQL.away_name,
        name_ch: teamsFromMySQL.away_name_ch
      },
      team_base: {
        L10: awayData.team_base.L10,
        W: awayData.team_base.W,
        L: awayData.team_base.L,
        D: awayData.team_base.D,
        at_home: awayData.team_base.at_home,
        at_away: awayData.team_base.at_away,
        per_R: awayData.team_base.per_R,
        allow_per_R: awayData.team_base.allow_per_R
      },
      team_hit: {
        R: awayData.team_hit.R,
        H: awayData.team_hit.H,
        HR: awayData.team_hit.HR,
        AVG: awayData.team_hit.AVG,
        OBP: awayData.team_hit.OBP,
        SLG: awayData.team_hit.SLG
      }

    };
    return data;
  } catch (err) {
    console.error(err);
    throw new AppErrors.RepackageError(`${err.stack} by TsaiChieh`);
  }
}

module.exports = prematchBaseball;
