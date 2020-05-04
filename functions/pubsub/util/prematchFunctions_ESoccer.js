const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
const AppErrors = require('../../util/AppErrors');
module.exports.eSoccer = {};
const firebaseName = 'pagetest_eSoccer';
const Match = db.Match;
const MatchTeam = db.Team;
const leagueUniteID = '22000';
const leagueUniteName = 'eSoccer';
const sportID = 1;
const leagueArray = [22614, 22808, 22764, 22537, 22724];
module.exports.eSoccer.upcoming = async function (date) {
  return new Promise(async function (resolve, reject) {
    try {
      for (let i = 0; i < leagueArray.length; i++) {
        const leagueID = leagueArray[i];
        const URL = `https://api.betsapi.com/v2/events/upcoming?sport_id=${sportID}&token=${modules.betsToken}&league_id=${leagueID}&day=${date}`;
        const data = await axiosForUpcoming(URL);
        if (data.results) {
          for (let j = 0; j < data.results.length; j++) {
            const ele = data.results[j];
            if (ele.home.name.indexOf('Esports') !== -1) {
              ele.home.name = ele.home.name.replace('Esports', '');
            }
            if (ele.away.name.indexOf('Esports') !== -1) {
              ele.away.name = ele.away.name.replace('Esports', '');
            }
            await write2firestore(ele);
            await write2realtime(ele);
            await write2MysqlOfMatch(ele);
            await write2MysqlOfMatchTeam(ele);
          }
        } else {
          console.log(leagueID + 'has no upcoming event now');
        }
      }
      console.log('esport scheduled success');
      return resolve('ok');
    } catch (err) {
      return reject(
        new AppErrors.PrematchEsoccerError(
          `${err} at prematchFunctions_ESoccer by DY`
        )
      );
    }
  });
};
async function axiosForUpcoming(URL) {
  return new Promise(async function (resolve, reject) {
    try {
      const { data } = await modules.axios(URL);
      return resolve(data);
    } catch (err) {
      return reject(
        new AppErrors.AxiosError(`${err} at prematchFunctions_ESoccer by DY`)
      );
    }
  });
}
async function write2firestore(ele) {
  return new Promise(async function (resolve, reject) {
    try {
      await modules.firestore
        .collection(firebaseName)
        .doc(ele.id)
        .set(repackage_bets(ele), { merge: true });
      return resolve('ok');
    } catch (err) {
      return reject(
        new AppErrors.FirebaseCollectError(
          `${err} at prematchFunctions_ESoccer by DY`
        )
      );
    }
  });
}
async function write2realtime(ele) {
  return new Promise(async function (resolve, reject) {
    try {
      await modules.database
        .ref(`esports/eSoccer/${ele.id}/Summary/status`)
        .set('scheduled');
      return resolve('ok');
    } catch (err) {
      return reject(
        new AppErrors.FirebaseRealtimeError(
          `${err} at prematchFunctions_ESoccer by DY`
        )
      );
    }
  });
}
async function write2MysqlOfMatch(ele) {
  return new Promise(async function (resolve, reject) {
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
        new AppErrors.MysqlError(`${err} at prematchFunctions_ESoccer by DY`)
      );
    }
  });
}
async function write2MysqlOfMatchTeam(ele) {
  return new Promise(async function (resolve, reject) {
    try {
      const dataHomeTeam = {
        team_id: ele.home.id,
        league_id: leagueUniteID,
        sport_id: ele.sport_id,
        name: ele.home.name,
        alias: ele.home.name,
        alias_ch: ele.home.name,
        image_id: ele.home.image_id
      };
      const dataAwayTeam = {
        team_id: ele.away.id,
        league_id: leagueUniteID,
        sport_id: ele.sport_id,
        name: ele.away.name,
        alias: ele.away.name,
        alias_ch: ele.away.name,
        image_id: ele.away.image_id
      };
      await MatchTeam.upsert(dataHomeTeam);
      await MatchTeam.upsert(dataAwayTeam);
      return resolve('ok');
    } catch (err) {
      return reject(
        new AppErrors.MysqlError(`${err} at prematchFunctions_ESoccer by DY`)
      );
    }
  });
}
function repackage_bets(ele) {
  let leagueCH = '';
  switch (ele.league.id) {
    case '22614': {
      leagueCH = '足球電競之戰－8分鐘';
      break;
    }
    case '22808': {
      leagueCH = '墨西哥聯賽－12分鐘';
      break;
    }
    case '22764': {
      leagueCH = 'FUFV聯賽－12分鐘';
      break;
    }
    case '22537': {
      leagueCH = '職業聯賽－12分鐘';
      break;
    }
    case '22724': {
      leagueCH = '職業球員盃－12分鐘';
      break;
    }
    default: {
    }
  }
  let homeTeamName = '';
  let homePlayerName = '';
  let awayTeamName = '';
  let awayPlayerName = '';

  if (ele.home.name.indexOf('(') !== -1) {
    homeTeamName = ele.home.name.split('(')[0];
    homePlayerName = ele.home.name.split('(')[1].replace(')', '');
  } else {
    homeTeamName = ele.home.name;
    homePlayerName = null;
  }
  if (ele.away.name.indexOf('(') !== -1) {
    awayTeamName = ele.away.name.split('(')[0];
    awayPlayerName = ele.away.name.split('(')[1].replace(')', '');
  } else {
    awayTeamName = ele.away.name;
    awayPlayerName = null;
  }

  return {
    update_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(new Date()),
    scheduled: Number.parseInt(ele.time),
    scheduled_tw: modules.firebaseAdmin.firestore.Timestamp.fromDate(
      new Date(Number.parseInt(ele.time) * 1000)
    ),
    bets_id: ele.id,
    league: {
      ori_bets_id: ele.league.id,
      bets_id: leagueUniteID,
      name: leagueUniteName,
      name_ch: leagueCH
    },
    home: {
      name: ele.home.name,
      alias: ele.home.name,
      alias_ch: ele.home.name,
      team_name: homeTeamName,
      player_name: homePlayerName,
      image_id: ele.home.image_id,
      bets_id: ele.home.id
    },
    away: {
      name: ele.away.name,
      alias: ele.away.name,
      alias_ch: ele.away.name,
      team_name: awayTeamName,
      player_name: awayPlayerName,
      image_id: ele.away.image_id,
      bets_id: ele.away.id
    },
    flag: {
      spread: 0,
      totals: 0,
      status: 2,
      prematch: 1
    }
  };
}
