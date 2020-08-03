const axios = require('axios');
const cheerio = require('cheerio');
const AppErrors = require('./AppErrors');
const firebaseAdmin = require('./firebaseUtil');
const firestore = firebaseAdmin().firestore();
const logger = require('firebase-functions/lib/logger');

function crawler(URL) {
  return new Promise(async function(resolve, reject) {
    try {
      const { data } = await axios.get(URL);
      const $ = cheerio.load(data); // load in the HTML
      return resolve($);
    } catch (err) {
      return reject(new AppErrors.CrawlersError(err.stack));
    }
  });
}

function getDataByAxios(URL) {
  return new Promise(async function(resolve, reject) {
    try {
      const { data } = await axios.get(URL);
      return resolve(data);
    } catch (err) {
      return reject(new AppErrors.AxiosError(err.stack));
    }
  });
}

function setDataToFirestore(data, configs) {
  return new Promise(async function(resolve, reject) {
    try {
      const { season, fieldName, collectionName, teamId } = configs;
      const temp = {};
      temp[`season_${season}`] = {};
      temp[`season_${season}`][fieldName] = data;
      await firestore.collection(collectionName).doc(teamId).set(temp, { merge: true });
      return resolve();
    } catch (err) {
      return reject(new AppErrors.FirebaseCollectError(err.stack));
    }
  });
}

function insertTeamNameToFirestore(data, configs) {
  return new Promise(async function(resolve, reject) {
    try {
      const { collectionName, teamId } = configs;
      await firestore.collection(collectionName).doc(teamId).set({ alias: data }, { merge: true });
      return resolve();
    } catch (err) {
      return reject(new AppErrors.FirebaseCollectError(err.stack));
    }
  });
}

function debugLogger(configs) {
  const { league, teamId, teamName, fieldName } = configs;
  logger.debug(`棒球 ${league} 更新 ${fieldName}：隊伍 ${teamName}(${teamId}) 完成`);
}

module.exports = {
  crawler,
  getDataByAxios,
  setDataToFirestore,
  insertTeamNameToFirestore,
  debugLogger
};
