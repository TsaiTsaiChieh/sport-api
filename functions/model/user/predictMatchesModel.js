const modules = require('../../util/modules');

function predictMatches(args) {
  return new Promise(async function(resolve, reject) {
    // 有無賽事 ID，檢查是否可以下注了（且時間必須在 scheduled 前），盤口 ID 是否是最新的
    const sieves = await checkMatch(args);
    if (sieves.needed.length) {
      try {
        const results = await insertFirestore(args, sieves.needed);
        if (results) {
          if (!sieves.failed.length) {
            resolve(repackageReturnDate(sieves));
            return;
          }
          if (sieves.failed.length) {
            reject({ code: 485, error: repackageReturnDate(sieves) });
            return;
          }
        }
      } catch (err) {
        console.error(
          'Error in model/user/predictMatchesModel/predictMatches function by TsaiChieh',
          err
        );
        reject({ code: 500, error: err });
        return;
      }
    }
    if (!sieves.needed.length) {
      reject({ code: 485, error: repackageReturnDate(sieves) });
      return;
    }
  });
}

function repackageReturnDate(sieves) {
  sieves.success = [];
  for (let i = 0; i < sieves.needed.length; i++) {
    const ele = sieves.needed[i];
    delete ele.handicap;
    sieves.success.push(ele);
  }
  delete sieves.needed;
  return sieves;
}
async function insertFirestore(args, needed) {
  const results = [];
  for (let i = 0; i < needed.length; i++) {
    const ele = needed[i];
    results.push(
      modules.addDataInCollectionWithId(
        modules.leagueCodebook(args.league).prediction,
        `${ele.id}_${args.token.uid}`,
        repackagePrediction(args, ele)
      )
    );
  }
  return await Promise.all(results);
}

function repackagePrediction(args, ele) {
  const data = {
    bets_id: ele.id,
    uid: args.token.uid,
    insert_time: modules.firebaseTimestamp(args.now)
  };
  if (ele.spread) {
    data.spread = {
      predict: ele.spread[1],
      handicap_id: ele.spread[0],
      handicap: ele.handicap,
      chip: ele.spread[2],
      update_time: Date.now()
    };
  }
  if (ele.totals) {
    data.totals = {
      predict: ele.totals[1],
      handicap_id: ele.totals[0],
      handicap: ele.handicap,
      chip: ele.totals[2],
      update_time: Date.now()
    };
  }
  return data;
}
// 檢查有無此賽事 ID
async function checkMatch(args) {
  const needed = [];
  const failed = [];
  for (let i = 0; i < args.matches.length; i++) {
    const ele = args.matches[i];
    // eslint-disable-next-line no-await-in-loop
    const matchSnapshot = await modules.getSnapshot(
      modules.leagueCodebook(args.league).match,
      ele.id
    );

    if (!matchSnapshot.exists) {
      ele.code = 404;
      ele.error = `Match id: ${ele.id} not found`;
      failed.push(ele);
    }
    if (matchSnapshot.exists) {
      const match = matchSnapshot.data();
      if (isScheduled(args.now, match.scheduled._seconds)) {
        // spread
        if (ele.spread) {
          if (isHandicap(match.flag.spread)) {
            if (checkHandicap(match.spread, ele.spread[0])) {
              ele.handicap = match.spread[ele.spread[0]].handicap;
              needed.push(ele);
            }
            if (!checkHandicap(match.spread, ele.spread[0])) {
              ele.code = 409;
              ele.error = `Spread id: ${ele.spread[0]} already updated, conflict with the newest`;
              failed.push(ele);
            }
          }
          if (!isHandicap(match.flag.spread)) {
            ele.code = 405;
            ele.error = `Spread id: ${ele.spread[0]} OTB, not allowed`;
            failed.push(ele);
          }
        }
        // totals
        if (ele.totals) {
          if (isHandicap(match.flag.totals)) {
            if (checkHandicap(match.totals, ele.totals[0])) {
              ele.handicap = match.totals[ele.totals[0]].handicap;
              needed.push(ele);
            }
            if (!checkHandicap(match.totals, ele.totals[0])) {
              ele.code = 409;
              ele.error = `Totals id: ${ele.totals[0]} already updated, conflict with the newest`;
              failed.push(ele);
            }
          }
          if (!isHandicap(match.flag.totals)) {
            ele.code = 405;
            ele.error = `Totals id: ${ele.totals[0]} OTB, not allowed`;
            failed.push(ele);
          }
        }
      }
      if (!isScheduled(args.now, matchSnapshot.data().scheduled._seconds)) {
        ele.code = 406;
        ele.error = `The Match id: ${ele.id} already start, not acceptable`;
        failed.push(ele);
      }
    }
  }
  return { needed, failed };
}
// 檢查是否為未來賽事
function isScheduled(now, scheduled) {
  return now < scheduled * 1000 ? true : false;
}
// 檢查盤口是否可下注
function isHandicap(flag) {
  return flag === 1 ? true : false;
}

// 檢查盤口 ID 是否有效
function checkHandicap(data, id) {
  return id === newestHandicap(data) ? true : false;
}

function newestHandicap(handicap) {
  const keys = [];
  const times = [];
  for (const key in handicap) {
    keys.push(key);
    times.push(handicap[key].add_time);
  }
  return sortTime(keys, times);
}

function sortTime(keys, times) {
  return keys[times.indexOf(Math.max(...times))];
}
module.exports = predictMatches;
