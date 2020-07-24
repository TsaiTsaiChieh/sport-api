const modules = require('../util/modules');
const { database } = require('../util/firebaseModules');
const envValues = require('../config/env_values');
const AppErrors = require('../util/AppErrors');
const db = require('../util/dbUtil');
const settleMatchesModel = require('../model/user/settleMatchesModel');
const Match = db.Match;
const pastDays = 14; // 兩週算一次 所以兩週以前的賽事就算還是 -1 也沒關係
const pastTime = Math.floor(Date.now()) - 86400 * 1000 * pastDays;
function queryMatches() {
  return new Promise(async function(resolve, reject) {
    try {
      const unix = Date.now() / 1000;
      const date = modules.convertTimezoneFormat(unix, {
        format: 'YYYY-MM-DD 00:00:00',
        op: 'add',
        value: 0,
        unit: 'days'
      });
      const time = new Date(date);

      const queries = await db.sequelize.query(
        // take 169 ms
        `(
          SELECT game.bets_id AS bets_id, game.status AS status, game.league_id AS league_id, game.scheduled AS scheduled      
            FROM matches AS game   
					 WHERE (game.status = '${modules.MATCH_STATUS.ABNORMAL}' OR game.status = '-2')
					   AND game.scheduled < ${time.getTime() / 1000} 
        )`,
        {
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      return resolve(queries);
    } catch (err) {
      return reject(`${err.stack} by DY`);
    }
  });
}

async function checkmatch_abnormal() {
  return new Promise(async function(resolve, reject) {
    try {
      const totalData = await queryMatches();

      for (let j = 0; j < totalData.length; j++) {
        if (totalData[j].scheduled * 1000 < pastTime) {
          await db.Match.upsert({
            bets_id: totalData[j].bets_id,
            status: 0
          });
          continue;
        }
        const betsID = totalData[j].bets_id;
        const leagueID = totalData[j].league_id;
        const pbpURL = `https://api.betsapi.com/v1/event/view?token=${envValues.betsToken}&event_id=${betsID}`;
        const parameterPBP = {
          betsID: betsID,
          pbpURL: pbpURL,
          leagueID: leagueID
        };
        await doPBP(parameterPBP);
      }
    } catch (err) {
      return reject(
        new AppErrors.FirebaseCollectError(
          `${err} at checkmatch_abnormal by DY`
        )
      );
    }
    return resolve('ok');
  });
}

async function axiosForURL(URL) {
  return new Promise(async function(resolve, reject) {
    try {
      const { data } = await modules.axios(URL);
      return resolve(data);
    } catch (err) {
      return reject(
        new AppErrors.AxiosError(`${err} at checkmatch_abnormal by DY`)
      );
    }
  });
}

async function doPBP(parameter) {
  return new Promise(async function(resolve, reject) {
    const betsID = parameter.betsID;
    const pbpURL = parameter.pbpURL;
    const leagueName = modules.leagueDecoder(parameter.leagueID);
    const sportName = modules.league2Sport(leagueName).sport;

    try {
      const data = await axiosForURL(pbpURL);
      if (data.results.length > 0) {
        if (data.results[0]) {
          if (data.results[0].time_status) {
            if (data.results[0].time_status === '5') {
              try {
                await database
                  .ref(`${sportName}/${leagueName}/${betsID}/Summary/status`)
                  .set('cancelled');
              } catch (err) {
                return reject(
                  new AppErrors.FirebaseCollectError(
                    `${err} at checkmatch_abnormal of status on ${betsID} by DY`
                  )
                );
              }
              try {
                await Match.upsert({
                  bets_id: betsID,
                  status: -3
                });
              } catch (err) {
                return reject(
                  new AppErrors.MysqlError(
                    `${err} at checkmatch_abnormal of Match on ${betsID} by DY`
                  )
                );
              }
            }
            if (data.results[0].time_status === '4') {
              try {
                await database
                  .ref(`${sportName}/${leagueName}/${betsID}/Summary/status`)
                  .set('postponed');
              } catch (err) {
                return reject(
                  new AppErrors.FirebaseCollectError(
                    `${err} at doPBP of status on ${betsID} by DY`
                  )
                );
              }
              try {
                await Match.upsert({
                  bets_id: betsID,
                  status: -2
                });
              } catch (err) {
                return reject(
                  new AppErrors.MysqlError(
                    `${err} at doPBP of Match on ${betsID} by DY`
                  )
                );
              }
            }
            if (data.results[0].time_status === '3') {
              try {
                const parameterHistory = {
                  betsID: betsID,
                  sportName: sportName,
                  leagueName: leagueName,
                  data: data
                };
                await pbpHistory(parameterHistory);
              } catch (err) {
                return reject(
                  new AppErrors.PBPAbnormalError(
                    `${err} at pbpHistory on ${betsID} by DY`
                  )
                );
              }
            }

            if (data.results[0].time_status === '2') {
              console.log(`${betsID} status is still -1`);
            }
            if (data.results[0].time_status === '1') {
              try {
                await database
                  .ref(`${sportName}/${leagueName}/${betsID}/Summary/status`)
                  .set('inprogress');
              } catch (err) {
                return reject(
                  new AppErrors.FirebaseRealtimeError(
                    `${err} at doPBP of status on ${betsID} by DY`
                  )
                );
              }
              try {
                await Match.upsert({
                  bets_id: betsID,
                  status: 1
                });
              } catch (err) {
                return reject(
                  new AppErrors.MysqlError(
                    `${err} at doPBP of status on ${betsID} by DY`
                  )
                );
              }

              try {
                await database
                  .ref(`${sportName}/${leagueName}/${betsID}/Summary/league`)
                  .set({
                    name: data.results[0].league.name,
                    id: data.results[0].league.id
                  });
              } catch (err) {
                return reject(
                  new AppErrors.FirebaseRealtimeError(
                    `${err} at doPBP of league on ${betsID} by DY`
                  )
                );
              }
            }
            if (data.results[0].time_status === '0') {
              console.log(`${betsID} status is still -1`);
            }
            // 即時比分
          }
        }
      }
    } catch (err) {
      return reject(
        new AppErrors.PBPAbnormalError(
          `${err} at checkmatch_abnormal of doPBP on ${betsID} by DY`
        )
      );
    }
    return resolve('ok');
  });
}

async function pbpHistory(parameterHistory) {
  return new Promise(async function(resolve, reject) {
    let data = parameterHistory.data;
    const betsID = parameterHistory.betsID;
    const sportName = parameterHistory.sportName;
    const leagueName = parameterHistory.leagueName;

    let realtimeData;
    let homeScores = 'no data';
    let awayScores = 'no data';
    if (leagueName === 'eSoccer') {
      if (!data.results[0].ss) {
        realtimeData = await database
          .ref(`${sportName}/${leagueName}/${betsID}`)
          .once('value');
        realtimeData = realtimeData.val();
        data = realtimeData;
        data.results[0].ss = 'no data';
        if (!realtimeData.Summary.info.home.Total.points) {
          homeScores = -99;
          awayScores = -99;
        } else {
          homeScores = realtimeData.Summary.info.home.Total.points;
          awayScores = realtimeData.Summary.info.away.Total.points;
        }
      } else {
        homeScores = data.results[0].ss.split('-')[0];
        awayScores = data.results[0].ss.split('-')[1];
      }
      if (!data.results[0].timer) {
        data.results[0].timer = { tm: 'xx', ts: 'xx' };
      }

      if (!data.results[0].stats) {
        data.results[0].stats = {};
      }
      if (!data.results[0].stats.attacks) {
        data.results[0].stats.attacks = ['no data', 'no data'];
      }
      if (!data.results[0].stats.ball_safe) {
        data.results[0].stats.ball_safe = ['no data', 'no data'];
      }
      if (!data.results[0].stats.corners) {
        data.results[0].stats.corners = ['no data', 'no data'];
      }
      if (!data.results[0].stats.dangerous_attacks) {
        data.results[0].stats.dangerous_attacks = ['no data', 'no data'];
      }
      if (!data.results[0].stats.goals) {
        data.results[0].stats.goals = ['no data', 'no data'];
      }
      if (!data.results[0].stats.off_target) {
        data.results[0].stats.off_target = ['no data', 'no data'];
      }
      if (!data.results[0].stats.on_target) {
        data.results[0].stats.on_target = ['no data', 'no data'];
      }
      if (!data.results[0].stats.yellowcards) {
        data.results[0].stats.yellowcards = ['no data', 'no data'];
      }
      if (!data.results[0].stats.redcards) {
        data.results[0].stats.redcards = ['no data', 'no data'];
      }
      try {
        await database
          .ref(`${sportName}/${leagueName}/${betsID}/Summary/info`)
          .set({
            home: { Total: { points: data.results[0].ss.split('-')[0] } },
            away: { Total: { points: data.results[0].ss.split('-')[1] } }
          });
      } catch (err) {
        return reject(
          new AppErrors.FirebaseRealtimeError(
            `${err} at doPBP of status on ${betsID} by DY`
          )
        );
      }
    }

    if (leagueName === 'KBO' || leagueName === 'CPBL' || leagueName === 'NPB') {
      if (!data.results[0].ss) {
        realtimeData = await database
          .ref(`${sportName}/${leagueName}/${betsID}`)
          .once('value');
        realtimeData = realtimeData.val();
        data = realtimeData;
        data.results[0].ss = 'no data';
        if (!realtimeData.Summary.info.home.Total.points) {
          homeScores = -99;
          awayScores = -99;
        } else {
          homeScores = realtimeData.Summary.info.home.Total.points;
          awayScores = realtimeData.Summary.info.away.Total.points;
        }
      } else {
        homeScores = data.results[0].ss.split('-')[0];
        awayScores = data.results[0].ss.split('-')[1];
      }
      try {
        await database
          .ref(
            `${sportName}/${leagueName}/${betsID}/Summary/info/home/Total/points`
          )
          .set(data.results[0].ss.split('-')[1]);
        await database
          .ref(
            `${sportName}/${leagueName}/${betsID}/Summary/info/away/Total/points`
          )
          .set(data.results[0].ss.split('-')[0]);
        for (let inningCount = 1; inningCount < 10; inningCount++) {
          await database
            .ref(
              `${sportName}/${leagueName}/${betsID}/Summary/info/home/Innings${inningCount}/scoring/runs`
            )
            .set(data.results[0].scores[`${inningCount}`].away);
          await database
            .ref(
              `${sportName}/${leagueName}/${betsID}/Summary/info/away/Innings${inningCount}/scoring/runs`
            )
            .set(data.results[0].scores[`${inningCount}`].home);
        }
      } catch (err) {
        return reject(
          new AppErrors.FirebaseRealtimeError(
            `${err} at abnormal on ${betsID} by DY`
          )
        );
      }
      try {
        await Match.upsert({
          bets_id: betsID,
          home_points: awayScores,
          away_points: homeScores,
          status: 0
        });
      } catch (err) {
        return reject(
          new AppErrors.MysqlError(
            `${err} at pbpESoccer of Match on ${betsID} by DY`
          )
        );
      }
    } else if (leagueName === 'CBA') {
      try {
        if (data.results[0].timer) {
          await database
            .ref(`${sportName}/${leagueName}/${betsID}/Summary/Now_clock`)
            .set(`${data.results[0].timer.tm}:${data.results[0].timer.ts}`);
          await database
            .ref(`${sportName}/${leagueName}/${betsID}/Summary/Now_periods`)
            .set(`${data.results[0].timer.q - 1}`);
          await database
            .ref(
              `${sportName}/${leagueName}/${betsID}/Summary/info/home/periods${data.results[0].timer.q}/points`
            )
            .set(`${data.results[0].scores[data.results[0].timer.q].home}`);
          await database
            .ref(
              `${sportName}/${leagueName}/${betsID}/Summary/info/away/periods${data.results[0].timer.q}/points`
            )
            .set(`${data.results[0].scores[data.results[0].timer.q].away}`);
        } else {
          await database
            .ref(`${sportName}/${leagueName}/${betsID}/Summary/Now_clock`)
            .set('xx:xx');
        }
        await database
          .ref(
            `${sportName}/${leagueName}/${betsID}/Summary/info/home/Total/points`
          )
          .set(data.results[0].ss.split('-')[0]);
        await database
          .ref(
            `${sportName}/${leagueName}/${betsID}/Summary/info/away/Total/points`
          )
          .set(data.results[0].ss.split('-')[1]);
      } catch (err) {
        return reject(
          new AppErrors.FirebaseRealtimeError(
            `${err} at doPBP of status on ${betsID} by DY`
          )
        );
      }
      try {
        await Match.upsert({
          bets_id: betsID,
          home_points: homeScores,
          away_points: awayScores,
          status: 0
        });
      } catch (err) {
        return reject(
          new AppErrors.MysqlError(
            `${err} at abnormal of Match on ${betsID} by DY`
          )
        );
      }
    } else {
      if (!data.results[0].ss) {
        realtimeData = await database
          .ref(`${sportName}/${leagueName}/${betsID}`)
          .once('value');
        realtimeData = realtimeData.val();
        data = realtimeData;
        data.results[0].ss = 'no data';
        if (!realtimeData.Summary.info.home.Total.points) {
          homeScores = -99;
          awayScores = -99;
        } else {
          homeScores = realtimeData.Summary.info.home.Total.points;
          awayScores = realtimeData.Summary.info.away.Total.points;
        }
      } else {
        homeScores = data.results[0].ss.split('-')[0];
        awayScores = data.results[0].ss.split('-')[1];
      }
      try {
        await database
          .ref(`${sportName}/${leagueName}/${betsID}/Summary/info`)
          .set({
            home: { Total: { points: data.results[0].ss.split('-')[0] } },
            away: { Total: { points: data.results[0].ss.split('-')[1] } }
          });
      } catch (err) {
        return reject(
          new AppErrors.FirebaseRealtimeError(
            `${err} at doPBP of status on ${betsID} by DY`
          )
        );
      }
      try {
        await Match.upsert({
          bets_id: betsID,
          home_points: homeScores,
          away_points: awayScores,
          status: 0
        });
      } catch (err) {
        return reject(
          new AppErrors.MysqlError(
            `${err} at abnormal of Match on ${betsID} by DY`
          )
        );
      }
    }

    try {
      await database
        .ref(`${sportName}/${leagueName}/${betsID}/Summary/status`)
        .set('closed');
    } catch (err) {
      return reject(
        new AppErrors.FirebaseRealtimeError(
          `${err} at abnormal of status on ${betsID} by DY`
        )
      );
    }
    try {
      await settleMatchesModel({
        token: {
          uid: '999'
        },
        bets_id: betsID
      });
    } catch (err) {
      console.log(
        'Error in pubsub/abnormal on YuHsien by DY:  %o : %o',
        err,
        betsID
      );
      return reject(
        new AppErrors.PBPAbnormalError(`${err} at pbpHistory of yuhsien by DY`)
      );
    }

    return resolve('ok');
  });
}
module.exports = checkmatch_abnormal;
