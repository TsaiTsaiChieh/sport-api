const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
const AppErrors = require('../../util/AppErrors');
const Match = db.Match;
const leagueUniteID = '347';
const sportID = 16;
module.exports.NPB = {};
module.exports.NPB.upcoming = async function(date) {
  return new Promise(async function(resolve, reject) {
    try {
      const leagueID = [347, 23292];
      for (let i = 0; i < leagueID.length; i++) {
        const URL = `https://api.betsapi.com/v2/events/upcoming?sport_id=${sportID}&token=${modules.betsToken}&league_id=${leagueID[i]}&day=${date}`;
        const data = await axiosForURL(URL);
        if (data.results) {
          for (let j = 0; j < data.results.length; j++) {
            const ele = data.results[j];
            await write2realtime(ele);
            const change = await checkTheHandicap(ele);
            await write2MysqlOfMatch(ele, change);
          }
        } else {
          console.log(leagueID[i] + 'has no upcoming event now');
        }
      }

      console.log('NPB scheduled success');
      return resolve('ok');
    } catch (err) {
      return reject(
        new AppErrors.FirebaseRealtimeError(`${err} at prematchFunctions by DY`)
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
        new AppErrors.AxiosError(`${err} at prematchFunctions_NPB by DY`)
      );
    }
  });
}
async function checkTheHandicap(ele) {
  const URL = `https://api.betsapi.com/v2/event/odds?token=${modules.betsToken}&event_id=${ele.id}&odds_market=2,3`;
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
        .ref(`baseball/NPB/${ele.id}/Summary/status`)
        .set('scheduled');
      return resolve('ok');
    } catch (err) {
      return reject(
        new AppErrors.FirebaseRealtimeError(
          `${err} at prematchFunctions_NPB by DY`
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
        new AppErrors.MysqlError(`${err} at prematchFunctions_NPB by DY`)
      );
    }
  });
}
function changeTeam(team) {
  team = team.split('Game')[0].trim();
  switch (team) {
    case 'Yomiuri Giants': {
      return '45295';
    }
    case 'Yakult Swallows': {
      return '10216';
    }
    case 'Yokohama Bay Stars': {
      return '3323';
    }
    case 'Chunichi Dragons': {
      return '3318';
    }
    case 'Hanshin Tigers': {
      return '3317';
    }
    case 'Hiroshima Carp': {
      return '3324';
    }
    case 'Nippon Ham Fighters': {
      return '10078';
    }
    case 'Rakuten Eagles': {
      return '5438';
    }
    case 'Seibu Lions': {
      return '2387';
    }
    case 'Lotte Marines': {
      return '6650';
    }
    case 'Orix Buffaloes': {
      return '8025';
    }
    case 'Softbank Hawks': {
      return '2386';
    }
  }
}
