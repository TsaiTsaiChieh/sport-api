const axios = require('axios');
const firebaseAdmin = require('../../util/firebaseUtil');
const envValues = require('../../config/env_values');
const db = require('../../util/dbUtil');
const AppErrors = require('../../util/AppErrors');
const Match = db.Match;
const leagueUniteID = '2274';
const sportID = 18;
const league = 'NBA';
const sport = 'basketball';
module.exports.NBA = {};
module.exports.NBA.upcoming = async function(date) {
  return new Promise(async function(resolve, reject) {
    try {
      const leagueID = 2274;
      const URL = `https://api.betsapi.com/v2/events/upcoming?sport_id=${sportID}&token=${envValues.betsToken}&league_id=${leagueID}&day=${date}`;
      const data = await axiosForURL(URL);
      if (data.results) {
        for (let j = 0; j < data.results.length; j++) {
          const ele = data.results[j];
          await write2realtime(ele, 'scheduled');
          const change = await checkTheHandicap(ele);
          await write2MysqlOfMatch(ele, change, 2);
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

module.exports.NBA.ended = async function(date) {
  return new Promise(async function(resolve, reject) {
    try {
      const leagueID = 2274;
      const URL = `https://api.betsapi.com/v2/events/ended?sport_id=${sportID}&token=${envValues.betsToken}&league_id=${leagueID}&day=${date}`;
      const data = await axiosForURL(URL);
      if (data.results) {
        for (let j = 0; j < data.results.length; j++) {
          const ele = data.results[j];
          await write2realtime(ele, 'postponed');
          const change = await checkTheHandicap(ele);
          await write2MysqlOfMatch(ele, change, -2);
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
      const { data } = await axios(URL);
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
  let changeFlag = 1;
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

async function write2realtime(ele, status) {
  return new Promise(async function(resolve, reject) {
    try {
      const database = firebaseAdmin().database();
      database
        .ref(`${sport}/${league}/${ele.id}/Summary/status`)
        .set(status);
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

async function write2MysqlOfMatch(ele, change, status) {
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
          status: status
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
          status: status
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
    case 'CLE Cavaliers': {
      return '55277';
    }
    case 'PHI 76ers': {
      return '53954';
    }
    case 'MIA Heat': {
      return '57721';
    }
    case 'CHI Bulls': {
      return '52914';
    }
    case 'DET Pistons': {
      return '56737';
    }
    case 'CHA Hornets': {
      return '58265';
    }
    case 'BKN Nets': {
      return '54759';
    }
    case 'ORL Magic': {
      return '56088';
    }
    case 'MIL Bucks': {
      return '52913';
    }
    case 'NY Knicks': {
      return '54760';
    }
    case 'ATL Hawks': {
      return '55278';
    }
    case 'BOS Celtics': {
      return '56280';
    }
    case 'TOR Raptors': {
      return '53768';
    }
    case 'IND Pacers': {
      return '54763';
    }
    case 'WAS Wizards': {
      return '53953';
    }
    case 'HOU Rockets': {
      return '52640';
    }
    case 'GS Warriors': {
      return '53390';
    }
    case 'MEM Grizzlies': {
      return '58056';
    }
    case 'LA Lakers': {
      return '54379';
    }
    case 'SAC Kings': {
      return '55290';
    }
    case 'SA Spurs': {
      return '56087';
    }
    case 'POR Trail Blazers': {
      return '55868';
    }
    case 'MIN Timberwolves': {
      return '58057';
    }
    case 'LA Clippers': {
      return '53389';
    }
    case 'NO Pelicans': {
      return '54878';
    }
    case 'DAL Mavericks': {
      return '58479';
    }
    case 'PHX Suns': {
      return '56107';
    }
    case 'UTA Jazz': {
      return '55289';
    }
    case 'OKC Thunder': {
      return '52891';
    }
    case 'DEN Nuggets': {
      return '54278';
    }
    default: {
      return team;
    }
  }
}
