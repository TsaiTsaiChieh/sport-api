const express = require('express');
const envValues = require('../config/env_values');
const firebaseAdmin = require('firebase-admin');
const firebase = require('firebase');
const moment = require('moment');
require('moment-timezone');
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true, useDefaults: true });
const axios = require('axios');
const { sportRadarKeys, betsToken, zone_tw } = envValues;
const path = require('path');
const os = require('os');
const fs = require('fs');
const https = require('https');
const httpStatus = require('http-status');
const firestoreService = require('firestore-export-import');
const translate = require('@k3rn31p4nic/google-translate-api');
const simple2Tradition = require('chinese-simple-tradition-translator');
const UTF0 = 0;
const UTF8 = 8;
const acceptNumberAndLetter = '^[a-zA-Z0-9_.-]*$';
const acceptLeague = ['NBA', 'eSoccer', 'KBO'];
// const errs = require('./errorCode');
const MATCH_STATUS = { SCHEDULED: 2, INPLAY: 1, END: 0, ABNORMAL: -1 };
const to = require('await-to-js').default;
const AppErrors = require('./AppErrors');
const NP = require('number-precision');

// 輸入的時間為該時區 ，輸出轉為 GMT 時間
/*
  date: 2020-07-01 or 20200701
  [operation]: {
        op: 'add',
        value: 1,
        unit: 'days'
      }
  zone: 'America/Los_Angeles' or 'Asia/Taipei'
*/
function convertTimezone(date, operation, zone = zone_tw) {
  if (operation) {
    if (operation.op === 'add') {
      return moment.tz(date, zone).add(operation.value, operation.unit).unix();
    }
    if (operation.op === 'subtract') {
      return moment
        .tz(date, zone)
        .subtract(operation.value, operation.unit)
        .unix();
    }
  }
  return moment.tz(date, zone).unix();
}

// 輸入的時間為 unix ，輸出轉為 YYYYMMDD 格式
/*
  unix: Math.floor(Date.now() / 1000)
  [operation]: {
        op: 'add',
        value: 1,
        unit: 'days'
      }
  zone: 'America/Los_Angeles' or 'Asia/Taipei'
*/
function convertTimezoneFormat(unix, operation, zone = zone_tw) {
  unix = unix * 1000;
  const datetime = moment.tz(unix, zone);
  if (!operation) return datetime.format('YYYYMMDD');
  /* 處理時間計算 */
  if (operation.op === 'add') {
    datetime.add(operation.value, operation.unit);
  } else if (operation.op === 'subtract') {
    datetime.subtract(operation.value, operation.unit);
  }
  /* 處理時間格式 */
  if (operation.format) return datetime.format(operation.format);
  else return datetime.format('YYYYMMDD');
}

function initFirebase() {
  if (firebaseAdmin.apps.length === 0) {
    console.log('initializing firebase database');
    firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert(envValues.cert),
      databaseURL: envValues.firebaseConfig.databaseURL,
      storageBucket: envValues.firebaseConfig.storageBucket
    });
  } else {
    console.log('firebase is already initialized');
  }
}

initFirebase();
// firebaseAdmin.initializeApp({
//   credential: firebaseAdmin.credential.cert(envValues.cert),
//   databaseURL: envValues.firebaseConfig.databaseURL,
//   storageBucket: envValues.firebaseConfig.storageBucket
// });
const bucket = firebaseAdmin
  .storage()
  .bucket(envValues.firebaseConfig.storageBucket);
const firestore = firebaseAdmin.firestore();
const database = firebaseAdmin.database();

/* redis 設定-START */
var redis = {
  ip: '10.106.218.244',
  port: '6379'
};
/* redis 設定-END */

function getSnapshot(collection, id) {
  return firestore.collection(collection).doc(id).get();
}

function getDoc(collection, id) {
  return firestore.collection(collection).doc(id);
}

function addDataInCollection(collection, data) {
  return firestore.collection(collection).add(data);
}
function addDataInCollectionWithId(collection, id, data) {
  return firestore.collection(collection).doc(id).set(data, { merge: true });
}
function createError(code, error) {
  const err = {};
  err.code = code;
  err.error = error;
  return err;
}

// database name general setting
const db = {
  basketball_NBA: 'basketball_NBA',
  basketball_SBL: 'basketball_SBL',
  basketball_WNBA: 'basketball_WNBA',
  basketball_NBL: 'basketball_NBL',
  basketball_CBA: 'basketball_CBA',
  basketball_KBL: 'basketball_KBL',
  basketball_BJL: 'basketball_BJL',
  baseball_MLB: 'baseball_MLB',
  baseball_NPB: 'baseball_NPB',
  baseball_CPBL: 'baseball_CPBL',
  baseball_KBO: 'baseball_KBO',
  baseball_ABL: 'baseball_ABL',
  baseball_LMB: 'baseball_LMB',
  icehockey_NHL: 'icehockey_NHL',
  Soccer: 'Soccer',
  eSoccer: 'esport_eSoccer',
  eGame: 'eGame',
  prediction: 'prediction'
};
function dateFormat(date) {
  return {
    year: date.substring(0, 4),
    month: date.substring(5, 7),
    day: date.substring(8, 10)
  };
}
async function cloneFirestore(name, clonedName) {
  const snapshot = await firestore.collection(name).get();
  const clonedDb = firestore.collection(clonedName);
  snapshot.docs.map(function(doc) {
    clonedDb.doc(doc.data().bets_id).set(doc.data(), { merge: true });
  });
}
function firebaseTimestamp(milliseconds) {
  return firebaseAdmin.firestore.Timestamp.fromDate(new Date(milliseconds));
}
function league2Sport(league) {
  switch (league) {
    case 'NBA':
      return {
        sport: 'basketball'
      };
    case 'MLB':
      return {
        sport: 'baseball'
      };
    case 'NHL':
      return {
        sport: 'icehockey'
      };
    case 'Soccer':
      return {
        sport: 'soccer'
      };
    case 'KBO':
      return {
        sport: 'baseball'
      };
    case 'eSoccer':
      return {
        sport: 'esports'
      };
    default:
      throw new AppErrors.UnknownLeague();
  }
}
function leagueCodebook(league) {
  switch (league) {
    case 'NBA':
      return {
        id: 2274,
        match: db.basketball_NBA,
        name_ch: '美國國家籃球協會'
      };
    case 'SBL':
      return {
        id: 8251,
        match: db.basketball_SBL,
        name_ch: '超級籃球聯賽'
      };
    case 'WNBA':
      return {
        id: 244,
        match: db.basketball_WNBA,
        name_ch: '美國國家女子籃球協會'
      };
    case 'NBL':
      return {
        id: 1714,
        match: db.basketball_NBL,
        name_ch: '澳洲職籃'
      };
    case 'CBA':
      return {
        id: 2319,
        match: db.basketball_CBA,
        name_ch: '中國職籃'
      };
    case 'KBL':
      return {
        id: 2148,
        match: db.basketball_KBL,
        name_ch: '韓國職籃'
      };
    case 'BJL':
      return {
        id: 1298,
        match: db.basketball_BJL,
        name_ch: '日本職籃'
      };
    case 'MLB':
      return {
        id: 3939,
        match: db.baseball_MLB,
        name_ch: '美國職棒大聯盟'
      };
    case 'NPB':
      return {
        id: 347,
        match: db.baseball_NPB,
        name_ch: '日本職棒'
      };
    case 'CPBL':
      return {
        id: 11235,
        match: db.baseball_CPBL,
        name_ch: '中華職棒'
      };
    case 'KBO':
      return {
        id: 349,
        match: db.baseball_KBO,
        name_ch: '韓國職棒'
      };
    case 'ABL':
      return {
        id: 2759,
        match: db.baseball_ABL,
        name_ch: '澳洲職棒'
      };
    case 'LMB':
      return {
        id: 4412,
        match: db.baseball_LMB,
        name_ch: '墨西哥職棒'
      };
    case 'NHL':
      return {
        id: 1926,
        match: db.baseball_NHL,
        name_ch: '國家冰球聯盟'
      };
    case 'Soccer':
      return {
        id: 8,
        match: db.Soccer,
        name_ch: '足球'
      };
    case 'eSoccer':
      return {
        id: 22000,
        match: db.eSoccer,
        name_ch: '足球電競'
      };
    case 'eGame':
      return {
        id: 23000,
        match: db.eGame,
        name_ch: '電競遊戲'
      };
    default:
      throw new AppErrors.UnknownLeague();
  }
}

function leagueDecoder(leagueID) {
  switch (leagueID) {
    case '2274' || 2274:
      return 'NBA';
    case '8251' || 8251:
      return 'SBL';
    case '244' || 244:
      return 'WNBA';
    case '1714' || 1714:
      return 'NBL';
    case '2319' || 2319:
      return 'CBA';
    case '2148' || 2148:
      return 'KBL';
    case '1298' || 1298:
      return 'BJL';
    case '3939' || 3939:
      return 'MLB';
    case '347' || 347:
      return 'NPB';
    case '11235' || 11235:
      return 'CPBL';
    case '349' || 349:
      return 'KBO';
    case '2759' || 2759:
      return 'ABL';
    case '4412' || 4412:
      return 'LMB';
    case '1926' || 1926:
      return 'NHL';
    case '8' || 8:
      return 'Soccer';
    case '22000' || 22000:
      return 'eSoccer';
    case '23000' || 23000:
      return 'eGame';
    default:
      throw new AppErrors.UnknownLeague();
  }
}

/**
 * @description 回傳頭銜期數、開始/結束日期和該期是第幾個星期
 * @params date = new Date();
 * ！非常重要！ 目前前端會使用這個模組，一但有修改程式碼，務必和前端同步
 */
function getTitlesPeriod(date, format = 'YYYYMMDD') {
  // date = new Date()
  const specificDate = '20200302';
  const years = [
    2020,
    2021,
    2022,
    2023,
    2024,
    2025,
    2026,
    2027,
    2028,
    2029,
    2030
  ];
  let weeks = 0;
  for (let i = 0; i < years.length; i++) {
    const year = years[i];
    const weeksInYear = moment(year).isoWeeksInYear(); // always 53
    weeks += weeksInYear;
  }

  weeks -= moment(specificDate).weeks(); // 減去從 specificDate 已過幾週

  const periodTenYear = Math.ceil(weeks / 2);
  for (let i = 0; i < periodTenYear; i++) {
    const begin = moment(specificDate)
      .utcOffset(UTF8)
      .add(i * 2 - 1, 'weeks')
      .endOf('isoWeek')
      .valueOf();
    const middle = moment(specificDate)
      .utcOffset(UTF8)
      .add(i * 2, 'weeks')
      .endOf('isoWeek')
      .valueOf();
    const end = moment(specificDate)
      .utcOffset(UTF8)
      .add(i * 2 + 1, 'weeks')
      .endOf('isoWeek')
      .valueOf();

    if (begin <= date && date <= end) {
      return {
        period: i, // 期數
        date: moment(specificDate) // 該期開始計算的日期
          .utcOffset(UTF8)
          .add(i * 2 - 2, 'weeks')
          .format(format),
        end: moment(specificDate) // 該期結束計算的日期
          .utcOffset(UTF8)
          .add(i * 2, 'weeks')
          .subtract(1, 'days')
          .format(format),
        weekPeriod: date < middle ? 1 : 2 // 該期數是第幾個星期
      };
    }
  }
  return 0;
}

/**
 * @description 回傳 下一期數、開始/結束日期和 目前日期 位於 該期是第幾個星期
 * @params date = new Date();
 */
function getTitlesNextPeriod(sdate, format = 'YYYYMMDD') {
  const t = getTitlesPeriod(sdate, format);
  if (t === 0) return 0;
  return {
    period: t.period + 1,
    date: moment(t.date).utcOffset(UTF8).add(2, 'weeks').format(format),
    end: moment(t.end).utcOffset(UTF8).add(2, 'weeks').format(format),
    weekPeriod: t.weekPeriod
  };
}

// titles
// {
//   continue:
//   predict_rate1:
//   predict_rate2:
//   predict_rate3:
//   win_bets_continue:
//   matches_rate1:
//   matches_rate2:
//   matches_continue
// }
function getTitles(titles, num = 1) {
  switch (num) {
    case 1:
      return { 1: titles.continue };
    case 2:
      return { 2: [titles.predict_rate1, titles.predict_rate2, titles.predict_rate3] };
    case 3:
      return { 3: [titles.predict_rate1, titles.predict_rate3] };
    case 4:
      return { 4: titles.win_bets_continue };
    case 5:
      return { 5: [titles.matches_rate1, titles.matches_rate2] };
    case 6:
      return { 6: titles.matches_continue };
  }
}

// titles
// {
//   continue:
//   predict_rate1:
//   predict_rate2:
//   predict_rate3:
//   win_bets_continue:
//   matches_rate1:
//   matches_rate2:
//   matches_continue
// }
function getAllTitles(titles) {
  return {
    1: titles.continue,
    2: [titles.predict_rate1, titles.predict_rate2, titles.predict_rate3],
    3: [titles.predict_rate1, titles.predict_rate3],
    4: titles.win_bets_continue,
    5: [titles.matches_rate1, titles.matches_rate2],
    6: titles.matches_continue
  };
}

function userStatusCodebook(role) {
  switch (role) {
    case 1:
      return 'GOD';
    case 9:
      return 'ADMIN';
    default:
      return 'NORMAL';
  }
}

// 將陣列裡面的 object 依照 attrib 來進行分類成 array
function groupBy(arr, prop) {
  const map = new Map(Array.from(arr, (obj) => [obj[prop], []]));
  arr.forEach((obj) => map.get(obj[prop]).push(obj));
  return Array.from(map.values());
}

// groupsby 多 group 欄位參數 且 排序(多欄位) 且 可限制筆數
// 輸入參數
//   prop: [o.uid, o.league_id] // group 欄位
//   order: ['date_timestamp', ...] // date_timestamp：小到大  -date_timestamp：大到小
//   limit: 30 // -1 全部
// 回傳
//   { uid: 'Xw4dOKa4mWh3Kvlx35mPtAOX2P52', league_id: '2274', lists: [ {...}, ... ]}
function groupsByOrdersLimit(array, prop, order, limit = -1) {
  const groups = {};
  array.forEach(function(o) {
    // 組出 prop 的 json 字串 做為 groups key 值
    var group = JSON.stringify(
      prop.map((m) => {
        return o[m];
      })
    );
    groups[group] = groups[group] || [];
    groups[group].push(o);
  });

  // eslint-disable-next-line no-unused-vars
  for (let [key, o] of Object.entries(groups)) {
    o.sort(fieldSorter(order));
    o = o.slice(0, limit); // 取幾筆
  }

  return Object.keys(groups).map(function(group) {
    const res = {};
    const t = JSON.parse(group); // 把 json 字串 轉回 object
    for (const [key, value] of Object.entries(t)) {
      res[prop[key]] = value;
    }

    res.lists = groups[group];
    return res;
  });
}

// sort an array of objects by multiple fields
// https://stackoverflow.com/a/30446887
const fieldSorter = (fields) => (a, b) =>
  fields
    .map((o) => {
      let dir = 1;
      if (o[0] === '-') {
        dir = -1;
        o = o.substring(1);
      }
      return a[o] > b[o] ? dir : a[o] < b[o] ? -dir : 0;
    })
    .reduce((p, n) => p || n, 0);

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 * https://www.itranslater.com/qa/details/2115518846294557696
 */
// function mergeDeep(target, ...sources) {
//   if (!sources.length) return target;
//   const source = sources.shift();

//   if (isObject(target) && isObject(source)) {
//     for (const key in source) {
//       if (isObject(source[key])) {
//         if (!target[key]) Object.assign(target, { [key]: {} });
//         mergeDeep(target[key], source[key]);
//       } else {
//         Object.assign(target, { [key]: source[key] });
//       }
//     }
//   }

//   return mergeDeep(target, ...sources);
// }

const mergeDeep = (target, source) => {
  const isDeep = (prop) =>
    isObject(source[prop]) &&
    Object.prototype.hasOwnProperty.call(target, prop) &&
    isObject(target[prop]);
  const replaced = Object.getOwnPropertyNames(source)
    .map((prop) => ({
      [prop]: isDeep(prop)
        ? mergeDeep(target[prop], source[prop])
        : source[prop]
    }))
    .reduce((a, b) => ({ ...a, ...b }), {});

  return {
    ...target,
    ...replaced
  };
};

// 取小數位
// point = Math.abs(num) - parseInt(Math.abs(num));
/*
{
  homePoints:
  awayPoints:
  spreadHandicap:
  spreadHomeOdd:
  spreadAwayOdd:
}
*/
function settleSpread(data) {
  // handciap: 正:主讓客  負:客讓主
  const homePoints = data.homePoints;
  const awayPoints = data.awayPoints;

  const handicap = data.spreadHandicap;
  const homeOdd = data.spreadHomeOdd;
  const awayOdd = data.spreadAwayOdd;

  // 平盤有兩情況
  // fair 要計算注數，會分輸贏
  // fair2 平盤 不要計算注數
  // return handicap
  //   ? (homePoints - handicap) === awayPoints
  //     ? (homeOdd !== awayOdd)
  //       ? (homeOdd > awayOdd) ? 'fair|home' : 'fair|away'
  //       : 'fair2'
  //     : (homePoints - handicap) > awayPoints ? 'home' : 'away'
  //   : '';
  return homePoints - handicap === awayPoints
    ? homeOdd !== awayOdd
      ? homeOdd > awayOdd
        ? 'fair|home'
        : 'fair|away'
      : 'fair2'
    : homePoints - handicap > awayPoints
      ? 'home'
      : 'away';
}

// point 用來取得 handicap 的 小數位數值
// 整數、0.5 為一般處理
// 0.25 需要另外判斷
// 0.75 需要另外判斷
function settleSpreadSoccer(data) {
  const sp_25 = [0.25];
  // const sp_5 = [0.5];
  const sp_75 = [0.75];
  const homePoints = data.homePoints;
  const awayPoints = data.awayPoints;

  const handicap = Math.abs(data.spreadHandicap);
  const point = handicap - parseInt(handicap);
  const result = homePoints - awayPoints - handicap;

  // 整數 和局
  if (result === 0) return 'fair2';

  if (sp_25.includes(point)) {
    return result === -0.25
      ? 'fair|away'
      : result > -0.25
        ? 'home'
        : 'away';
  }

  if (sp_75.includes(point)) {
    return result === 0.25
      ? 'fair|home'
      : result > 0.25
        ? 'home'
        : 'away';
  }

  // 整數 和 0.5
  return result > 0 ? 'home' : 'away';
}

/*
{
  homePoints:
  awayPoints:
  totalsHandicap:
  totalsOverOdd:
  totalsUnderOdd:
}
*/
function settleTotals(data) {
  // handciap: 正:主讓客  負:客讓主
  const homePoints = data.homePoints;
  const awayPoints = data.awayPoints;

  const handicap = data.totalsHandicap;
  const overOdd = data.totalsOverOdd;
  const underOdd = data.totalsUnderOdd;

  // 平盤有兩情況
  // fair 平盤 要計算注數，會分輸贏
  // fair2 平盤 不要計算注數
  // return handicap
  //   ? (homePoints + awayPoints) === handicap
  //     ? (overOdd !== underOdd)
  //       ? (overOdd > underOdd) ? 'fair|over' : 'fair|under'
  //       : 'fair2'
  //     : (homePoints + awayPoints) > handicap ? 'over' : 'under'
  //   : '';
  return homePoints + awayPoints === handicap
    ? overOdd !== underOdd
      ? overOdd > underOdd
        ? 'fair|over'
        : 'fair|under'
      : 'fair2'
    : homePoints + awayPoints > handicap
      ? 'over'
      : 'under';
}

// point 用來取得 handicap 的 小數位數值
// 整數、0.5 為一般處理
// 0.25 需要另外判斷
// 0.75 需要另外判斷
function settleTotalsSoccer(data) {
  const sp_25 = [0.25];
  // const sp_5 = [0.5];
  const sp_75 = [0.75];
  const homePoints = data.homePoints;
  const awayPoints = data.awayPoints;

  const handicap = Math.abs(data.totalsHandicap);
  const point = handicap - parseInt(handicap);
  const result = homePoints + awayPoints - handicap;

  // 整數 和局
  if (result === 0) return 'fair2';

  if (sp_25.includes(point)) {
    return result === -0.25
      ? 'fair|under'
      : result > -0.25
        ? 'over'
        : 'under';
  }

  if (sp_75.includes(point)) {
    return result === 0.25
      ? 'fair|over'
      : result > 0.25
        ? 'over'
        : 'under';
  }

  // 整數 和 0.5
  return result > 0
    ? 'over'
    : 'under';
}

function perdictionsResultFlag(option, settelResult) {
  // 先處理 fair 平盤情況 'fair|home', 'fair|away', 'fair|over', 'fair|under'
  if (
    ['fair|home', 'fair|away', 'fair|over', 'fair|under'].includes(settelResult)
  ) {
    const settleOption = settelResult.split('|')[1];
    return settleOption === option ? 0.5 : -0.5;
  }

  // -2 未結算，-1 輸，0 不算，0.95 贏，0.5 平 (一半一半)
  return settelResult === 'fair2' ? 0 : settelResult === option ? 0.95 : -1;
}

/* 輸入資料格式
  [
    {
      uid: '3IB0w6G4V8QUM2Ti3iCIfX4Viux1',
      league_id: 3939,
      spread_bets: null,
      totals_bets: 1,
      spread_result_flag: -2,
      totals_result_flag: -1
    },
    {
      uid: '2WMRgHyUwvTLyHpLoANk7gWADZn1',
      league_id: 3939,
      spread_bets: 3,
      totals_bets: 3,
      spread_result_flag: -1,
      totals_result_flag: 0.95
    },
    {
      uid: '2WMRgHyUwvTLyHpLoANk7gWADZn1',
      league_id: 3939,
      spread_bets: 1,
      totals_bets: 2,
      spread_result_flag: 0.95,
      totals_result_flag: -1
    }
  ]
*/
function predictionsWinList(data) {
  const correct = [0.95, 0.5];
  const fault = [-1, -0.5];
  const result = [];
  // const totalPredictCounts = data.length;

  // 先以 uid 分類，再用 league_id 分類
  const rePredictMatchInfo = groupBy(data, 'uid');

  rePredictMatchInfo.forEach(function(uids) {
    const reLeagues = groupBy(uids, 'league_id');

    reLeagues.forEach(function(data) {
      // 勝率 winRate
      const predictSpreadCorrectCounts = data.reduce(
        (acc, cur) => (correct.includes(cur.spread_result_flag) ? ++acc : acc),
        0
      );
      const predictTotalsCorrectCounts = data.reduce(
        (acc, cur) => (correct.includes(cur.totals_result_flag) ? ++acc : acc),
        0
      );
      const predictCorrectCounts =
        predictSpreadCorrectCounts + predictTotalsCorrectCounts;

      const predictSpreadFaultCounts = data.reduce(
        (acc, cur) => (fault.includes(cur.spread_result_flag) ? ++acc : acc),
        0
      );
      const predictTotalsFaultCounts = data.reduce(
        (acc, cur) => (fault.includes(cur.totals_result_flag) ? ++acc : acc),
        0
      );
      const predictFaultCounts = NP.plus(predictSpreadFaultCounts, predictTotalsFaultCounts);

      // 避免分母是0 平盤無效
      const spreadWinRate =
        NP.plus(predictSpreadCorrectCounts, predictSpreadFaultCounts) === 0
          ? 0
          : NP.divide(predictSpreadCorrectCounts, NP.plus(predictSpreadCorrectCounts, predictSpreadFaultCounts));
      const totalsWinRate =
        NP.plus(predictTotalsCorrectCounts, predictTotalsFaultCounts) === 0
          ? 0
          : NP.divide(predictTotalsCorrectCounts, NP.plus(predictTotalsCorrectCounts, predictTotalsFaultCounts));
      const winRate =
        NP.plus(predictCorrectCounts, predictFaultCounts) === 0
          ? 0
          : NP.divide(predictCorrectCounts, NP.plus(predictCorrectCounts, predictFaultCounts));

      // 勝注
      const predictSpreadCorrectBets = data.reduce(
        (acc, cur) =>
          correct.includes(cur.spread_result_flag)
            ? NP.plus(NP.times(cur.spread_result_flag, cur.spread_bets), acc)
            : acc,
        0
      );
      const predictTotalsCorrectBets = data.reduce(
        (acc, cur) =>
          correct.includes(cur.totals_result_flag)
            ? NP.plus(NP.times(cur.totals_result_flag, cur.totals_bets), acc)
            : acc,
        0
      );
      const predictCorrectBets = NP.plus(predictSpreadCorrectBets, predictTotalsCorrectBets);

      const predictSpreadFaultBets = data.reduce(
        (acc, cur) =>
          fault.includes(cur.spread_result_flag)
            ? NP.plus(NP.times(cur.spread_result_flag, cur.spread_bets), acc)
            : acc,
        0
      );
      const predictTotalsFaultBets = data.reduce(
        (acc, cur) =>
          fault.includes(cur.totals_result_flag)
            ? NP.plus(NP.times(cur.totals_result_flag, cur.totals_bets), acc)
            : acc,
        0
      );
      const predictFaultBets = NP.plus(predictSpreadFaultBets, predictTotalsFaultBets);

      const spreadWinBets = NP.plus(predictSpreadCorrectBets, predictSpreadFaultBets);
      const totalsWinBets = NP.plus(predictTotalsCorrectBets, predictTotalsFaultBets);
      const winBets = NP.plus(predictCorrectBets, predictFaultBets);

      // 注數計算

      result.push({
        uid: data[0].uid,
        league_id: data[0].league_id,
        win_rate: winRate,
        win_bets: winBets,
        matches_count: data.length,
        correct_counts: predictCorrectCounts,
        fault_counts: predictFaultCounts,
        spread_correct_counts: predictSpreadCorrectCounts,
        totals_correct_counts: predictTotalsCorrectCounts,
        spread_fault_counts: predictSpreadFaultCounts,
        totals_fault_counts: predictTotalsFaultCounts,
        spread_win_rate: spreadWinRate,
        totals_win_rate: totalsWinRate,
        spread_correct_bets: predictSpreadCorrectBets,
        totals_correct_bets: predictTotalsCorrectBets,
        spread_fault_bets: predictSpreadFaultBets,
        totals_fault_bets: predictTotalsFaultBets,
        spread_win_bets: spreadWinBets,
        totals_win_bets: totalsWinBets
      });

      // console.log('\n');
      // console.log('%o totalPredictCounts: %f  predictCorrectCounts: %f  predictFaultCounts: %f',
      //   data[0].uid, totalPredictCounts, predictCorrectCounts, predictFaultCounts);
      // console.log('winRate: %f', winRate * 100);

      // console.log('%o predictCorrectBets: %f  predictFaultBets: %f ',
      //   data[0].uid, predictCorrectBets, predictFaultBets);
      // console.log('winBets: %0.2f', winBets);

      // console.log('\n');
      // console.log('re: ', data);
    });
  });
  return result;
}

// 一般 NBA MLB
// home_alias = 'CHA'
//
// home: {
//     team_name: 'CHA',
//     alaias: 'CHA',
//     alias_ch: '黃蜂',
//     player_name: null
// }
//
// 電競足球
// home_alias = 'Atletico Madrid (Boulevard_Prospect)'
//
// home: {
//   team_name: 'Atletico Madrid (Boulevard_Prospect)',
//   alaias: 'Atletico Madrid',
//   alias_ch: 'Atletico Madrid',
//   player_name: 'Boulevard_Prospect'
// }
//
// team_name: ele.home_alias,
// alias: sliceTeamAndPlayer(ele.home_alias).team,
// alias_ch: sliceTeamAndPlayer(ele.home_alias_ch).team,
// player_name: sliceTeamAndPlayer(ele.home_alias).player_name,
//
// 將電競足球的隊名和球員分開
function sliceTeamAndPlayer(name) {
  if (name.includes('(')) {
    const index = name.indexOf('(');
    return {
      team: name.slice(0, index).trim(),
      player_name: name.slice(index).replace('(', '').replace(')', '').trim()
    };
  }
  return {
    team: name.trim(),
    player_name: null
  };
}

function godUserPriceTable(rank) {
  rank = Number.parseInt(rank);
  switch (rank) {
    case 1:
      return 179;
    case 2:
      return 169;
    case 3:
      return 159;
    case 4:
      return 149;
    default:
      return 149;
  }
}

function validateProperty(data, propertyName) {
  const property = data[propertyName];
  if (property === undefined) throw new AppErrors.PropertyMissingError(`${propertyName} 資料欄位缺漏 (undefined)`);
  return property;
}

module.exports = {
  redis,
  express,
  firebaseAdmin,
  firebase,
  firestore,
  getSnapshot,
  createError,
  getDoc,
  ajv,
  bucket,
  database,
  addDataInCollection,
  moment,
  axios,
  db,
  betsToken,
  path,
  os,
  fs,
  https,
  dateFormat,
  cloneFirestore,
  sportRadarKeys,
  firebaseTimestamp,
  firestoreService,
  league2Sport,
  leagueCodebook,
  addDataInCollectionWithId,
  getTitlesPeriod,
  getTitlesNextPeriod,
  getTitles,
  getAllTitles,
  userStatusCodebook,
  translate,
  simple2Tradition,
  UTF0,
  UTF8,
  convertTimezone,
  convertTimezoneFormat,
  leagueDecoder,
  acceptNumberAndLetter,
  httpStatus,
  groupBy,
  groupsByOrdersLimit,
  fieldSorter,
  mergeDeep,
  settleSpread,
  settleSpreadSoccer,
  settleTotals,
  settleTotalsSoccer,
  perdictionsResultFlag,
  predictionsWinList,
  sliceTeamAndPlayer,
  acceptLeague,
  MATCH_STATUS,
  to,
  godUserPriceTable,
  validateProperty,
  NP
};
