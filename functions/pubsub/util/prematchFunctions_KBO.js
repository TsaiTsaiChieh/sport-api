const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
const AppErrors = require('../../util/AppErrors');
// const firebaseName = 'baseball_KBO';
const Match = db.Match;
const leagueUniteID = '349';
// const leagueUniteName = 'KBO';
const sportID = 16;
module.exports.KBO = {};
module.exports.KBO.upcoming = async function(date) {
  return new Promise(async function(resolve, reject) {
    try {
      const leagueID = 349;

      const URL = `https://api.betsapi.com/v2/events/upcoming?sport_id=${sportID}&token=${modules.betsToken}&league_id=${leagueID}&day=${date}`;
      const data = await axiosForURL(URL);
      if (data.results) {
        for (let j = 0; j < data.results.length; j++) {
          const ele = data.results[j];
          // await write2firestore(ele);
          await write2realtime(ele);
          const change = await checkTheHandicap(ele);
          await write2MysqlOfMatch(ele, change);
          // await write2MysqlOfMatchTeam(ele);
        }
      } else {
        console.log(leagueID + 'has no upcoming event now');
      }
      console.log('KBO scheduled success');
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
// async function write2firestore(ele) {
//  return new Promise(async function (resolve, reject) {
//    try {
//      await modules.firestore
//        .collection(firebaseName)
//        .doc(ele.id)
//        .set(repackage_bets(ele), { merge: true });
//      return resolve('ok');
//    } catch (err) {
//      return reject(
//        new AppErrors.FirebaseCollectError(
//          `${err} at prematchFunctions_KBO by DY`
//        )
//      );
//    }
//  });
// }
async function write2realtime(ele) {
  return new Promise(async function(resolve, reject) {
    try {
      await modules.database
        .ref(`baseball/KBO/${ele.id}/Summary/status`)
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
          home_id: ele.home.id,
          away_id: ele.away.id,
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
          home_id: ele.away.id,
          away_id: ele.home.id,
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
        new AppErrors.MysqlError(`${err} at prematchFunctions_KBO by DY`)
      );
    }
  });
}

// function repackage_bets(ele) {
//  const leagueCH = '韓國職棒';

//  return {
//    update_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(new Date()),
//    scheduled: Number.parseInt(ele.time),
//    scheduled_tw: modules.firebaseAdmin.firestore.Timestamp.fromDate(
//      new Date(Number.parseInt(ele.time) * 1000)
//    ),
//    bets_id: ele.id,
//    league: {
//      ori_bets_id: ele.league.id,
//      bets_id: leagueUniteID,
//      name: leagueUniteName,
//      name_ch: leagueCH
//    },
//    home: {
//      name: ele.home.name,
//      alias: ele.home.name,
//      alias_ch: ele.home.name,
//      image_id: ele.home.image_id,
//      bets_id: ele.home.id
//    },
//    away: {
//      name: ele.away.name,
//      alias: ele.away.name,
//      alias_ch: ele.away.name,
//      image_id: ele.away.image_id,
//      bets_id: ele.away.id
//    },
//    flag: {
//      spread: 0,
//      totals: 0,
//      status: 2,
//      prematch: 1
//    }
//  };
// }
