const express = require('express');
const envValues = require('../config/env_values');
const firebaseAdmin = require('firebase-admin');
const firebase = require('firebase');
const moment = require('moment');
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
  if (operation) {
    if (operation.op === 'add') {
      return moment
        .tz(unix, zone)
        .add(operation.value, operation.unit)
        .format('YYYYMMDD');
    } else if (operation.op === 'subtract') {
      return moment
        .tz(unix, zone)
        .subtract(operation.value, operation.unit)
        .format('YYYYMMDD');
    }
  }
  return moment.tz(unix, zone).format('YYYYMMDD');
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
  eBKA: 'eBKA',
  eSB8: 'eSB8',
  baseball_MLB: 'baseball_MLB',
  eSoccer: 'eSoccer',
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
// eslint-disable-next-line consistent-return
function leagueCodebook(league) {
  switch (league) {
    case 'NBA':
      return {
        id: 2274,
        match: db.basketball_NBA
      };
    case 'SBL':
      return {
        id: 8251,
        match: db.basketball_SBL
      };
    case 'MLB':
      return {
        id: 3939,
        match: db.baseball_MLB
      };
    case 'eSoccer':
      return {
        id: 22000,
        match: db.eSoccer
      };
  }
}

function leagueDecoder(leagueID) {
  switch (leagueID) {
    case '2274' || 2274:
      return 'NBA';
    case '3939' || 3939:
      return 'MLB';
    case '22000' || 22000:
      return 'eSoccer';
    default:
      return 'Unknown';
  }
}

function getTitlesPeriod(date) {
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
  weeks -= moment().weeks(); // 減去目前已過幾週

  for (let i = 0; i < Math.ceil(weeks / 2); i++) {
    const begin = moment(specificDate)
      .utcOffset(UTF8)
      .add(i * 2, 'weeks')
      .valueOf();
    const end = moment(specificDate)
      .utcOffset(UTF8)
      .add(i * 2 + 1, 'weeks')
      .endOf('isoWeek')
      .valueOf();

    if (begin <= date && date <= end) {
      return {
        period: i, // 期數
        date: moment(specificDate)
          .utcOffset(UTF8)
          .add(i * 2 - 2, 'weeks')
          .format('YYYYMMDD') // 該期的開始日期
      };
    }
  }
  return 0;
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
  const map = new Map(Array.from(arr, obj => [obj[prop], []]));
  arr.forEach(obj => map.get(obj[prop]).push(obj));
  return Array.from(map.values());
}

// sort an array of objects by multiple fields
// https://stackoverflow.com/a/30446887
const fieldSorter = (fields) => (a, b) => fields.map(o => {
  let dir = 1;
  if (o[0] === '-') { dir = -1; o = o.substring(1); }
  return a[o] > b[o] ? dir : a[o] < b[o] ? -(dir) : 0;
}).reduce((p, n) => p || n, 0);

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
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
  const isDeep = prop =>
    // eslint-disable-next-line no-prototype-builtins
    isObject(source[prop]) && target.hasOwnProperty(prop) && isObject(target[prop]);
  const replaced = Object.getOwnPropertyNames(source)
    .map(prop => ({ [prop]: isDeep(prop) ? mergeDeep(target[prop], source[prop]) : source[prop] }))
    .reduce((a, b) => ({ ...a, ...b }), {});

  return {
    ...target,
    ...replaced
  };
};

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
  return handicap
    ? (homePoints - handicap) === awayPoints
      ? (homeOdd !== awayOdd)
        ? (homeOdd > awayOdd) ? 'fair|home' : 'fair|away'
        : 'fair2'
      : (homePoints - handicap) > awayPoints ? 'home' : 'away'
    : '';
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
  return handicap
    ? (homePoints + awayPoints) === handicap
      ? (overOdd !== underOdd)
        ? (overOdd > underOdd) ? 'fair|over' : 'fair|under'
        : 'fair2'
      : (homePoints + awayPoints) > handicap ? 'over' : 'under'
    : '';
}

function perdictionsResultFlag(option, settelResult) {
  // 先處理 fair 平盤情況 'fair|home', 'fair|away', 'fair|over', 'fair|under'
  if (['fair|home', 'fair|away', 'fair|over', 'fair|under'].includes(settelResult)) {
    const settleOption = settelResult.split('|')[1];
    return settleOption === option ? 0.5 : -0.5;
  }

  // -2 未結算，-1 輸，0 不算，1 贏，0.5 平 (一半一半)
  return settelResult === 'fair2'
    ? 0 : settelResult === option
      ? 0.95 : -1;
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

  // 先以 uid 分類，再用 league_id 分類
  const rePredictMatchInfo = groupBy(data, 'uid');

  rePredictMatchInfo.forEach(function(uids) {
    const totalPredictCounts = data.length;

    const reLeagues = groupBy(uids, 'league_id');

    reLeagues.forEach(function(data) {
      // 勝率 winRate
      const predictCorrectCounts =
        data.reduce((acc, cur) => correct.includes(cur.spread_result_flag) ? ++acc : acc, 0) +
        data.reduce((acc, cur) => correct.includes(cur.totals_result_flag) ? ++acc : acc, 0);

      const predictFaultCounts =
        data.reduce((acc, cur) => fault.includes(cur.spread_result_flag) ? ++acc : acc, 0) +
        data.reduce((acc, cur) => fault.includes(cur.totals_result_flag) ? ++acc : acc, 0);

      // 避免分母是0 平盤無效
      const winRate = (predictCorrectCounts + predictFaultCounts) === 0
        ? 0
        : predictCorrectCounts / (predictCorrectCounts + predictFaultCounts);

      // 勝注
      const predictCorrectBets =
        data.reduce((acc, cur) => correct.includes(cur.spread_result_flag) ? cur.spread_result_flag * cur.spread_bets : acc, 0) +
        data.reduce((acc, cur) => correct.includes(cur.totals_result_flag) ? cur.totals_result_flag * cur.totals_bets : acc, 0);

      const predictFaultBets =
        data.reduce((acc, cur) => fault.includes(cur.spread_result_flag) ? cur.spread_result_flag * cur.spread_bets : acc, 0) +
        data.reduce((acc, cur) => fault.includes(cur.totals_result_flag) ? cur.totals_result_flag * cur.totals_bets : acc, 0);

      const winBets = predictCorrectBets + predictFaultBets;

      result.push({
        uid: data[0].uid,
        league_id: data[0].league_id,
        win_rate: Number((winRate * 100).toFixed(0)),
        win_bets: Number((winBets).toFixed(2)),
        matches_count: data.length,
        correct_counts: predictCorrectCounts,
        fault_counts: predictFaultCounts
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
  leagueCodebook,
  addDataInCollectionWithId,
  getTitlesPeriod,
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
  fieldSorter,
  mergeDeep,
  settleSpread,
  settleTotals,
  perdictionsResultFlag,
  predictionsWinList
};
