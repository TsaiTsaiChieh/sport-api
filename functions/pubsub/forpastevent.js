const modules = require('../util/modules');
const leagueUtil = require('../util/leagueUtil');
const db = require('../util/dbUtil');
const axios = require('axios');
const AppErrors = require('../util/AppErrors');
const envValues = require('../config/env_values');
const settleMatchesModel = require('../model/user/settleMatchesModel');
async function forpastevent() {
  return new Promise(async function(resolve, reject) {
    const unix = Date.now() / 1000;
    const date = modules.convertTimezoneFormat(unix, {
      format: 'YYYY-MM-DD 00:00:00',
      op: 'add',
      value: 0,
      unit: 'days'
    });
    const time = new Date(date);
    const ele = await queryForMatches(time.getTime() / 1000);

    // call the betsAPI
    for (let i = 0; i < ele.length; i++) {
      let data;
      const pbpURL = `https://api.betsapi.com/v1/event/view?token=${envValues.betsToken}&event_id=${ele[i].bets_id}`;
      try {
        data = await axiosForURL(pbpURL);
      } catch (err) {
        return reject(
          new AppErrors.AxiosError(
            `${err} at pbpESoccer of PBPHistory on ${ele[i].bets_id} by DY`
          )
        );
      }
      if (data.results[0]) {
        if (data.results[0].ss) {
          const homeScores = data.results[0].ss.split('-')[0];
          const awayScores = data.results[0].ss.split('-')[1];
          if (
            ele[i].league_id === '11235' ||
            ele[i].league_id === '347' ||
            ele[i].league_id === '349'
          ) {
            if (data.results[0].scores['9'].home !== '') {
              try {
                await db.Match.upsert({
                  bets_id: ele[i].bets_id,
                  home_points: awayScores,
                  away_points: homeScores,
                  status: 0
                });
                try {
                  await settleMatchesModel({
                    token: {
                      uid: '999'
                    },
                    bets_id: ele[i].bets_id
                  });
                } catch (err) {
                  return reject(
                    new AppErrors.MysqlError(
                      `${err} at forpastevent of yuhsien on ${ele[i].bets_id} by DY`
                    )
                  );
                }
              } catch (err) {
                return reject(
                  new AppErrors.MysqlError(
                    `${err} at forpastevent ${ele[i].bets_id} by DY`
                  )
                );
              }
            } else {
              try {
                await db.Match.upsert({
                  bets_id: ele[i].bets_id,
                  status: 0
                });
              } catch (err) {
                return reject(
                  new AppErrors.MysqlError(
                    `${err} at forpastevent ${ele[i].bets_id} by DY`
                  )
                );
              }
            }
          } else {
            try {
              await db.Match.upsert({
                bets_id: ele[i].bets_id,
                home_points: homeScores,
                away_points: awayScores,
                status: 0
              });
              try {
                await settleMatchesModel({
                  token: {
                    uid: '999'
                  },
                  bets_id: ele[i].bets_id
                });
              } catch (err) {
                return reject(
                  new AppErrors.MysqlError(
                    `${err} at forpastevent of yuhsien on ${ele[i].bets_id} by DY`
                  )
                );
              }
            } catch (err) {
              return reject(
                new AppErrors.MysqlError(
                  `${err} at forpastevent ${ele[i].bets_id} by DY`
                )
              );
            }
          }
        }
      }
    }

    console.log('forpastevent ok');
    resolve('ok');
  });
}

async function queryForMatches(date) {
  return new Promise(async function(resolve, reject) {
    try {
      const queries = await db.sequelize.query(
        // take 169 ms
        `(
					SELECT game.bets_id, game.league_id
					  FROM matches AS game
					 WHERE game.scheduled < '${date}'
						 AND status = ${leagueUtil.MATCH_STATUS.SCHEDULED}
						 AND home_points is NULL
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
async function axiosForURL(URL) {
  return new Promise(async function(resolve, reject) {
    try {
      const { data } = await axios(URL);
      return resolve(data);
    } catch (err) {
      return reject(new AppErrors.AxiosError(`${err} at pbp_eSoccer by DY`));
    }
  });
}
module.exports = forpastevent;
