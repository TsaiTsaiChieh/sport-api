const modules = require('../util/modules');
const Anotherpbp = require('./pbp_another');
const AppErrors = require('../util/AppErrors');
const db = require('../util/dbUtil');
const AnotherpbpInplay = Anotherpbp.AnotherpbpInplay;
const AnotherpbpHistory = Anotherpbp.AnotherpbpHistory;
const Match = db.Match;
const leagueArray = ['KBO', 'CPBL', 'NPB', 'CBA', 'Soccer'];

async function checkmatch_another() {
  return new Promise(async function(resolve, reject) {
    try {
      for (let leagueC = 0; leagueC < leagueArray.length; leagueC++) {
        const leagueID = modules.leagueCodebook(leagueArray[leagueC]).id;
        const leagueName = leagueArray[leagueC];
        const sportName = modules.league2Sport(leagueArray[leagueC]).sport;
        const totalData = await queryForEvents(leagueID);
        for (let i = 0; i < totalData.length; i++) {
          const betsID = totalData[i].bets_id;
          const gameTime = totalData[i].scheduled * 1000;
          const nowTime = Date.now();
          const eventStatus = totalData[i].status;
          switch (eventStatus) {
            case 2: {
              if (gameTime <= nowTime) {
                try {
                  await Match.upsert({
                    bets_id: betsID,
                    status: 1
                  });
                  await modules.database
                    .ref(`${sportName}/${leagueName}/${betsID}/Summary/status`)
                    .set('inprogress');
                  const parameter = {
                    betsID: betsID
                  };
                  await AnotherpbpInplay(
                    parameter,
                    sportName,
                    leagueName,
                    leagueID
                  );
                } catch (err) {
                  return reject(
                    new AppErrors.PBPEsoccerError(
                      `${err} at checkmatch_Another by DY`
                    )
                  );
                }
              } else {
                await modules.database
                  .ref(`${sportName}/${leagueName}/${betsID}/Summary/status`)
                  .set('scheduled');
              }
              break;
            }
            case 1: {
              try {
                let realtimeData = await modules.database
                  .ref(`${sportName}/${leagueName}/${betsID}`)
                  .once('value');
                realtimeData = realtimeData.val();
                if (realtimeData.Summary.status !== 'closed') {
                  const parameter = {
                    betsID: betsID,
                    realtimeData: realtimeData
                  };
                  await AnotherpbpInplay(
                    parameter,
                    sportName,
                    leagueName,
                    leagueID
                  );
                }
                if (realtimeData.Summary.status === 'closed') {
                  const parameter = {
                    betsID: betsID
                  };
                  await AnotherpbpHistory(
                    parameter,
                    sportName,
                    leagueName,
                    leagueID
                  );
                }
              } catch (err) {
                return reject(
                  new AppErrors.FirebaseCollectError(
                    `${err} at checkmatch_Another on ${betsID} by DY`
                  )
                );
              }
              break;
            }
            default: {
            }
          }
        }
      }
    } catch (err) {
      return reject(
        new AppErrors.FirebaseCollectError(`${err} at checkmatch_Another by DY`)
      );
    }
    return resolve('ok');
  });
}

async function queryForEvents(leagueID) {
  return new Promise(async function(resolve, reject) {
    try {
      const queries = await db.sequelize.query(
        `
				 SELECT game.bets_id AS bets_id, game.scheduled AS scheduled, game.status AS status,
				        home.name AS home_name,home.alias_ch AS home_alias_ch,home.image_id AS home_image_id, home.alias AS home_alias,
				        away.name AS away_name,away.alias_ch AS away_alias_ch,away.image_id AS away_image_id, away.alias AS away_alias,
								spread.handicap AS handicap, spread.home_tw AS home_tw,spread.away_tw AS away_tw,
								league.name_ch AS league_name_ch
					 FROM matches AS game,
					      match__teams AS home,
								match__teams AS away,
								match__spreads AS spread,
								match__leagues AS league
					WHERE (game.status = ${modules.MATCH_STATUS.SCHEDULED} OR game.status = ${modules.MATCH_STATUS.INPLAY})
						AND game.league_id = ${leagueID}
						AND game.home_id = home.team_id
						AND game.away_id = away.team_id
						AND game.spread_id= spread.spread_id
						AND game.ori_league_id = league.ori_league_id
					UNION(
				 SELECT game.bets_id AS bets_id, game.scheduled AS scheduled, game.status AS status,
                home.name AS home_name,home.alias_ch AS home_alias_ch,home.image_id AS home_image_id, home.alias AS home_alias,
                away.name AS away_name,away.alias_ch AS away_alias_ch,away.image_id AS away_image_id, away.alias AS away_alias,
								NULL AS handicap, NULL AS home_tw,NULL AS away_tw,
								league.name_ch AS league_name_ch
					 FROM matches AS game,
					      match__teams AS home,
								match__teams AS away,
								match__leagues AS league
					WHERE (game.status = ${modules.MATCH_STATUS.SCHEDULED} OR game.status = ${modules.MATCH_STATUS.INPLAY})
								AND game.league_id = ${leagueID}
								AND game.home_id = home.team_id
								AND game.away_id = away.team_id
								AND game.spread_id is NULL	
								AND game.ori_league_id = league.ori_league_id			
					    )
			 `,
        {
          type: db.sequelize.QueryTypes.SELECT
        }
      );
      return resolve(queries);
    } catch (err) {
      return reject(
        new AppErrors.MysqlError(`${err} at checkmatch_eSoccer by DY`)
      );
    }
  });
}

module.exports = checkmatch_another;
