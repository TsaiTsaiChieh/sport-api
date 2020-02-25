/* eslint-disable consistent-return */
// const express = require('express');
// const router = express.Router();
const modules = require('../util/modules');
const NBA_api_key = '48v65d232xsk2am8j6yu693v';
const global_api_key = 'n8bam2aeabvh358r8g6k83dj';
const NBA_functions = require('./util/prematchFunctions_NBA');
const SBL_functions = require('./util/prematchFunctions_SBL');
// for BetsAPI
const league_id = [2274, 8251]; // NBA, SBL
// Just for NBA & SBL now
// upcomming is BetsAPI, prematch is for sportradar
async function prematch() {
  const date = modules
    .moment()
    .add(1, 'days')
    .format('YYYY-MM-DD');
  const yesterday = modules
    .moment()
    // .subtract(1, 'days')
    .format('YYYY-MM-DD');
  // const yesterday = '2020-02-21';
  // const date = '2020-02-22';
  // NBA
  try {
    await NBA_functions.NBA.upcomming(date, league_id[0]);
    NBA_functions.NBA.prematch(yesterday, NBA_api_key);
  } catch (error) {
    console.log(error);
  }
  // const test_date = '2020-03-07';
  try {
    await SBL_functions.SBL.upcomming(date, league_id[1]);
    SBL_functions.SBL.prematch(date, global_api_key);
  } catch (error) {
    console.log(error);
  }
}

module.exports = prematch;
