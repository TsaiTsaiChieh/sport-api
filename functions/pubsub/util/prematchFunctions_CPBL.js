const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
const AppErrors = require('../../util/AppErrors');
const firebaseName = 'baseball_CPBL';
const Match = db.Match;
const leagueUniteID = '11235';
const leagueUniteName = 'CPBL';
const sportID = 16;
module.exports.CPBL = {};
module.exports.CPBL.upcoming = async function(date) {
  return new Promise(async function(resolve, reject) {
    try {
      const leagueID = 11235;
      const URL = `https://api.betsapi.com/v2/events/upcoming?sport_id=${sportID}&token=${modules.betsToken}&league_id=${leagueID}&day=${date}`;
      const data = await axiosForURL(URL);
      if (data.results) {
        for (let j = 0; j < data.results.length; j++) {
          const ele = data.results[j];
          await write2firestore(ele);
          await write2realtime(ele);
          await write2MysqlOfMatch(ele);
          // await write2MysqlOfMatchTeam(ele);
        }
      } else {
        console.log(leagueID + 'has no upcoming event now');
      }
      console.log('CPBL scheduled success');
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
        new AppErrors.AxiosError(`${err} at prematchFunctions_KBO by DY`)
      );
    }
  });
}

async function write2firestore(ele) {
  return new Promise(async function(resolve, reject) {
    try {
      await modules.firestore
        .collection(firebaseName)
        .doc(ele.id)
        .set(repackage_bets(ele), { merge: true });
      return resolve('ok');
    } catch (err) {
      return reject(
        new AppErrors.FirebaseCollectError(
          `${err} at prematchFunctions_KBO by DY`
        )
      );
    }
  });
}
async function write2realtime(ele) {
  return new Promise(async function(resolve, reject) {
    try {
      await modules.database
        .ref(`baseball/CPBL/${ele.id}/Summary/status`)
        .set('scheduled');
      return resolve('ok');
    } catch (err) {
      return reject(
        new AppErrors.FirebaseRealtimeError(
          `${err} at prematchFunctions_KBO by DY`
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
        new AppErrors.MysqlError(`${err} at prematchFunctions_KBO by DY`)
      );
    }
  });
}

function repackage_bets(ele) {
  const leagueCH = '中華職棒';

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
      image_id: ele.home.image_id,
      bets_id: ele.home.id
    },
    away: {
      name: ele.away.name,
      alias: ele.away.name,
      alias_ch: ele.away.name,
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
