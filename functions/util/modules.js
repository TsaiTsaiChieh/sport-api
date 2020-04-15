const express = require('express');
const envValues = require('../config/env_values');
const firebaseAdmin = require('firebase-admin');
const firebase = require('firebase');
const moment = require('moment');
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true, useDefaults: true });
const axios = require('axios');
const { sportRadarKeys, betsToken } = envValues;
const path = require('path');
const os = require('os');
const fs = require('fs');
const https = require('https');
const firestoreService = require('firestore-export-import');
const translate = require('@k3rn31p4nic/google-translate-api');
const simple2Tradition = require('chinese-simple-tradition-translator');
const UTF0 = 0;
const UTF8 = 8;

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

/*redis 設定-START*/
var redis = {
  ip: '10.106.218.244',
  port: '6379'
};
/*redis 設定-END*/
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
  // basketball_NBA: 'NBA_TC',
  basketball_SBL: 'basketball_SBL',
  baseball_MLB: 'baseball_MLB',
  // baseball_MLB: 'MLB_TC',
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
  snapshot.docs.map(function (doc) {
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
        match: db.basketball_NBA
      };
    case 'SBL':
      return {
        match: db.basketball_SBL
      };
    case 'MLB':
      return {
        match: db.baseball_MLB
      };
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
      .utcOffset(UTF)
      .add(i * 2, 'weeks')
      .valueOf();
    const end = moment(specificDate)
      .utcOffset(UTF)
      .add(i * 2 + 1, 'weeks')
      .endOf('isoWeek')
      .valueOf();
    if (begin <= date && date <= end)
      return {
        period: i, // 期數
        date: moment(specificDate)
          .utcOffset(UTF)
          .add(i * 2 - 2, 'weeks')
          .format('YYYYMMDD') // 該期的開始日期
      };
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
/*檢查唯一性(uniqueName、uniqueEmail、uniquePhone)*/
async function checkUnique(collection, uid) {
  try {
      if (!collection || !uid) return res.status(400).json({success: false});
      const collections = ['uniqueName', 'uniqueEmail', 'uniquePhone'];
      if (collections.indexOf(collection) < 0) return res.status(400).json({success: false});
      return res.json(await userUtils.checkUniqueCollection(collection, uid));
  } catch (e) {
      console.log(e);
      return res.status(500).json({success: false});
  }
}
module.exports = {
  checkUnique,
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
  UTF8
};
