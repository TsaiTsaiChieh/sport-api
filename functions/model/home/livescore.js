const modules = require('../../util/modules');
const AppErrors = require('../../util/AppErrors');
const db = require('../../util/dbUtil');
const leagueOnLivescore = require('../../model/home/leagueOnLivescoreModel');
let league;
async function livescore(totalData) {
  league = modules.leagueCodebook(await leagueOnLivescore());
  // return totalData;
  const result = [];
  if (totalData.length >= 4) {
    for (let i = 0; i < 4; i++) {
      result.push(totalData[i]);
    }
  } else {
    for (let i = 0; i < totalData.length; i++) {
      result.push(totalData[i]);
    }
    // query close game
    const closeEvents = await queryForEvents(totalData.length);
    for (let i = 0; i < closeEvents.length; i++) {
      result.push(closeEvents[i]);
    }
  }
  return result;
}

async function queryForEvents(length) {
  return new Promise(async function(resolve, reject) {
    try {
      const queries = await db.sequelize.query(
        `(
				 SELECT game.bets_id AS bets_id, game.scheduled AS scheduled, game.status AS status,
				        home.name AS home_name,home.alias_ch AS home_alias_ch,home.image_id AS home_image_id,
				        away.name AS away_name,away.alias_ch AS away_alias_ch,away.image_id AS away_image_id,
								spread.handicap AS handicap, spread.home_tw AS home_tw,spread.away_tw AS away_tw,
								league.name_ch AS league_name_ch
					 FROM matches AS game,
					      match__teams AS home,
								match__teams AS away,
								match__spreads AS spread,
								match__leagues AS league
					WHERE (game.status = ${modules.MATCH_STATUS.END})
						AND game.league_id = ${league}
						AND game.home_id = home.team_id
						AND game.away_id = away.team_id
						AND game.spread_id= spread.spread_id
						AND game.ori_league_id = league.ori_league_id
					UNION(
				 SELECT game.bets_id AS bets_id, game.scheduled AS scheduled, game.status AS status,
				        home.name AS home_name,home.alias_ch AS home_alias_ch,home.image_id AS home_image_id,
					    	away.name AS away_name,away.alias_ch AS away_alias_ch,away.image_id AS away_image_id,
								NULL AS handicap, NULL AS home_tw,NULL AS away_tw,
								league.name_ch AS league_name_ch
			     FROM matches AS game,
				    		match__teams AS home,
				    		match__teams AS away,
								match__leagues AS league
			    WHERE (game.status = ${modules.MATCH_STATUS.END})
			    	AND game.league_id = ${league}
			    	AND game.home_id = home.team_id
			     	AND game.away_id = away.team_id
						AND game.spread_id IS NULL
						AND game.ori_league_id = league.ori_league_id
						)
				 	LIMIT 4-${length}
			 )`,
        {
          type: db.sequelize.QueryTypes.SELECT
        }
      );
      return resolve(queries);
    } catch (err) {
      return reject(new AppErrors.AxiosError(`${err} at livescore by DY`));
    }
  });
}

module.exports = livescore;
