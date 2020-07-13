const modules = require('../util/modules');
const ESoccerpbp = require('./pbp_eSoccer');
const AppErrors = require('../util/AppErrors');
const db = require('../util/dbUtil');
const ESoccerpbpInplay = ESoccerpbp.ESoccerpbpInplay;
const ESoccerpbpHistory = ESoccerpbp.ESoccerpbpHistory;
const Match = db.Match;
const livescore = require('../model/home/livescore');
const leagueOnLivescore = require('../model/home/leagueOnLivescoreModel');
let leagueID;
let leagueName;
async function checkmatch_eSoccer() {
  return new Promise(async function(resolve, reject) {
    try {
      leagueName = await leagueOnLivescore();
      leagueID = modules.leagueCodebook(leagueName).id;

      const totalData = await queryForEvents();
      let firestoreData;
      if ((await leagueOnLivescore()) === 'eSoccer') {
        // 寫到realtime
        firestoreData = await livescore(totalData);

        await modules.database.ref('home_livescore/').set(
          {
            [`${firestoreData[0].bets_id}`]: {
              id: firestoreData[0].bets_id,
              league: firestoreData[0].league_name_ch,
              ori_league: leagueName,
              sport: modules.league2Sport(leagueName).sport,
              status: firestoreData[0].status,
              scheduled: firestoreData[0].scheduled,
              spread: {
                handicap: firestoreData[0].handicap,
                home_tw: firestoreData[0].home_tw,
                away_tw: firestoreData[0].away_tw
              },
              home: {
                teamname:
                  firestoreData[0].home_alias_ch.indexOf('(') > 0
                    ? firestoreData[0].home_alias_ch.split('(')[0].trim()
                    : firestoreData[0].home_alias_ch,
                player_name:
                  firestoreData[0].home_name.indexOf('(') > 0
                    ? firestoreData[0].home_name
                      .split('(')[1]
                      .replace(')', '')
                      .trim()
                    : null,
                name: firestoreData[0].home_name,
                alias: firestoreData[0].home_alias,
                alias_ch:
                  firestoreData[0].home_alias_ch.indexOf('(') > 0
                    ? firestoreData[0].home_alias_ch.split('(')[0].trim()
                    : firestoreData[0].home_alias_ch,
                image_id: firestoreData[0].home_image_id
              },
              away: {
                teamname:
                  firestoreData[0].away_alias_ch.indexOf('(') > 0
                    ? firestoreData[0].away_alias_ch.split('(')[0].trim()
                    : firestoreData[0].away_alias_ch,
                player_name:
                  firestoreData[0].away_name.indexOf('(') > 0
                    ? firestoreData[0].away_name
                      .split('(')[1]
                      .replace(')', '')
                      .trim()
                    : null,
                name: firestoreData[0].away_name,
                alias: firestoreData[0].away_alias,
                alias_ch:
                  firestoreData[0].away_alias_ch.indexOf('(') > 0
                    ? firestoreData[0].away_alias_ch.split('(')[0].trim()
                    : firestoreData[0].away_alias_ch,
                image_id: firestoreData[0].away_image_id
              }
            },
            [`${firestoreData[1].bets_id}`]: {
              id: firestoreData[1].bets_id,
              league: firestoreData[1].league_name_ch,
              ori_league: leagueName,
              sport: modules.league2Sport(leagueName).sport,
              status: firestoreData[1].status,
              scheduled: firestoreData[1].scheduled,
              spread: {
                handicap: firestoreData[1].handicap,
                home_tw: firestoreData[1].home_tw,
                away_tw: firestoreData[1].away_tw
              },
              home: {
                teamname:
                  firestoreData[1].home_alias_ch.indexOf('(') > 0
                    ? firestoreData[1].home_alias_ch.split('(')[0].trim()
                    : firestoreData[1].home_alias_ch,
                player_name:
                  firestoreData[1].home_name.indexOf('(') > 0
                    ? firestoreData[1].home_name
                      .split('(')[1]
                      .replace(')', '')
                      .trim()
                    : null,
                name: firestoreData[1].home_name,
                alias: firestoreData[1].home_alias,
                alias_ch:
                  firestoreData[1].home_alias_ch.indexOf('(') > 0
                    ? firestoreData[1].home_alias_ch.split('(')[0].trim()
                    : firestoreData[1].home_alias_ch,
                image_id: firestoreData[1].home_image_id
              },
              away: {
                teamname:
                  firestoreData[1].away_alias_ch.indexOf('(') > 0
                    ? firestoreData[1].away_alias_ch.split('(')[0].trim()
                    : firestoreData[1].away_alias_ch,
                player_name:
                  firestoreData[1].away_name.indexOf('(') > 0
                    ? firestoreData[1].away_name
                      .split('(')[1]
                      .replace(')', '')
                      .trim()
                    : null,
                name: firestoreData[1].away_name,
                alias: firestoreData[1].away_alias,
                alias_ch:
                  firestoreData[1].away_alias_ch.indexOf('(') > 0
                    ? firestoreData[1].away_alias_ch.split('(')[0].trim()
                    : firestoreData[1].away_alias_ch,
                image_id: firestoreData[1].away_image_id
              }
            },
            [`${firestoreData[2].bets_id}`]: {
              id: firestoreData[2].bets_id,
              league: firestoreData[2].league_name_ch,
              ori_league: leagueName,
              sport: modules.league2Sport(leagueName).sport,
              status: firestoreData[2].status,
              scheduled: firestoreData[2].scheduled,
              spread: {
                handicap: firestoreData[2].handicap,
                home_tw: firestoreData[2].home_tw,
                away_tw: firestoreData[2].away_tw
              },
              home: {
                teamname:
                  firestoreData[2].home_alias_ch.indexOf('(') > 0
                    ? firestoreData[2].home_alias_ch.split('(')[0].trim()
                    : firestoreData[2].home_alias_ch,
                player_name:
                  firestoreData[3].home_name.indexOf('(') > 0
                    ? firestoreData[2].home_name
                      .split('(')[1]
                      .replace(')', '')
                      .trim()
                    : null,
                name: firestoreData[2].home_name,
                alias: firestoreData[2].home_alias,
                alias_ch:
                  firestoreData[2].home_alias_ch.indexOf('(') > 0
                    ? firestoreData[2].home_alias_ch.split('(')[0].trim()
                    : firestoreData[2].home_alias_ch,
                image_id: firestoreData[2].home_image_id
              },
              away: {
                teamname:
                  firestoreData[2].away_alias_ch.indexOf('(') > 0
                    ? firestoreData[2].away_alias_ch.split('(')[0].trim()
                    : firestoreData[2].away_alias_ch,
                player_name:
                  firestoreData[2].away_name.indexOf('(') > 0
                    ? firestoreData[2].away_name
                      .split('(')[1]
                      .replace(')', '')
                      .trim()
                    : null,
                name: firestoreData[2].away_name,
                alias: firestoreData[2].away_alias,
                alias_ch:
                  firestoreData[2].away_alias_ch.indexOf('(') > 0
                    ? firestoreData[2].away_alias_ch.split('(')[0].trim()
                    : firestoreData[2].away_alias_ch,
                image_id: firestoreData[2].away_image_id
              }
            },
            [`${firestoreData[3].bets_id}`]: {
              id: firestoreData[3].bets_id,
              league: firestoreData[3].league_name_ch,
              ori_league: leagueName,
              sport: modules.league2Sport(leagueName).sport,
              status: firestoreData[3].status,
              scheduled: firestoreData[3].scheduled,
              spread: {
                handicap: firestoreData[3].handicap,
                home_tw: firestoreData[3].home_tw,
                away_tw: firestoreData[3].away_tw
              },
              home: {
                teamname:
                  firestoreData[3].home_alias_ch.indexOf('(') > 0
                    ? firestoreData[3].home_alias_ch.split('(')[0].trim()
                    : firestoreData[3].home_alias_ch,
                player_name:
                  firestoreData[3].home_name.indexOf('(') > 0
                    ? firestoreData[3].home_name
                      .split('(')[1]
                      .replace(')', '')
                      .trim()
                    : null,
                name: firestoreData[3].home_name,
                alias: firestoreData[3].home_alias,
                alias_ch:
                  firestoreData[3].home_alias_ch.indexOf('(') > 0
                    ? firestoreData[3].home_alias_ch.split('(')[0].trim()
                    : firestoreData[3].home_alias_ch,
                image_id: firestoreData[3].home_image_id
              },
              away: {
                teamname:
                  firestoreData[3].away_alias_ch.indexOf('(') > 0
                    ? firestoreData[3].away_alias_ch.split('(')[0].trim()
                    : firestoreData[3].away_alias_ch,
                player_name:
                  firestoreData[3].away_name.indexOf('(') > 0
                    ? firestoreData[3].away_name
                      .split('(')[1]
                      .replace(')', '')
                      .trim()
                    : null,
                name: firestoreData[3].away_name,
                alias: firestoreData[3].away_alias,
                alias_ch:
                  firestoreData[3].away_alias_ch.indexOf('(') > 0
                    ? firestoreData[3].away_alias_ch.split('(')[0].trim()
                    : firestoreData[3].away_alias_ch,
                image_id: firestoreData[3].away_image_id
              }
            }
          },
          { merge: true }
        );
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
                await Match.upsert({
                  bets_id: betsID,
                  status: 1
                });
                await modules.database
                  .ref(`esports/eSoccer/${betsID}/Summary/status`)
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
              await modules.database
                .ref(`esports/eSoccer/${betsID}/Summary/status`)
                .set('scheduled');
            }
            break;
          }
          case 1: {
            try {
              let realtimeData = await modules.database
                .ref(`esports/eSoccer/${betsID}`)
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
module.exports = checkmatch_eSoccer;
