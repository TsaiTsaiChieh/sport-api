const modules = require('../../util/modules');
const envValues = require('../../config/env_values');
const db = require('../../util/dbUtil');
const AppErrors = require('../../util/AppErrors');
const Match = db.Match;
const leagueUniteID = '349';
const sportID = 16;
const league = 'KBO';
const sport = 'baseball';
module.exports.KBO = {};
module.exports.KBO.upcoming = async function(date) {
  return new Promise(async function(resolve, reject) {
    try {
      const leagueID = 349;

      const URL = `https://api.betsapi.com/v2/events/upcoming?sport_id=${sportID}&token=${envValues.betsToken}&league_id=${leagueID}&day=${date}`;
      const data = await axiosForURL(URL);
      if (data.results) {
        for (let j = 0; j < data.results.length; j++) {
          const ele = data.results[j];
          await write2realtime(ele);
          const change = await checkTheHandicap(ele);
          await write2MysqlOfMatch(ele, change);
        }
      } else {
        console.log(leagueID + 'has no upcoming event now');
      }
      console.log(`${league} scheduled success`);
      return resolve('ok');
    } catch (err) {
      return reject(
        new AppErrors.PBPKBOError(`${err} at prematchFunctions_${league} by DY`)
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
        new AppErrors.AxiosError(`${err} at prematchFunctions_${league} by DY`)
      );
    }
  });
}
async function checkTheHandicap(ele) {
  const URL = `https://api.betsapi.com/v2/event/odds?token=${envValues.betsToken}&event_id=${ele.id}&odds_market=2,3`;
  const data = await axiosForURL(URL);
  let changeFlag = 0;
  if (data.results.odds) {
    if (data.results.odds[`${sportID}_2`]) {
      changeFlag = 1;
    }
    if (data.results.odds[`${sportID}_3`]) {
      changeFlag = 1;
    }
  }
  return changeFlag;
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
          `${err} at prematchFunctions_${league} by DY`
        )
      );
    }
  });
}
async function write2MysqlOfMatch(ele, change) {
  return new Promise(async function(resolve, reject) {
    try {
      if (change === 0) {
        const dataEvent = {
          bets_id: ele.id,
          league_id: leagueUniteID,
          ori_league_id: ele.league.id,
          sport_id: ele.sport_id,
          ori_sport_id: ele.sport_id,
          home_id: changeTeam(ele.home.name),
          away_id: changeTeam(ele.away.name),
          scheduled: Number.parseInt(ele.time),
          scheduled_tw: Number.parseInt(ele.time) * 1000,
          flag_prematch: 1,
          status: 2
        };
        await Match.upsert(dataEvent);
      } else {
        const dataEvent = {
          bets_id: ele.id,
          league_id: leagueUniteID,
          ori_league_id: ele.league.id,
          sport_id: ele.sport_id,
          ori_sport_id: ele.sport_id,
          home_id: changeTeam(ele.away.name),
          away_id: changeTeam(ele.home.name),
          scheduled: Number.parseInt(ele.time),
          scheduled_tw: Number.parseInt(ele.time) * 1000,
          flag_prematch: 1,
          status: 2
        };
        await Match.upsert(dataEvent);
      }

      return resolve('ok');
    } catch (err) {
      return reject(
        new AppErrors.MysqlError(`${err} at prematchFunctions_${league} by DY`)
      );
    }
  });
}

function changeTeam(team) {
  team = team.split('Game')[0].trim();
  switch (team) {
    case 'Lotte Giants': {
      return '2408';
    }
    case 'Samsung Lions': {
      return '3356';
    }
    case 'KIA Tigers': {
      return '4202';
    }
    case 'Kia Tigers': {
      return '4202';
    }
    case 'Doosan Bears': {
      return '2406';
    }
    case 'Hanwha Eagles': {
      return '2405';
    }
    case 'SK Wyverns': {
      return '8043';
    }
    case 'LG Twins': {
      return '2407';
    }
    case 'Kiwoom Heroes': {
      return '269103';
    }
    case 'NC Dinos': {
      return '3353';
    }
    case 'KT Wiz': {
      return '3354';
    }
  }
}
