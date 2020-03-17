const modules = require('../../util/modules');

function predictMatches(args) {
  return new Promise(async function(resolve, reject) {
    // 有無賽事 ID，檢查是否可以下注了（且時間必須在 scheduled 前），盤口 ID 是否是最新的
    const results = await checkMatch(args);
    // if (results.needed.length) {
    //   checkHandicap(results.needed);
    // }
    resolve(checkMatch(args));
  });
}

// 檢查有無此賽事 ID
async function checkMatch(args) {
  const needed = [];
  const failed = [];
  for (let i = 0; i < args.matches.length; i++) {
    const ele = args.matches[i];
    // eslint-disable-next-line no-await-in-loop
    const matchSnapshot = await modules.getSnapshot(
      modules.leagueCodebook(args.league),
      ele.id
    );

    if (!matchSnapshot.exists) {
      failed.push(ele);
    } else {
      if (isScheduled(args.now, matchSnapshot.data().scheduled._seconds)) {
        if (ele.spread) {
          if (isHandicap(matchSnapshot.data().flag.spread)) {
            if (checkHandicap(matchSnapshot.data().spread, ele.spread[0])) {
              needed.push({ id: ele.id, spread: ele.spread });
            } else {
              failed.push({ id: ele.id, spread: ele.spread });
            }
          } else failed.push({ id: ele.id, spread: ele.spread });
        }
        if (ele.totals) {
          if (isHandicap(matchSnapshot.data().flag.totals)) {
            if (checkHandicap(matchSnapshot.data().totals, ele.totals[0])) {
              needed.push({ id: ele.id, totals: ele.totals });
            } else {
              failed.push({ id: ele.id, totals: ele.totals });
            }
          } else failed.push({ id: ele.id, totals: ele.totals });
        }
      } else {
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
