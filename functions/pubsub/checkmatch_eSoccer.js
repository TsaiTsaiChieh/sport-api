const modules = require('../util/modules');
const ESoccerpbp = require('./pbp_eSoccer');
const AppErrors = require('../util/AppErrors');
const db = require('../util/dbUtil');
const ESoccerpbpInplay = ESoccerpbp.ESoccerpbpInplay;
const ESoccerpbpHistory = ESoccerpbp.ESoccerpbpHistory;
const livescore = require('../model/home/livescore');
const leagueOnLivescore = require('../model/home/leagueOnLivescoreModel');
const Match = db.Match;
let leagueName;
let leagueID;
let firestoreData;

async function checkmatch_eSoccer() {
  return new Promise(async function(resolve, reject) {
    try {
      leagueName = await leagueOnLivescore();
      leagueID = modules.leagueCodebook(leagueName).id;
      const totalData = await queryForEvents();
      firestoreData = await livescore(totalData);
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

              for (let fi = 0; fi < firestoreData.length; fi++) {
                if (betsID === firestoreData[fi].bets_id) {
                  await write2HomeLivescore(firestoreData[fi]);
                }
              }

              let realtimeHome = await modules.database
                .ref('home_livescore/')
                .once('value');
              realtimeHome = realtimeHome.val();
              const realtimeNow = Object.keys(realtimeHome);

              for (let fi = 0; fi < realtimeNow.length; fi++) {
                let flag = 0;
                for (let fj = 0; fj < firestoreData.length; fj++) {
                  if (realtimeNow[fi] === firestoreData[fj].bets_id) {
                    flag = 1;
                  }
                }
                if (flag === 0) {
                  await modules.database
                    .ref(`home_livescore/${realtimeNow[fi]}`)
                    .set(null);
                }
              }
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

async function write2HomeLivescore(firestoreData) {
  return new Promise(async function(resolve, reject) {
    try {
      await modules.database
        .ref(`home_livescore/${firestoreData.bets_id}`)
        .set({
          id: firestoreData.bets_id,
          league: leagueName,
          ori_league: firestoreData.league_name_ch,
          sport: modules.league2Sport(leagueName).sport,
          status: firestoreData.status,
          scheduled: firestoreData.scheduled,
          spread: {
            handicap:
              firestoreData.handicap === null ? null : firestoreData.handicap,
            home_tw:
              firestoreData.home_tw === null ? null : firestoreData.home_tw,
            away_tw:
              firestoreData.away_tw === null ? null : firestoreData.away_tw
          },
          home: {
            teamname:
              firestoreData.home_alias_ch.indexOf('(') > 0
                ? firestoreData.home_alias_ch.split('(')[0].trim()
                : firestoreData.home_alias_ch,
            player_name:
              firestoreData.home_name.indexOf('(') > 0
                ? firestoreData.home_name.split('(')[1].replace(')', '').trim()
                : null,
            name: firestoreData.home_name,
            alias: firestoreData.home_alias,
            alias_ch:
              firestoreData.home_alias_ch.indexOf('(') > 0
                ? firestoreData.home_alias_ch.split('(')[0].trim()
                : firestoreData.home_alias_ch,
            image_id: firestoreData.home_image_id
          },
          away: {
            teamname:
              firestoreData.away_alias_ch.indexOf('(') > 0
                ? firestoreData.away_alias_ch.split('(')[0].trim()
                : firestoreData.away_alias_ch,
            player_name:
              firestoreData.away_name.indexOf('(') > 0
                ? firestoreData.away_name.split('(')[1].replace(')', '').trim()
                : null,
            name: firestoreData.away_name,
            alias: firestoreData.away_alias,
            alias_ch:
              firestoreData.away_alias_ch.indexOf('(') > 0
                ? firestoreData.away_alias_ch.split('(')[0].trim()
                : firestoreData.away_alias_ch,
            image_id: firestoreData.away_image_id
          },
          Now_clock: null,
          Summary: {
            info: {
              home: {
                Total: { points: null }
              },
              away: {
                Total: { points: null }
              }
            }
          }
        });
    } catch (err) {
      return reject(
        new AppErrors.FirebaseRealtimeError(
          `${err} at pbpESoccer of doPBP on ${firestoreData.bets_id} by DY`
        )
      );
    }
    return resolve('ok');
  });
}

module.exports = checkmatch_eSoccer;
