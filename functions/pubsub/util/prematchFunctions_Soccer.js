const modules = require('../../util/modules');
const envValues = require('../../config/env_values');
const db = require('../../util/dbUtil');
const AppErrors = require('../../util/AppErrors');
const leagueUniteID = '8';
const sportID = 1;
const leagueArray = [
  94,
  99,
  207,
  199,
  123,
  66,
  172,
  849,
  1727,
  888,
  8910,
  1040,
  13341
];
const league = 'Soccer';
const sport = 'Soccer';
const Match = db.Match;
module.exports.Soccer = {};
module.exports.Soccer.upcoming = async function(date) {
  return new Promise(async function(resolve, reject) {
    try {
      for (let i = 0; i < leagueArray.length; i++) {
        const leagueID = leagueArray[i];
        const URL = `https://api.betsapi.com/v2/events/upcoming?sport_id=${sportID}&token=${envValues.betsToken}&league_id=${leagueID}&day=${date}`;
        const data = await axiosForURL(URL);
        if (data.results) {
          for (let j = 0; j < data.results.length; j++) {
            const ele = data.results[j];
            await write2realtime(ele);
            await write2MysqlOfMatch(ele);
          }
        } else {
          console.log(leagueID + 'has no upcoming event now');
        }
      }
      console.log('soccer scheduled success');
      return resolve('ok');
    } catch (err) {
      return reject(
        new AppErrors.MysqlError(`${err} at prematchFunctions_Soccer by DY`)
      );
    }
  });
};
async function axiosForURL(URL) {
  return new Promise(async function(resolve, reject) {
    try {
      const { data } = await modules.axios(URL);
      return resolve(data);
    } catch (err) {
      return reject(
        new AppErrors.AxiosError(`${err} at prematchFunctions_Soccer by DY`)
      );
    }
  });
}

async function write2realtime(ele) {
  return new Promise(async function(resolve, reject) {
    try {
      await modules.database
        .ref(`${sport}/${league}/${ele.id}/Summary/status`)
        .set('scheduled');
      return resolve('ok');
    } catch (err) {
      return reject(
        new AppErrors.FirebaseRealtimeError(
          `${err} at prematchFunctions_Soccer by DY`
        )
      );
    }
  });
}
async function write2MysqlOfMatch(ele) {
  return new Promise(async function(resolve, reject) {
    try {
      const dataEvent = {
        bets_id: ele.id,
        league_id: leagueUniteID,
        ori_league_id: ele.league.id,
        sport_id: ele.sport_id,
        ori_sport_id: ele.sport_id,
        home_id: ele.home.id,
        away_id: ele.away.id,
        scheduled: Number.parseInt(ele.time),
        scheduled_tw: Number.parseInt(ele.time) * 1000,
        flag_prematch: 1,
        status: 2
      };
      await Match.upsert(dataEvent);
      return resolve('ok');
    } catch (err) {
      return reject(
        new AppErrors.MysqlError(`${err} at prematchFunctions_Soccer by DY`)
      );
    }
  });
}
