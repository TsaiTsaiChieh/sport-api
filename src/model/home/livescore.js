const modules = require('../../util/modules');
const leagueUtil = require('../../util/leagueUtil');
const AppErrors = require('../../util/AppErrors');
const db = require('../../util/dbUtil');
const leagueOnLivescore = require('../../model/home/leagueOnLivescoreModel');
let league;
async function livescore(total) {
  league = leagueUtil.leagueCodebook(await leagueOnLivescore()).id;
  const unix = Math.floor(Date.now() / 1000);
  const date2 = modules.convertTimezoneFormat(unix, {
    format: 'YYYY-MM-DD 00:00:00',
    op: 'add',
    value: 1,
    unit: 'days'
  });
  const date1 = modules.convertTimezoneFormat(unix, {
    format: 'YYYY-MM-DD 00:00:00',
    op: 'add',
    value: 0,
    unit: 'days'
  });
  const totalData = await total.sort(function(a, b) {
    return a.scheduled > b.scheduled ? 1 : -1;
  });
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
    const closeEvents = await queryForEvents(totalData.length, date1, date2);
    for (let i = 0; i < closeEvents.length; i++) {
      result.push(closeEvents[i]);
    }
  }
  return result;
}

async function queryForEvents(length, date1, date2) {
  return new Promise(async function(resolve, reject) {
    try {
      const len = 4 - length;
      const queries = await db.sequelize.query(
        `
				SELECT game.bets_id AS bets_id, game.scheduled AS scheduled, game.status AS status, game.league_id AS league_id, game.radar_id AS statscore_id, game.home_points AS home_points, game.away_points AS away_points,
				home.name AS home_name,home.alias_ch AS home_alias_ch,home.image_id AS home_image_id, home.alias AS home_alias, home.team_id AS home_team_id,
				away.name AS away_name,away.alias_ch AS away_alias_ch,away.image_id AS away_image_id, away.alias AS away_alias, away.team_id AS away_team_id,
						 	 spread.handicap AS handicap, spread.home_tw AS home_tw,spread.away_tw AS away_tw,
	             league.name_ch AS league_name_ch
	        FROM matches AS game,
			       	 match__teams AS home,
				       match__teams AS away,
				       match__spreads AS spread,
				       match__leagues AS league
				WHERE (game.status = ${leagueUtil.MATCH_STATUS.END})
				       AND game.league_id = ${league}
				       AND game.home_id = home.team_id
				       AND game.away_id = away.team_id
				       AND game.spread_id= spread.spread_id
				       AND game.ori_league_id = league.ori_league_id
				       AND game.scheduled BETWEEN UNIX_TIMESTAMP('${date1}') AND UNIX_TIMESTAMP('${date2}')
	       UNION(
        SELECT game.bets_id AS bets_id, game.scheduled AS scheduled, game.status AS status, game.league_id AS league_id, game.radar_id AS statscore_id, game.home_points AS home_points, game.away_points AS away_points,
				home.name AS home_name,home.alias_ch AS home_alias_ch,home.image_id AS home_image_id, home.alias AS home_alias, home.team_id AS home_team_id,
				away.name AS away_name,away.alias_ch AS away_alias_ch,away.image_id AS away_image_id, away.alias AS away_alias, away.team_id AS away_team_id,
				       NULL AS handicap, NULL AS home_tw,NULL AS away_tw,
				       league.name_ch AS league_name_ch
	        FROM matches AS game,
				       match__teams AS home,
				       match__teams AS away,
				       match__leagues AS league
				WHERE (game.status = ${leagueUtil.MATCH_STATUS.END})
				       AND game.league_id = ${league}
				       AND game.home_id = home.team_id
				       AND game.away_id = away.team_id
				       AND game.spread_id is NULL	
			         AND game.ori_league_id = league.ori_league_id
				       AND game.scheduled BETWEEN UNIX_TIMESTAMP('${date1}') AND UNIX_TIMESTAMP('${date2}')			
			)
			    ORDER BY scheduled DESC
				 	LIMIT ${len}
			 `,
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