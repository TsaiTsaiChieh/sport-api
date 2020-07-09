const modules = require('../../util/modules');
const envValues = require('../../config/env_values');
const db = require('../../util/dbUtil');
const AppErrors = require('../../util/AppErrors');
const Match = db.Match;
const leagueUniteID = '2319';
const sportID = 18;
const league = 'CBA';
const sport = 'basketball';
module.exports.CBA = {};
module.exports.CBA.upcoming = async function(date) {
  return new Promise(async function(resolve, reject) {
    try {
      const leagueID = 2319;
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
        new AppErrors.PBPKBOError(`${err} at prematchFunctions by DY`)
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
          home_id: changeTeam(ele.home.name),
          away_id: changeTeam(ele.away.name),
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
  switch (team) {
    case 'Zhejiang Golden Bulls': {
      return '60581';
    }
    case 'Zhejiang Chouzhou Bank': {
      return '60581';
    }
    case 'Zhejiang Lions': {
      return '61320';
    }
    case 'Zhejiang Guangsha Lions': {
      return '61320';
    }
    case 'Shenzhen Aviators': {
      return '302085';
    }
    case 'Sichuan Blue Whales': {
      return '193556';
    }
    case 'Tianjin Pioneers': {
      return '313609';
    }
    case 'Xinjiang Flying Tigers': {
      return '193558';
    }
    case 'Guangzhou Long-Lions': {
      return '193603';
    }
    case 'Jilin Northeast Tigers': {
      return '193557';
    }
    case 'Liaoning Flying Leopards': {
      return '193605';
    }
    case 'Nanjing Monkey King': {
      return '193555';
    }
    case 'Qingdao Eagles': {
      return '193607';
    }
    case 'Shandong Heroes': {
      return '311528';
    }
    case 'Shanghai Sharks': {
      return '49165';
    }
    case 'Beijing Royal Fighters': {
      return '310542';
    }
    case 'Beijing Ducks': {
      return '60583';
    }
    case 'Fujian Sturgeons': {
      return '193551';
    }
    case 'Guangdong Southern Tigers': {
      return '193606';
    }
    case 'Bayi Rockets': {
      return '193550';
    }
    case 'Jiangsu Dragons': {
      return '8924';
    }
    case 'Shanxi Loongs': {
      return '311032';
    }
    default: {
      return team;
    }
  }
}
