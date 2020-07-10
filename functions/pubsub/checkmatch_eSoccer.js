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
async function checkmatch_eSoccer() {
  return new Promise(async function(resolve, reject) {
    try {
      leagueID = modules.leagueCodebook(await leagueOnLivescore()).id;
      const totalData = await queryForEvents();
      let firestoreData;
      if ((await leagueOnLivescore()) === 'eSoccer') {
        // 寫到realtime
        firestoreData = await livescore(totalData);
        for (let i = 0; i < firestoreData.length; i++) {
          await modules.database
            .ref(`home_livescore/${firestoreData[i].bets_id}`)
            .set(firestoreData[i].bets_id);
          await modules.database.ref().set({
            id: firestoreData[i].bets_id,
            league: firestoreData[i].league_name_ch,
            ori_league: 'eSoccer',
            sport: modules.league2Sport(leagueID).sport,
            status: firestoreData[i].status,
            scheduled: firestoreData[i].scheduled,
            spread: {
              handicap: firestoreData[i].handicap,
              home_tw: firestoreData[i].home_tw,
              away_tw: firestoreData[i].away_tw
            },
            home: {
              teamname:
                firestoreData[i].home_alias_ch.indexOf('(') > 0
                  ? firestoreData[i].home_alias_ch.split('(')[0].trim()
                  : firestoreData[i].home_alias_ch,
              player_name:
                firestoreData[i].home_name.indexOf('(') > 0
                  ? firestoreData[i].home_name
                    .split('(')[1]
                    .replace(')', '')
                    .trim()
                  : null,
              name: firestoreData[i].home_name,
              alias: firestoreData[i].home_alias,
              alias_ch:
                firestoreData[i].home_alias_ch.indexOf('(') > 0
                  ? firestoreData[i].home_alias_ch.split('(')[0].trim()
                  : firestoreData[i].home_alias_ch,
              image_id: firestoreData[i].home_image_id
            },
            away: {
              teamname:
                firestoreData[i].away_alias_ch.indexOf('(') > 0
                  ? firestoreData[i].away_alias_ch.split('(')[0].trim()
                  : firestoreData[i].away_alias_ch,
              player_name:
                firestoreData[i].away_name.indexOf('(') > 0
                  ? firestoreData[i].away_name
                    .split('(')[1]
                    .replace(')', '')
                    .trim()
                  : null,
              name: firestoreData[i].away_name,
              alias: firestoreData[i].away_alias,
              alias_ch:
                firestoreData[i].away_alias_ch.indexOf('(') > 0
                  ? firestoreData[i].away_alias_ch.split('(')[0].trim()
                  : firestoreData[i].away_alias_ch,
              image_id: firestoreData[i].away_image_id
            }
          });
        }
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
                  `${err} at checkmatch_ESoccer by DY`
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
					WHERE (game.status = ${modules.MATCH_STATUS.SCHEDULED} OR game.status = ${modules.MATCH_STATUS.INPLAY})
						AND game.league_id = ${leagueID}
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
					WHERE (game.status = ${modules.MATCH_STATUS.SCHEDULED} OR game.status = ${modules.MATCH_STATUS.INPLAY})
								AND game.league_id = ${leagueID}
								AND game.home_id = home.team_id
								AND game.away_id = away.team_id
								AND game.spread_id is NULL	
								AND game.ori_league_id = league.ori_league_id			
					    )
			 )`,
        {
          type: db.sequelize.QueryTypes.SELECT
        }
      );
      return resolve(queries);
    } catch (err) {
      return reject(
        new AppErrors.AxiosError(`${err} at checkmatch_eSoccer by DY`)
      );
    }
  });
}
module.exports = checkmatch_eSoccer;
