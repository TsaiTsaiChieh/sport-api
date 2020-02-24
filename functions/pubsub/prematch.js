/* eslint-disable consistent-return */
// const express = require('express');
// const router = express.Router();
const modules = require('../util/modules');
const nba_api_key = '48v65d232xsk2am8j6yu693v';
const global_api_key = 'n8bam2aeabvh358r8g6k83dj';
// for BetsAPI
const league_id = [2274, 8251]; // NBA, SBL
// Just for NBA & SBL now
// upcomming is BetsAPI, prematch is for sportradar
async function prematch() {
  const date = modules
    .moment()
    .add(1, 'days')
    // .subtract(1, 'days')
    .format('YYYY-MM-DD');
  const yesterday = modules
    .moment()
    // .subtract(1, 'days')
    .format('YYYY-MM-DD');
  // const yesterday = '2020-02-21';
  // const date = dateFormat(currentDate);
  // const date = '2020-02-22';

  upcomming_NBA(date);
  prematch_NBA(yesterday);
  // upcomming_SBL(date);
  // prematch_SBL(date);
  // for endpoint test
  // const results = await prematchForSBL(date);
  // res.json(results);
}
// eslint-disable-next-line consistent-return
async function upcomming_NBA(date) {
  const date_ = dateFormat(date);
  const URL = `https://api.betsapi.com/v2/events/upcoming?sport_id=18&token=${modules.betsToken}&league_id=${league_id[0]}&day=${date_.year}${date_.month}${date_.day}`;
  console.log(`BetsAPI NBA URL on ${date}: ${URL}`);
  // axios
  const results = [];
  try {
    const { data } = await modules.axios(URL);
    for (let i = 0; i < data.results.length; i++) {
      let ele = data.results[i];
      results.push(
        modules.firestore
          .collection(modules.db.bets_18)
          .doc(ele.id)
          .set(repackage_NBA_bets(ele), { merge: true })
      );
      console.log(`BetsAPI NBA match id: ${ele.id}`);
    }
  } catch (error) {
    console.log(
      'Error in pubsub/prematch upcomming_NBA axios by TsaiChieh',
      error
    );
    return error;
  }
  // firestore
  try {
    await Promise.all(results);
  } catch (error) {
    console.log(
      'Error in pubsub/prematch upcomming_NBA function by TsaiChieh',
      error
    );
    return error;
  }
}
function repackage_NBA_bets(ele) {
  data = {};
  data.scheduled = modules.firebaseAdmin.firestore.Timestamp.fromDate(
    new Date(Number.parseInt(ele.time) * 1000)
  );
  data.bets_id = ele.id;
  data.home = {
    alias: encode_NBA(ele.home.name),
    image_id: ele.home.image_id,
    bets_id: ele.home.id
  };
  data.away = {
    alias: encode_NBA(ele.away.name),
    image_id: ele.away.image_id,
    bets_id: ele.away.id
  };
  data.league = {
    bets_id: ele.league.id,
    name: ele.league.name.toUpperCase()
  };
  data.flag = {
    spread: 0,
    totals: 0,
    status: 2
  };
  return data;
}
function codebook_NBA(alias) {
  switch (alias) {
    // 大西洋組
    case 'BOS':
      return {
        name_ch: '波士頓塞爾提克',
        alias_ch: '塞爾提'
      };
    case 'BKN':
      return {
        name_ch: '布魯克林籃網',
        alias_ch: '籃網'
      };
    case 'NYK':
      return {
        name_ch: '紐約尼克',
        alias_ch: '尼克'
      };
    case 'PHI':
      return {
        name_ch: '費城76人',
        alias_ch: '76人'
      };
    case 'TOR':
      return {
        name_ch: '多倫多暴龍',
        alias_ch: '暴龍'
      };
    // 中央組
    case 'CHI':
      return {
        name_ch: '芝加哥公牛',
        alias_ch: '公牛'
      };
    case 'CLE':
      return {
        name_ch: '克里夫蘭騎士',
        alias_ch: '騎士'
      };
    case 'DET':
      return {
        name_ch: '底特律活塞',
        alias_ch: '活塞'
      };
    case 'IND':
      return {
        name_ch: '印地安那溜馬',
        alias_ch: '溜馬'
      };
    case 'MIL':
      return {
        name_ch: '密爾瓦基公鹿',
        alias_ch: '公鹿'
      };
    // 東南組
    case 'ATL':
      return {
        name_ch: '亞特蘭大老鷹',
        alias_ch: '老鷹'
      };
    case 'CHA':
      return {
        name_ch: '夏洛特黃蜂',
        alias_ch: '黃蜂'
      };
    case 'MIA':
      return {
        name_ch: '邁阿密熱火',
        alias_ch: '熱火'
      };
    case 'ORL':
      return {
        name_ch: '奧蘭多魔術',
        alias_ch: '魔術'
      };
    case 'WAS':
      return {
        name_ch: '華盛頓巫師',
        alias_ch: '巫師'
      };
    // 西北組
    case 'DEN':
      return {
        name_ch: '亞特蘭大老鷹',
        alias_ch: '老鷹'
      };
    case 'MIN':
      return {
        name_ch: '明尼蘇達灰狼',
        alias_ch: '灰狼'
      };
    case 'POR':
      return {
        name_ch: '波特蘭拓荒者',
        alias_ch: '拓荒者'
      };
    case 'OKC':
      return {
        name_ch: '奧克拉荷馬雷霆',
        alias_ch: '雷霆'
      };
    case 'UTA':
      return {
        name_ch: '猶他爵士',
        alias_ch: '爵士'
      };
    // 太平洋組
    case 'GSW':
      return {
        name_ch: '金州勇士',
        alias_ch: '勇士'
      };
    case 'LAC':
      return {
        name_ch: '洛杉磯快艇',
        alias_ch: '快艇'
      };
    case 'LAL':
      return {
        name_ch: '洛杉磯湖人',
        alias_ch: '湖人'
      };
    case 'PHX':
      return {
        name_ch: '鳳凰城太陽',
        alias_ch: '太陽'
      };
    case 'SAC':
      return {
        name_ch: '沙加緬度國王',
        alias_ch: '國王'
      };
    // 西南組
    case 'HOU':
      return {
        name_ch: '休士頓火箭',
        alias_ch: '火箭'
      };
    case 'DAL':
      return {
        name_ch: '達拉斯獨行俠',
        alias_ch: '獨行俠'
      };
    case 'MEM':
      return {
        name_ch: '孟菲斯灰熊',
        alias_ch: '灰熊'
      };
    case 'SAS':
      return {
        name_ch: '聖安東尼奧馬刺',
        alias_ch: '馬刺'
      };
    case 'NOP':
      return {
        name_ch: '新奧爾良鵜鶘',
        alias_ch: '鵜鶘'
      };
  }
}
function encode_NBA(name) {
  name = name.toLowerCase();
  switch (name) {
    case 'gs warriors':
      return 'GSW';
    case 'sa spurs':
      return 'SAS';
    case 'la clippers':
      return 'LAC';
    case 'la lakers':
      return 'LAL';
    case 'ny knicks':
      return 'NYK';
    case 'no pelicans':
      return 'NOP';
    default:
      return name.substring(0, 3).toUpperCase();
  }
}
async function prematch_NBA(date) {
  const date_ = dateFormat(date);
  // If query today information, it will return tomorrow information
  const URL = `http://api.sportradar.us/nba/trial/v7/en/games/${date_.year}/${date_.month}/${date_.day}/schedule.json?api_key=${nba_api_key}`;
  console.log(`SportRadarAPI NBA URL on ${date}: ${URL}`);
  try {
    const { data } = await modules.axios(URL);
    const query = await query_NBA(date);
    // for (let i = 0; i < data.games.length; i++) {
    for (let i = 0; i < data.games.length; i++) {
      let ele = data.games[i];
      integration_NBA(query, ele, data.league);
    }
  } catch (error) {
    console.log(
      'error happened in pubsub/prematch/prematch_NBA axios or query by Tsai-Chieh',
      error
    );
  }
}
function integration_NBA(query, ele, league) {
  // query is BetsAPI saved in firestore, ele is SportRadar returned
  const milliseconds = modules.moment(ele.scheduled).valueOf() / 1000;
  for (let i = 0; i < query.length; i++) {
    const subFiveMins =
      modules
        .moment(query[i].scheduled._seconds * 1000)
        .subtract(5, 'minute')
        .valueOf() / 1000;
    if (
      (subFiveMins <= milliseconds &&
        milliseconds <= query[i].scheduled._seconds &&
        ele.home.alias.toUpperCase() === query[i].home.alias) ||
      ele.home.alias.toUpperCase() === query[i].away.alias
    ) {
      modules.firestore
        .collection(modules.db.bets_18)
        .doc(query[i].bets_id)
        .set(repackage_NBA_sportradar(ele, league), { merge: true });
    }
  }
}
async function query_NBA(date) {
  const basketRef = modules.firestore.collection(modules.db.bets_18);
  const beginningDate = modules.moment(date).add(1, 'days');
  const endDate = modules.moment(date).add(2, 'days');
  const results = [];
  try {
    const query = await basketRef
      .where('league.name', '==', 'NBA')
      .where('scheduled', '>=', beginningDate)
      .where('scheduled', '<', endDate)
      .get();

    query.forEach(async function(ele) {
      results.push(ele.data());
    });
    await Promise.all(results);
    return results;
  } catch (error) {
    console.log('Error in pubsub/prematch integration function by TsaiChieh');
    return error;
  }
}
function repackage_NBA_sportradar(ele, league) {
  data = {};
  data.update_time = modules.firebaseAdmin.firestore.Timestamp.fromDate(
    new Date()
  );
  data.radar_id = ele.id;
  // data.status = ele.status;
  data.scheduled = modules.firebaseAdmin.firestore.Timestamp.fromDate(
    new Date(ele.scheduled)
  );
  data.league = {
    radar_id: league.id
  };
  data.home = {
    name: ele.home.name,
    alias: ele.home.alias,
    radar_id: ele.home.id
  };
  data.home.name_ch = codebook_NBA(data.home.alias).name_ch;
  data.home.alias_ch = codebook_NBA(data.home.alias).alias_ch;
  data.away = {
    name: ele.away.name,
    alias: ele.away.alias,
    radar_id: ele.away.id
  };
  data.away.name_ch = codebook_NBA(data.away.alias).name_ch;
  data.away.alias_ch = codebook_NBA(data.away.alias).alias_ch;
  data.venue = {
    name: ele.venue.name,
    city: ele.venue.city,
    country: ele.venue.country
  };
  if (ele.home.sr_id) data.home.sr_id = ele.home.sr_id;
  if (ele.away.sr_id) data.away.sr_id = ele.away.sr_id;
  if (ele.sr_id) data.sr_id = ele.sr_id;
  console.log(data);
  return data;
}
// eslint-disable-next-line consistent-return
async function upcomming_SBL(date) {
  const date_ = dateFormat(date);
  const URL = `https://api.betsapi.com/v2/events/upcoming?sport_id=18&token=${modules.betsToken}&league_id=${league_id[1]}&day=${date_.year}${date_.month}${date_.day}`;
  console.log(`BetsAPI SBL URL: ${URL}`);
  // axios
  const results = [];
  try {
    const { data } = await modules.axios(URL);
    for (let i = 0; i < data.results.length; i++) {
      let ele = data.results[i];
      results.push(
        modules.firestore
          .collection(modules.db.bets_18)
          .doc(ele.id)
          .set(repackage_SBL_bets(ele), { merge: true })
      );
      console.log(`BetsAPI SBL match id: ${ele.id}`);
    }
  } catch (error) {
    console.log(
      'Error in pubsub/prematch upcomming_SBL axios by TsaiChieh',
      error
    );
    return error;
  }
  // firestore
  try {
    await Promise.all(results);
  } catch (error) {
    console.log(
      'Error in pubsub/prematch upcomming_SBL function by TsaiChieh',
      error
    );
    return error;
  }
}
function repackage_SBL_bets(ele) {
  data = {};
  data.scheduled = modules.firebaseAdmin.firestore.Timestamp.fromDate(
    new Date(Number.parseInt(ele.time) * 1000)
  );
  data.bets_id = ele.id;
  data.home = {
    alias: encode_SBL(ele.home.name, ele.home.id),
    // image_id: ele.home.image_id,
    bets_id: ele.home.id
  };
  data.away = {
    alias: encode_SBL(ele.away.name, ele.away.id),
    // image_id: ele.away.image_id,
    bets_id: ele.away.id
  };
  data.league = {
    bets_id: ele.league.id,
    name: ele.league.name.toUpperCase().replace('CHINESE TAIPEI ', '')
  };
  data.flag = {
    spread: 0,
    totals: 0,
    status: 2
  };
  return data;
}
// eslint-disable-next-line consistent-return
function encode_SBL(name, id) {
  name = name.toLowerCase();
  id = Number.parseInt(id);
  if (name === 'pauian' || id === 54440) return 'PAR';
  else if (name === 'taiwan beer' || id === 193059) return 'TAI';
  else if (name === 'yulon' || id === 192998) return 'YUL';
  else if (name === 'jeoutai basketball' || id === 303666) return 'JEO';
  else if (name === 'bank of taiwan' || id === 193057) return 'BAN';
}
async function prematch_SBL(date) {
  const date_ = dateFormat(date);
  // If query today information, it will return today information
  const sportRadarURL = `http://api.sportradar.us/basketball/trial/v2/en/schedules/${date_.year}-${date_.month}-${date_.day}/summaries.json?api_key=${global_api_key}`;
  // const sportRadarURL = `http://api.sportradar.us/basketball/trial/v2/en/schedules/${year}-03-07/summaries.json?api_key=${global_api_key}`;
  try {
    const { data } = await modules.axios(sportRadarURL);
    const query = await query_SBL(date);

    for (let i = 0; i < data.summaries.length; i++) {
      const ele = data.summaries[i];
      if (ele.sport_event.sport_event_context !== undefined) {
        if (
          ele.sport_event.sport_event_context.competition.name.toUpperCase() ===
          'SBL'
        ) {
          integration_SBL(query, ele);
          console.log(
            `match_id: ${ele.sport_event.id.replace('sr:sport_event:', '')}`
          );
        }
      }
    }
  } catch (error) {
    console.log(
      'error happened in pubsub/prematch/prematch_SBL axios or query by Tsai-Chieh',
      error
    );
    return error;
  }
  // const result = `Daily Schedule in SBL on ${date} +1 successful, URL: ${sportRadarURL}`;
  // console.log(result);
  // return result;
}
async function query_SBL(date) {
  const basketRef = modules.firestore.collection(modules.db.bets_18);
  const beginningDate = modules.moment(date);
  const endDate = modules.moment(date).add(1, 'days');
  const results = [];
  try {
    const query = await basketRef
      .where('league.name', '==', 'SBL')
      .where('scheduled', '>=', beginningDate)
      .where('scheduled', '<', endDate)
      .get();

    query.forEach(async function(ele) {
      results.push(ele.data());
    });
    await Promise.all(results);
    return results;
  } catch (error) {
    console.log('Error in pubsub/prematch integration function by TsaiChieh');
    return error;
  }
}
function integration_SBL(query, ele) {
  // query is BetsAPI saved in firestore, ele is SportRadar returned
  const milliseconds =
    modules.moment(ele.sport_event.start_time).valueOf() / 1000;
  // const results = [];
  for (let i = 0; i < query.length; i++) {
    if (
      milliseconds === query[i].scheduled._seconds &&
      ele.sport_event.competitors[0].abbreviation === query[i].home.alias
    ) {
      modules.firestore
        .collection(modules.db.bets_18)
        .doc(query[i].bets_id)
        .set(repackage_SBL_sportradar(ele), { merge: true });
    }
  }
}
function repackage_SBL_sportradar(ele) {
  data = {};
  data.radar_id = ele.sport_event.id.replace('sr:sport_event:', '');
  data.update_time = modules.firebaseAdmin.firestore.Timestamp.fromDate(
    new Date()
  );
  data.league = {
    radar_id: ele.sport_event.sport_event_context.competition.id,
    name: ele.sport_event.sport_event_context.competition.name.toUpperCase()
  };
  data.home = {
    radar_id: ele.sport_event.competitors[0].id,
    name: ele.sport_event.competitors[0].name
  };
  data.away = {
    radar_id: ele.sport_event.competitors[1].id,
    name: ele.sport_event.competitors[1].name
  };
  return data;
}

function dateFormat(date) {
  return {
    year: date.substring(0, 4),
    month: date.substring(5, 7),
    day: date.substring(8, 10)
  };
}
module.exports = prematch;
