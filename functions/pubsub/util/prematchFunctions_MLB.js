const modules = require('../../util/modules');
const envValues = require('../../config/env_values');
const db = require('../../util/dbUtil');
const AppErrors = require('../../util/AppErrors');
const Match = db.Match;
const leagueUniteID = '3939';
const sportID = 16;
const league = 'MLB';
const sport = 'baseball';
module.exports.MLB = {};
module.exports.MLB.upcoming = async function(date) {
  return new Promise(async function(resolve, reject) {
    try {
      const leagueID = 225;
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
    case 'LA Angels': {
      return '1090';
    }
    case 'LA Dodgers': {
      return '1369';
    }
    case 'HOU Astros': {
      return '1217';
    }
    case 'CHI Cubs': {
      return '1368';
    }
    case 'NY Yankees': {
      return '1121';
    }
    case 'WAS Nationals': {
      return '1147';
    }
    case 'CLE Indians': {
      return '1310';
    }
    case 'MIL Brewers': {
      return '1187';
    }
    case 'BOS Red Sox': {
      return '1479';
    }
    case 'SF Giants': {
      return '1353';
    }
    case 'COL Rockies': {
      return '1146';
    }
    case 'ARI Diamondbacks': {
      return '1365';
    }
    case 'CIN Reds': {
      return '1364';
    }
    case 'OAK Athletics': {
      return '1222';
    }
    case 'MIN Twins': {
      return '1088';
    }
    case 'ATL Braves': {
      return '1352';
    }
    case 'TOR Blue Jays': {
      return '1089';
    }
    case 'TB Rays': {
      return '1216';
    }
    case 'STL Cardinals': {
      return '1223';
    }
    case 'SD Padres': {
      return '1108';
    }
    case 'NY Mets': {
      return '1113';
    }
    case 'SEA Mariners': {
      return '1202';
    }
    case 'TEX Rangers': {
      return '1311';
    }
    case 'PHI Phillies': {
      return '1112';
    }
    case 'DET Tigers': {
      return '1091';
    }
    case 'PIT Pirates': {
      return '1186';
    }
    case 'KC Royals': {
      return '1478';
    }
    case 'BAL Orioles': {
      return '1120';
    }
    case 'CHI White Sox': {
      return '1203';
    }
    case 'MIA Marlins': {
      return '1109';
    }
  }
}
