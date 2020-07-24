const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
const AppErrors = require('../../util/AppErrors');

function prematchBaseball(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const teamsDataFromMySQL = await getHomeAndAwayTeamFromMySQL(args);
      const teamDataFromFirestore = await getPrematchFromFirestore(args, teamsDataFromMySQL);
      console.log(teamDataFromFirestore);
    } catch (err) {
      return reject(err);
    }
    // return resolve(args);

    // getPrematchFromFirestore();
  });
}

function getHomeAndAwayTeamFromMySQL(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const result = await db.sequelize.query(
        // All index is const, taking 165ms
        `SELECT game.bets_id, game.home_id, game.away_id, 
                home.name AS home_name, home.name_ch AS home_name_ch, home.alias AS home_alias, home.alias_ch AS home_alias_ch, 
                away.name AS away_name, away.name_ch AS away_name_ch, away.alias AS away_alias, away.alias_ch AS away_alias_ch
           FROM matches AS game
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
      const { home_id, away_id } = matchData;
      const homeData = await modules.getSnapshot(`baseball_${args.league}`, home_id);
      const awayData = await modules.getSnapshot(`baseball_${args.league}`, away_id);
      // error handle when home or away data is not found
      if (!homeData.exists || !awayData.exists) return reject(new AppErrors.TeamInformationNotFound());

      return resolve({ homeData: homeData.data(), awayData: awayData.data() });
    } catch (err) {
      return reject(new AppErrors.FirestoreQueryError(`${err.stack} by TsaiChieh`));
    }
  });
}

module.exports = prematchBaseball;
