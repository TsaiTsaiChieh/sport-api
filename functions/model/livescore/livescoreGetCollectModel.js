const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
async function livescore(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const allCollections = await queryAllCollection(args);
      console.log(allCollections);

      const result = await repackage(args, allCollections);

      resolve(result);
    } catch (err) {
      console.error('Error in livescore/livescoreCollectModel by DY', err);
      reject({ code: 500, error: err });
    }
  });
}

function queryAllCollection(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const begin = modules.convertTimezone(args.date);
      const end =
        modules.convertTimezone(args.date, {
          op: 'add',
          value: 1,
          unit: 'days'
        }) - 1;

      const queries = await db.sequelize.query(
        `SELECT collections.bets_id, collections.scheduled,
                matches.home_id, matches.away_id, matches.spread_id,
                home.name,
                away.name, 
                spreads.spread_id
           FROM user__collections AS collections,
                matches AS game
                match__teams AS home,
                match__teams AS away
     LEFT JOIN match__spreads spreads ON matches.spread_id = spreads.spread_id
          WHERE collections.uid = '${args.token.uid}'
            AND collections.bets_id = game.bets_id 
            AND collections.league_id = '${
              modules.leagueCodebook(args.league).id
            }'  
            AND collections.scheduled >= '${begin}'   
            AND collections.scheduled <= '${end}'    
            AND matches.home_id = home.team_id
            AND matches.away_id = away.team_id
           `,
        {
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      return resolve(await Promise.all(queries));
    } catch (err) {
      return reject(`${err.stack} by DY`);
    }
  });
}

async function repackage(args, allCollections) {}
module.exports = livescore;
