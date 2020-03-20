const modules = require('../../util/modules');

function predictMatches(args) {
  return new Promise(async function(resolve, reject) {
    // 有無賽事 ID，檢查是否可以下注了（且時間必須在 scheduled 前），盤口 ID 是否是最新的
    try {
      // 檢查此使用者身份
      const userStatus = await getUserStatus(args);
      args.userStatus = userStatus;
      if (!checkNormalUserSell(args)) {
        reject({ code: 405, error: 'Normal user could not sell' });
        return;
      }

      // 檢查一般玩家想賣牌
      const sieves = await checkMatches(args);
      if (sieves.needed.length) {
        try {
          const results = await insertFirestore(args, sieves.needed);
          if (results) {
            if (!sieves.failed.length) {
              resolve(repackageReturnDate(sieves));
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
    } catch (err) {
      reject({ code: err.code, error: err });
      return;
    }
  });
}

function repackageReturnDate(sieves) {
  sieves.success = [];
  for (let i = 0; i < sieves.needed.length; i++) {
    const ele = sieves.needed[i];
    delete ele.handicap;
    delete ele.scheduled;
    sieves.success.push(ele);
  }
  delete sieves.needed;

  return sieves;
}
async function insertFirestore(args, needed) {
  const results = [];
  for (let i = 0; i < needed.length; i++) {
    const ele = needed[i];
    const date = modules
      .moment(ele.scheduled * 1000)
      .utcOffset(8)
      .format('MMDDYYYY');

    results.push(
      modules.addDataInCollectionWithId(
        modules.leagueCodebook(args.league).prediction,
        `${date}_${args.token.uid}`,
        repackagePrediction(args, ele)
      )
    );
  }
  return await Promise.all(results);
}

function repackagePrediction(args, ele) {
  const data = {
    uid: args.token.uid,
    league: args.league,
    user_status: args.userStatus,
    sell: args.sell,
    matches: {}
  };
  data.matches[ele.id] = ele.scheduled;
  if (ele.spread) {
    data.matches[ele.id] = {
      spread: {
        predict: ele.spread[1],
        handicap_id: ele.spread[0],
        handicap: ele.handicap,
        bets: ele.spread[2],
        update_time: Date.now()
      }
    };
  }
  if (ele.totals) {
    data.matches[ele.id] = {
      totals: {
        predict: ele.totals[1],
        handicap_id: ele.totals[0],
        handicap: ele.handicap,
        bets: ele.totals[2],
        update_time: Date.now()
      }
    };
  }
  return data;
}
// 檢查有無此賽事 ID
async function checkMatches(args) {
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
        // eslint-disable-next-line no-await-in-loop
        const predictions = await getPredictions(args, match);
        // spread
        if (ele.spread) {
          if (isHandicap(match.flag.spread)) {
            if (checkHandicap(match.spread, ele.spread[0])) {
              // 檢查大神有無新增過此賽事
              // eslint-disable-next-line no-await-in-loop
              if (await checkGodInsert(args, predictions, ele)) {
                // 檢查大神再次送出的牌是否和當初販售狀態一致
                if (checkGodSellFlag(args, predictions)) {
                  // append match information
                  ele.handicap = match.spread[ele.spread[0]].handicap;
                  ele.scheduled = match.scheduled._seconds;
                  needed.push(ele);
                }
                if (!checkGodSellFlag(args, predictions)) {
                  ele.code = 409;
                  failed.push(ele);
                  if (args.sell === 0) ele.error = 'Can not be changed to free';
                  if (args.sell === 1) ele.error = 'Can not be changed to sell';
                }
              }
              // eslint-disable-next-line no-await-in-loop
              if (!(await checkGodInsert(args, predictions, ele))) {
                ele.code = 423;
                ele.error = `Spread id: ${ele.spread[0]} already exist, locked`;
                failed.push(ele);
              }
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
              // 檢查大神有無新增過此賽事
              // eslint-disable-next-line no-await-in-loop
              if (await checkGodInsert(args, predictions, ele)) {
                // 檢查大神再次送出的牌是否和當初販售狀態一致
                if (checkGodSellFlag(args, predictions)) {
                  // append match information
                  ele.handicap = match.totals[ele.totals[0]].handicap;
                  ele.scheduled = match.scheduled._seconds;
                  needed.push(ele);
                }
                if (!checkGodSellFlag(args, predictions)) {
                  ele.code = 409;
                  failed.push(ele);
                  if (args.sell === 0) ele.error = 'Can not be changed to free';
                  if (args.sell === 1) ele.error = 'Can not be changed to sell';
                }
              }
              // eslint-disable-next-line no-await-in-loop
              if (!(await checkGodInsert(args, predictions, ele))) {
                ele.code = 423;
                ele.error = `Totals id: ${ele.totals[0]} already exist, locked`;
                failed.push(ele);
              }
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

function getUserStatus(args) {
  return new Promise(async function(resolve, reject) {
    // 檢查使用者是什麼身份
    try {
      const userSnapshot = await modules.getSnapshot('users', args.token.uid);
      if (!userSnapshot.exists) {
        reject({ code: 400, error: 'user not found' });
      }

      if (userSnapshot.exists) {
        const data = userSnapshot.data();
        if (args.sell === 1) {
          if (checkGodTitles(args.league, data.titles)) {
            resolve(data.status);
          }

          if (!checkGodTitles(args.league, data.titles)) {
            reject({
              code: 403,
              error: `This user not the god in ${args.league}, forbidden`
            });
          }
        }
        if (args.sell === 0) resolve(data.status);
      }
    } catch (err) {
      console.error(
        'Error in model/user/predictMatchesModel/checkUser function by TsaiChieh',
        err
      );
      reject({ code: 500, error: err });
    }
  });
}

function checkGodTitles(league, titles) {
  let flag = false;
  for (let i = 0; i < titles.length; i++) {
    if (titles[i].league === league) {
      flag = true;
      break;
    }
  }
  return flag;
}

async function getPredictions(args, match) {
  const date = modules
    .moment(match.scheduled._seconds * 1000)
    .utcOffset(8)
    .format('MMDDYYYY');
  return await modules.getSnapshot(
    modules.leagueCodebook(args.league).prediction,
    `${date}_${args.token.uid}`
  );
}
// eslint-disable-next-line consistent-return
async function checkGodInsert(args, predictSnapshot, ele) {
  if (args.userStatus === 1) return true;
  if (args.userStatus === 2) {
    if (!predictSnapshot.exists) return true;
    if (predictSnapshot.exists) {
      const prediction = predictSnapshot.data();
      if (prediction.matches) {
        for (const key in prediction.matches) {
          if (key === ele.id) {
            if (ele.spread) {
              if (prediction.matches[ele.id].spread) return false;
              if (!prediction.matches[ele.id].spread) return true;
            }
            if (ele.totals) {
              if (prediction.matches[ele.id].totals) return false;
              if (!prediction.matches[ele.id].totals) return true;
            }
          }
        }
        return true;
      }
    }
  }
}

// eslint-disable-next-line consistent-return
function checkGodSellFlag(args, predictionSnapshot) {
  if (args.userStatus === 1) return true;
  if (!predictionSnapshot.exists) return true;
  if (args.userStatus === 2) {
    const prediction = predictionSnapshot.data();
    if (args.sell === prediction.sell) return true;
    if (args.sell !== prediction.sell) return false;
  }
}

function checkNormalUserSell(args) {
  if (args.userStatus === 1 && args.sell === 1) return false;
  return true;
}
module.exports = predictMatches;
