const leagueUtil = require('../util/leagueUtil');
const firebaseAdmin = require('../util/firebaseUtil');
const database = firebaseAdmin().database();
const ESoccerpbp = require('./pbp_eSoccer');
const AppErrors = require('../util/AppErrors');
const db = require('../util/dbUtil');
const ESoccerpbpInplay = ESoccerpbp.ESoccerpbpInplay;
const ESoccerpbpHistory = ESoccerpbp.ESoccerpbpHistory;
const leagueOnLivescore = require('../model/home/leagueOnLivescoreModel');
const pbpOnHome = require('../model/home/pbpOnHomeModel');
const Match = db.Match;
const sport = 'esports';
const league = 'eSoccer';
const leagueID = leagueUtil.leagueCodebook(league).id;

async function checkmatch_eSoccer() {
  return new Promise(async function(resolve, reject) {
    try {
      const totalData = await queryForEvents();
      const leagueName = await leagueOnLivescore();
      let firestoreData = null;
      if (leagueName === league) {
        firestoreData = await pbpOnHome.matchesOnHome(totalData, league);
      }
      for (let i = 0; i < totalData.length; i++) {
        const betsID = totalData[i].bets_id;
        const gameTime = totalData[i].scheduled * 1000;
        const nowTime = Date.now();
        const eventStatus = totalData[i].status;
        switch (eventStatus) {
          case 2: {
            if (gameTime <= nowTime) {
              try {
                Match.upsert({
                  bets_id: betsID,
                  status: 1
                });
                database
                  .ref(`${sport}/${league}/${betsID}/Summary/status`)
                  .set('inprogress');
                const parameter = {
                  betsID: betsID
                };
                await ESoccerpbpInplay(parameter, firestoreData);
              } catch (err) {
                return reject(
                  new AppErrors.PBPEsoccerError(
                    `${err} at checkmatch_ESoccer by DY`
                  )
                );
              }
            } else {
              database
                .ref(`${sport}/${league}/${betsID}/Summary/status`)
                .set('scheduled');
            }
            break;
          }
          case 1: {
            try {
              let realtimeData = await database
                .ref(`${sport}/${league}/${betsID}`)
                .once('value');
              realtimeData = realtimeData.val();
              if (realtimeData.Summary.status !== 'closed') {
                const parameter = {
                  betsID: betsID,
                  realtimeData: realtimeData
                };
                await ESoccerpbpInplay(parameter, firestoreData);
              }

              if (realtimeData.Summary.status === 'closed') {
                const parameter = {
                  betsID: betsID
                };
                await ESoccerpbpHistory(parameter);
              }
            } catch (err) {
              return reject(
                new AppErrors.FirebaseCollectError(
                  `${err} at checkmatch_ESoccer on ${betsID} by DY`
                )
              );
            }
            break;
          }
          default: {
          }
        }
      }
    } catch (err) {
      return reject(
        new AppErrors.FirebaseCollectError(`${err} at checkmatch_ESoccer by DY`)
      );
    }
    return resolve('ok');
  });
}
async function queryForEvents() {
  return new Promise(async function(resolve, reject) {
    try {
      const queries = await db.sequelize.query(
        `
				 SELECT game.bets_id AS bets_id, game.scheduled AS scheduled, game.status AS status, game.league_id AS league_id,
				        home.name AS home_name,home.alias_ch AS home_alias_ch,home.image_id AS home_image_id, home.alias AS home_alias,
				        away.name AS away_name,away.alias_ch AS away_alias_ch,away.image_id AS away_image_id, away.alias AS away_alias,
								spread.handicap AS handicap, spread.home_tw AS home_tw,spread.away_tw AS away_tw,
								league.name_ch AS league_name_ch
					 FROM matches AS game,
					      match__teams AS home,
								match__teams AS away,
								match__spreads AS spread,
								match__leagues AS league
					WHERE (game.status = ${leagueUtil.MATCH_STATUS.SCHEDULED} OR game.status = ${leagueUtil.MATCH_STATUS.INPLAY})
						AND game.league_id = ${leagueID}
						AND game.home_id = home.team_id
						AND game.away_id = away.team_id
						AND game.spread_id= spread.spread_id
						AND game.ori_league_id = league.ori_league_id
					UNION(
				 SELECT game.bets_id AS bets_id, game.scheduled AS scheduled, game.status AS status, game.league_id AS league_id,
                home.name AS home_name,home.alias_ch AS home_alias_ch,home.image_id AS home_image_id, home.alias AS home_alias,
                away.name AS away_name,away.alias_ch AS away_alias_ch,away.image_id AS away_image_id, away.alias AS away_alias,
								NULL AS handicap, NULL AS home_tw,NULL AS away_tw,
								league.name_ch AS league_name_ch
					 FROM matches AS game,
					      match__teams AS home,
								match__teams AS away,
								match__leagues AS league
					WHERE (game.status = ${leagueUtil.MATCH_STATUS.SCHEDULED} OR game.status = ${leagueUtil.MATCH_STATUS.INPLAY})
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

module.exports = checkmatch_eSoccer;
