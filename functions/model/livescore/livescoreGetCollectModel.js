const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
async function livescore(args) {
  return new Promise(async function (resolve, reject) {
    try {
      const allCollections = await queryAllCollection(args);
      const result = await repackage(args, allCollections);

      resolve(allCollections);
    } catch (err) {
      console.error('Error in livescore/livescoreCollectModel by DY', err);
      reject({ code: 500, error: err });
    }
  });
}

function queryAllCollection(args) {
  return new Promise(async function (resolve, reject) {
    try {
      const begin = modules.convertTimezone(args.date);
      const end =
        modules.convertTimezone(args.date, {
          op: 'add',
          value: 1,
          unit: 'days'
        }) - 1;

      const queries = await db.sequelize.query(
        `(
            SELECT collections.bets_id AS id, collections.scheduled,
                  home.alias_ch AS home_alias_ch, home.image_id AS home_image_id, away.alias_ch AS away_alias_ch, away.image_id AS away_image_id,
                  spread.home_tw AS spread_home_tw , spread.away_tw AS spread_away_tw
            FROM user__collections AS collections,
                 matches AS game,
                 match__teams AS home,
                 match__teams AS away,
                 match__spreads AS spread
            WHERE collections.uid = '${args.token.uid}'
              AND collections.bets_id = game.bets_id 
              AND collections.league_id = '${
                modules.leagueCodebook(args.league).id
              }'  
              AND collections.scheduled BETWEEN ${begin} AND ${end}  
              AND game.home_id = home.team_id
              AND game.away_id = away.team_id
              AND game.spread_id = spread.spread_id
          )
         UNION 
         (
            SELECT collections.bets_id AS id, collections.scheduled,
            home.alias_ch AS home_alias_ch, home.image_id AS home_image_id, away.alias_ch AS away_alias_ch, away.image_id AS away_image_id, 
                   NULL AS spread_home_tw, NULL AS spread_away_tw 
              FROM user__collections AS collections,
                   matches AS game,
                   match__teams AS home,
                   match__teams AS away,
                   match__spreads AS spread
             WHERE collections.uid = '${args.token.uid}'
             AND collections.bets_id = game.bets_id 
             AND collections.league_id = '${
               modules.leagueCodebook(args.league).id
             }'  
             AND collections.scheduled BETWEEN ${begin} AND ${end}  
             AND game.home_id = home.team_id
             AND game.away_id = away.team_id
             AND game.spread_id IS NULL
         )
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
