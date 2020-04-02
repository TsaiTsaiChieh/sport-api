const express = require('express');
const envValues = require('../config/env_values');
const firebaseAdmin = require('firebase-admin');
const firebase = require('firebase');
const moment = require('moment');
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true, useDefaults: true });
const axios = require('axios');
const betsToken = envValues.betsToken;
const sportRadarKeys = envValues.sportRadarKeys;
const path = require('path');
const os = require('os');
const fs = require('fs');
const https = require('https');
const firestoreService = require('firestore-export-import');

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(envValues.cert),
  databaseURL: envValues.firebaseConfig.databaseURL,
  storageBucket: envValues.firebaseConfig.storageBucket
});
const bucket = firebaseAdmin
  .storage()
  .bucket(envValues.firebaseConfig.storageBucket);
const firestore = firebaseAdmin.firestore();
const database = firebaseAdmin.database();

function getSnapshot(collection, id) {
  return firestore
    .collection(collection)
    .doc(id)
    .get();
}

function getDoc(collection, id) {
  return firestore.collection(collection).doc(id);
}

function addDataInCollection(collection, data) {
  return firestore.collection(collection).add(data);
}
function addDataInCollectionWithId(collection, id, data) {
  return firestore
    .collection(collection)
    .doc(id)
    .set(data, { merge: true });
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
  prediction_NBA: 'prediction_NBA_TTC',
  prediction_SBL: 'prediction_SBL',
  prediction_MLB: 'prediction_MLB'
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
        match: db.basketball_NBA,
        prediction: db.prediction_NBA
      };
    case 'SBL':
      return {
        match: db.basketball_SBL,
        prediction: db.prediction_SBL
      };
    case 'MLB':
      return {
        match: db.baseball_MLB,
        prediction: db.prediction_MLB
      };
  }
}

function getTitlesPeriod(date) {
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
  weeks -= moment().weeks();

  for (let i = 0; i < Math.ceil(weeks / 2); i++) {
    const begin = moment(specificDate)
      .utcOffset(8)
      .add(i * 2, 'weeks')
      .valueOf();
    const end = moment(specificDate)
      .utcOffset(8)
      .add(i * 2 + 1, 'weeks')
      .endOf('isoWeek')
      .valueOf();
    if (begin <= date && date <= end)
      return {
        period: i,
        date: moment(specificDate)
          .utcOffset(8)
          .add(i * 2 - 2, 'weeks')
          .format('YYYYMMDD')
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
module.exports = {
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
  userStatusCodebook
};
