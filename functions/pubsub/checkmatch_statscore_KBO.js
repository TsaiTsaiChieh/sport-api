const modules = require('../util/modules');
const leagueUtil = require('../util/leagueUtil');
const firebaseAdmin = require('../util/firebaseUtil');
const database = firebaseAdmin().database();
const AppErrors = require('../util/AppErrors');
const KBOpbp = require('./pbp_statscore_KBO');
const KBOpbpInplay = KBOpbp.KBOpbpInplay;
const KBOpbpHistory = KBOpbp.KBOpbpHistory;
const db = require('../util/dbUtil');
const leagueOnLivescore = require('../model/home/leagueOnLivescoreModel');
const pbpOnHome = require('../model/home/pbpOnHomeModel');
const Match = db.Match;
const sport = 'baseball';
const league = 'KBO';
const leagueID = leagueUtil.leagueCodebook(league).id;

async function checkmatch_statscore_KBO() {
  return new Promise(async function(resolve, reject) {
    try {
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
        value: -1,
        unit: 'days'
      });
      const totalData = await queryForEvents(date1, date2);
      const leagueName = await leagueOnLivescore();
      let firestoreData = null;
      if (leagueName === league) {
        firestoreData = await pbpOnHome.matchesOnHome(totalData, league);
      }
      for (let i = 0; i < totalData.length; i++) {
        const betsID = totalData[i].bets_id;
        const statscoreID = totalData[i].statscore_id;
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
                await database
                  .ref(`${sport}/${league}/${betsID}/Summary/status`)
                  .set('inprogress');

                const parameter = {
                  betsID: betsID,
                  statscoreID: statscoreID,
                  first: 1
                };
                await KBOpbpInplay(parameter, firestoreData);
              } catch (err) {
                return reject(
                  new AppErrors.MysqlError(
                    `${err} at checkmatch_statscore_KBO by DY`
                  )
                );
              }
            } else {
              try {
                await database
                  .ref(`${sport}/${league}/${betsID}/Summary/status`)
                  .set('scheduled');
              } catch (err) {
                return reject(
                  new AppErrors.MysqlError(
                    `${err} at checkmatch_statscore_KBO by DY`
                  )
                );
              }
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
                  statscoreID: statscoreID,
                  first: 0
                };
                await KBOpbpInplay(parameter, firestoreData);
              }

              if (realtimeData.Summary.status === 'closed') {
                const parameter = {
                  betsID: betsID,
                  statscoreID: statscoreID
                };
                await KBOpbpHistory(parameter);
              }
            } catch (err) {
              return reject(
                new AppErrors.FirebaseCollectError(
                  `${err} checkmatch_statscore_KBO by DY`
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
        new AppErrors.FirebaseCollectError(
          `${err} at checkmatch_statscore_KBO by DY`
        )
      );
    }
    return resolve('ok');
  });
}

async function queryForEvents(date1, date2) {
  return new Promise(async function(resolve, reject) {
    try {
      const queries = await db.sequelize.query(
        `
				 SELECT game.bets_id AS bets_id, game.scheduled AS scheduled, game.status AS status, game.league_id AS league_id, game.radar_id AS statscore_id,
				 home.name AS home_name,home.alias_ch AS home_alias_ch,home.image_id AS home_image_id, home.alias AS home_alias, home.team_id AS home_team_id,
				 away.name AS away_name,away.alias_ch AS away_alias_ch,away.image_id AS away_image_id, away.alias AS away_alias, away.team_id AS away_team_id,
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
						AND game.scheduled BETWEEN UNIX_TIMESTAMP('${date1}') AND UNIX_TIMESTAMP('${date2}')
					UNION(
				 SELECT game.bets_id AS bets_id, game.scheduled AS scheduled, game.status AS status, game.league_id AS league_id, game.radar_id AS statscore_id,
				 home.name AS home_name,home.alias_ch AS home_alias_ch,home.image_id AS home_image_id, home.alias AS home_alias, home.team_id AS home_team_id,
				 away.name AS away_name,away.alias_ch AS away_alias_ch,away.image_id AS away_image_id, away.alias AS away_alias, away.team_id AS away_team_id,
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
								AND game.scheduled BETWEEN UNIX_TIMESTAMP('${date1}') AND UNIX_TIMESTAMP('${date2}')			
					    )
			 `,
        {
          type: db.sequelize.QueryTypes.SELECT
        }
      );
      return resolve(queries);
    } catch (err) {
      return reject(
        new AppErrors.MysqlError(`${err} at checkmatch_statscore_KBO by DY`)
      );
    }
  });
}

module.exports = checkmatch_statscore_KBO;
