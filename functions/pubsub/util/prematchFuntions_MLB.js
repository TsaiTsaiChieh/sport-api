const modules = require('../../util/modules');
const firebaseAdmin = require('../../util/firebaseUtil').initial();
const firestore = firebaseAdmin.firestore();

module.exports.MLB_PRE = {
  upcoming: async function(date) {
    const _date = modules.dateFormat(date);
    const URL = `https://api.betsapi.com/v2/events/upcoming?sport_id=16&token=${modules.betsToken}&league_id=22259&day=${_date.year}${_date.month}${_date.day}`;
    console.log(`BetsAPI MLB_PRE URL on ${date}: ${URL}`);
    // axios
    const results = [];
    try {
      const { data } = await modules.axios(URL);
      if (data.results.length) {
        for (let i = 0; i < data.results.length; i++) {
          const ele = data.results[i];
          if (skipTeam(ele.home.id) && skipTeam(ele.away.id)) {
            results.push(
              firestore
                .collection(modules.db.baseball_MLB)
                .doc(ele.id)
                .set(repackage_bets(ele), { merge: true })
            );
            console.log(`BetsAPI: ${modules.db.baseball_MLB}(${ele.id})`);
          }
        }
      }
    } catch (error) {
      console.error(
        'Error in pubsub/util/prematchFunctions_MLB_PRE upcoming axios by TsaiChieh',
        error
      );
      return error;
    }
    // firestore
    return new Promise(async function(resolve, reject) {
      try {
        resolve(await Promise.all(results));
      } catch (error) {
        console.error(
          'Error in pubsub/util/prematchFunctions_MLB_PRE upcoming axios by TsaiChieh',
          error
        );
        reject(error);
      }
    });
  }
};
module.exports.MLB = {
  prematch: async function(date) {
    const _date = modules.dateFormat(date);
    // If query today information, it will return today or tomorrow information
    const URL = `http://api.sportradar.us/mlb/trial/v6.6/en/games/${_date.year}/${_date.month}/${_date.day}/schedule.json?api_key=${modules.sportRadarKeys.BASEBALL_MLB}`;
    console.log(`SportRadar MLB_PRE URL on ${date}: ${URL}`);
    try {
      const { data } = await modules.axios(URL);
      const querys = await query_MLB('flag.prematch', 0);
      for (let i = 0; i < data.games.length; i++) {
        const ele = data.games[i];
        integration(querys, ele, data.league);
      }
    } catch (error) {
      console.error(
        'Error in pubsub/util/prematchFunctions_MLB_PRE axios or query by Tsai-Chieh',
        error
      );
    }
  },
  lineups: async function(date) {
    const querys = await queryBeforeOneDay(date, 'flag.prematch', 1);
    const URL = 'http://api.sportradar.us/mlb/trial/v6.6/en/games';
    try {
      for (let i = 0; i < querys.length; i++) {
        const ele = querys[i];
        const completeURL = `${URL}/${ele.radar_id}/summary.json?api_key=${modules.sportRadarKeys.BASEBALL_MLB}`;
        // eslint-disable-next-line no-await-in-loop
        const { data } = await modules.axios.get(completeURL);
        console.log(
          `${modules.db.baseball_MLB}(${ele.bets_id}) - ${ele.away.alias_ch}(${
            ele.away.alias
          }):${ele.home.alias_ch}(${ele.home.alias}) at ${modules
            .moment(ele.scheduled._seconds * 1000)
            .utcOffset(8)
            .format('ll')}, URL: ${completeURL}`
        );
        firestore
          .collection(modules.db.baseball_MLB)
          .doc(ele.bets_id)
          .set(repackage_lineups(data), { merge: true });
      }
    } catch (error) {
      console.error(
        `Error in pubsub/util/prematchFunctions_MLB lineups function by TsaiChieh on ${new Date()}`,
        error
      );
    }
  },
  // eslint-disable-next-line consistent-return
  teamStat: async function(date) {
    const querys = await queryBeforeOneDay(date, 'flag.prematch', 1);
    const URL =
      'http://api.sportradar.us/mlb/trial/v6.6/en/seasons/2020/PRE/teams';
    for (let i = 0; i < querys.length; i++) {
      const ele = querys[i];
      const homeURL = `${URL}/${ele.home.radar_id}/statistics.json?api_key=${modules.sportRadarKeys.BASEBALL_MLB}`;
      const awayURL = `${URL}/${ele.away.radar_id}/statistics.json?api_key=${modules.sportRadarKeys.BASEBALL_MLB}`;
      try {
        // eslint-disable-next-line no-await-in-loop
        const homeTeam = await modules.axios.get(homeURL);
        // eslint-disable-next-line no-await-in-loop
        const awayTeam = await modules.axios.get(awayURL);
        console.log(`SportRadar URL: ${homeURL} on ${new Date()}`);
        console.log(`SportRadar URL: ${awayURL} on ${new Date()}`);
        firestore
          .collection(modules.db.baseball_MLB)
          .doc(ele.bets_id)
          .set(repackage_team(homeTeam.data, awayTeam.data), { merge: true });
      } catch (error) {
        console.error(
          `Error in pubsub/util/prematchFunctions_MLB teamStat function by TsaiChieh on ${new Date()}`,
          error
        );
        return error;
      }
    }
  }
};
function skipTeam(id) {
  id = Number.parseInt(id);
  switch (id) {
    case 1090:
    case 1222:
    case 1202:
    case 1217:
    case 1311:
    case 1091:
    case 1478:
    case 1310:
    case 1203:
    case 1088:
    case 1120:
    case 1089:
    case 1121:
    case 1216:
    case 1479:
    case 1369:
    case 1353:
    case 1108:
    case 1365:
    case 1146:
    case 1223:
    case 1186:
    case 1187:
    case 1364:
    case 1368:
    case 1147:
    case 1352:
    case 1109:
    case 1113:
    case 1112:
      return true;
    default:
      return false;
  }
}

function repackage_bets(ele) {
  return {
    update_time: firestore.Timestamp.fromDate(new Date(new Date())),
    bets_id: ele.id,
    scheduled: firestore.Timestamp.fromDate(new Date(Number.parseInt(ele.time) * 1000)),
    home: {
      alias: codebook(ele.home.id, ele.home.name).alias,
      alias_ch: codebook(ele.home.id, ele.home.name).alias_ch,
      name_ch: codebook(ele.home.id, ele.home.name).name_ch,
      image_id: ele.home.image_id,
      bets_id: ele.home.id
    },
    away: {
      alias: codebook(ele.away.id, ele.away.name).alias,
      alias_ch: codebook(ele.away.id, ele.away.name).alias_ch,
      name_ch: codebook(ele.away.id, ele.away.name).name_ch,
      image_id: ele.away.image_id,
      bets_id: ele.away.id
    },
    league: {
      bets_id: ele.league.id,
      nama: encodeSeason(ele.league.name)
    },
    flag: {
      spread: 0,
      totals: 0,
      status: 2,
      prematch: 0
    }
  };
}
// eslint-disable-next-line consistent-return
function encodeSeason(name) {
  name = name.toLowerCase();
  switch (name) {
    case 'exhibition games':
      return 'PRE';
    default:
      return name;
  }
}

// eslint-disable-next-line consistent-return
function codebook(id, name) {
  id = Number.parseInt(id);
  switch (id | name) {
    // American League-West
    case 1090 | 'LA Angels':
      return {
        alias: 'LAA',
        alias_ch: '天使',
        name_ch: '洛杉磯天使'
      };
    case 1222 | 'OAK Athletics':
      return {
        alias: 'OAK',
        alias_ch: '運動家',
        name_ch: '奧克蘭運動家'
      };
    case 1202 | 'SEA Mariners':
      return {
        alias: 'SEA',
        alias_ch: '水手',
        name_ch: '西雅圖水手'
      };
    case 1217 | 'HOU Astros':
      return {
        alias: 'HOU',
        alias_ch: '太空人',
        name_ch: '休士頓太空人'
      };
    case 1311 | 'TEX Rangers':
      return {
        alias: 'TEX',
        alias_ch: '遊騎兵',
        name_ch: '德州遊騎兵'
      };
    // American League-Central
    case 1091 | 'DET Tigers':
      return {
        alias: 'DET',
        alias_ch: '老虎',
        name_ch: '底特律老虎'
      };
    case 1478 | 'KC Royals':
      return {
        alias: 'KC',
        alias_ch: '皇家',
        name_ch: '堪薩斯皇家'
      };
    case 1310 | 'CLE Indians':
      return {
        alias: 'CLE',
        alias_ch: '印地安人',
        name_ch: '克里夫蘭印地安人'
      };
    case 1203 | 'CHI White Sox':
      return {
        alias: 'CWS',
        alias_ch: '白襪',
        name_ch: '芝加哥白襪'
      };
    case 1088 | 'MIN Twins':
      return {
        alias: 'MIN',
        alias_ch: '雙城',
        name_ch: '明尼蘇達雙城'
      };
    // American League-East
    case 1120 | 'BAL Orioles':
      return {
        alias: 'BAL',
        alias_ch: '金鶯',
        name_ch: '巴爾的摩金鶯'
      };
    case 1089 | 'TOR Blue Jays':
      return {
        alias: 'TOR',
        alias_ch: '藍鳥',
        name_ch: '多倫多藍鳥'
      };
    case 1121 | 'NY Yankees':
      return {
        alias: 'NYY',
        alias_ch: '洋基',
        name_ch: '紐約洋基'
      };
    case 1216 | 'TB Rays':
      return {
        alias: 'TB',
        alias_ch: '光芒',
        name_ch: '坦帕灣光芒'
      };
    case 1479 | 'BOS Red Sox':
      return {
        alias: 'BOS',
        alias_ch: '紅襪',
        name_ch: '波士頓紅襪'
      };
    // National League-West
    case 1369 | 'LA Dodgers':
      return {
        alias: 'LAD',
        alias_ch: '道奇',
        name_ch: '洛杉磯道奇'
      };
    case 1353 | 'SF Giants':
      return {
        alias: 'SF',
        alias_ch: '巨人',
        name_ch: '舊金山巨人'
      };
    case 1108 | 'SD Padres':
      return {
        alias: 'SD',
        alias_ch: '教士',
        name_ch: '聖地牙哥教士'
      };
    case 1365 | 'ARI Diamondbacks':
      return {
        alias: 'ARI',
        alias_ch: '響尾蛇',
        name_ch: '亞利桑納響尾蛇'
      };
    case 1146 | 'COL Rockies':
      return {
        alias: 'COL',
        alias_ch: '落磯',
        name_ch: '科羅拉多落磯'
      };
    // National League-Central
    case 1223 | 'STL Cardinals':
      return {
        alias: 'STL',
        alias_ch: '紅雀',
        name_ch: '聖路易紅雀'
      };
    case 1186 | 'PIT Pirates':
      return {
        alias: 'PIT',
        alias_ch: '海盜',
        name_ch: '匹茲堡海盜'
      };
    case 1187 | 'MIL Brewers':
      return {
        alias: 'MIL',
        alias_ch: '釀酒人',
        name_ch: '密爾瓦基釀酒人'
      };
    case 1364 | 'CIN Reds':
      return {
        alias: 'CIN',
        alias_ch: '紅人',
        name_ch: '辛辛那提紅人'
      };
    case 1368 | 'CHI Cubs':
      return {
        alias: 'CHC',
        alias_ch: '小熊',
        name_ch: '芝加哥小熊'
      };
    // National League-East
    case 1147 | 'WAS Nationals':
      return {
        alias: 'WSH',
        alias_ch: '國民',
        name_ch: '華盛頓國民'
      };
    case 1352 | 'ATL Braves':
      return {
        alias: 'ATL',
        alias_ch: '勇士',
        name_ch: '亞特蘭大勇士'
      };
    case 1109 | 'MIA Marlins':
      return {
        alias: 'MIA',
        alias_ch: '馬林魚',
        name_ch: '邁阿密馬林魚'
      };
    case 1113 | 'NY Mets':
      return {
        alias: 'NYM',
        alias_ch: '大都會',
        name_ch: '紐約大都會'
      };
    case 1112 | 'PHI Phillies':
      return {
        alias: 'PHI',
        alias_ch: '費城人',
        name_ch: '費城費城人'
      };
  }
}

async function query_MLB(flag, value) {
  const eventsRef = firestore.collection(modules.db.baseball_MLB);
  const results = [];

  try {
    const query = await eventsRef.where(flag, '==', value).get();
    query.forEach(async function(ele) {
      results.push(ele.data());
    });
    await Promise.all(results);
    return results;
  } catch (error) {
    console.error(
      `Error in pubsub/util/prematchFunctions_MLB query_MLB function by TsaiChieh on ${new Date()}`,
      error
    );
    return error;
  }
}

function integration(query, ele, league) {
  // query is BetsAPI saved in firestore, ele is SportRadar returned
  const raderSeconds = modules.moment(ele.scheduled).valueOf() / 1000;
  for (let i = 0; i < query.length; i++) {
    if (
      (raderSeconds === query[i].scheduled._seconds &&
        ele.home.abbr.toUpperCase() === query[i].home.alias &&
        ele.away.abbr.toUpperCase() === query[i].away.alias) ||
      (raderSeconds === query[i].scheduled._seconds &&
        ele.home.abbr.toUpperCase() === query[i].away.alias &&
        ele.away.abbr.toUpperCase() === query[i].home.alias)
    ) {
      firestore
        .collection(modules.db.baseball_MLB)
        .doc(query[i].bets_id)
        .set(repackage_sportradar(ele, query[i], league), { merge: true });
      console.log(
        `SportRadar: ${modules.db.baseball_MLB}(${query[i].bets_id})`
      );
    }
  }
}

function repackage_sportradar(ele, query, league) {
  const homeFlag = ele.home.abbr.toUpperCase() === query.home.alias;
  const awayFlag = ele.away.abbr.toUpperCase() === query.away.alias;
  return {
    update_time: firestore.Timestamp.fromDate(new Date(Date.now())),
    radar_id: ele.id,
    league: {
      radar_id: league.id
    },
    home: {
      alias: `${homeFlag ? query.home.alias : query.away.alias}`,
      alias_ch: `${homeFlag ? query.home.alias_ch : query.away.alias_ch}`,
      name_ch: `${homeFlag ? query.home.name_ch : query.away.name_ch}`,
      image_id: `${homeFlag ? query.home.image_id : query.away.image_id}`,
      bets_id: `${homeFlag ? query.home.bets_id : query.away.bets_id}`,
      radar_id: ele.home.id,
      name: `${ele.home.market} ${ele.home.name}`
    },
    away: {
      alias: `${awayFlag ? query.away.alias : query.home.alias}`,
      alias_ch: `${awayFlag ? query.away.alias_ch : query.home.alias_ch}`,
      name_ch: `${awayFlag ? query.away.name_ch : query.home.name_ch}`,
      image_id: `${awayFlag ? query.away.image_id : query.home.image_id}`,
      bets_id: `${awayFlag ? query.away.bets_id : query.home.bets_id}`,
      radar_id: ele.away.id,
      name: `${ele.away.market} ${ele.away.name}`
    },
    venue: {
      name: ele.venue.name,
      city: ele.venue.city,
      country: ele.venue.country
    },
    flag: {
      prematch: 1
    }
  };
}

async function queryBeforeOneDay(date, flag, value) {
  const eventsRef = firestore.collection(modules.db.baseball_MLB);
  const results = [];
  try {
    const querys = await eventsRef
      .where(flag, '==', value)
      .where('scheduled', '>=', modules.moment(date))
      .where('scheduled', '<=', modules.moment(date).add(24, 'hours'))
      .get();
    querys.docs.map(function(docs) {
      results.push(docs.data());
    });
    return await Promise.all(results);
  } catch (error) {
    console.error(
      `Error in pubsub/util/prematchFunctions_MLB queryBeforeOneDay function by TsaiChieh on ${new Date()}`,
      error
    );
    return error;
  }
}

// eslint-disable-next-line consistent-return
function repackage_lineups(ele) {
  if (ele.game.home.probable_pitcher && ele.game.away.probable_pitcher) {
    const homePitcher = ele.game.home.probable_pitcher;
    const awayPitcher = ele.game.away.probable_pitcher;
    return {
      lineups: {
        home: {
          pitcher: {
            name: homePitcher.preferred_name,
            first_name: homePitcher.first_name,
            last_name: homePitcher.last_name,
            jersey_number: `${
              homePitcher.jersey_number ? homePitcher.jersey_number : '-'
            }`,
            id: homePitcher.id,
            win: homePitcher.win,
            loss: homePitcher.loss,
            era: homePitcher.era
          }
        },
        away: {
          pitcher: {
            name: awayPitcher.preferred_name,
            first_name: awayPitcher.first_name,
            last_name: awayPitcher.last_name,
            jersey_number: `${
              awayPitcher.jersey_number ? awayPitcher.jersey_number : '-'
            }`,
            id: awayPitcher.id,
            win: awayPitcher.win,
            loss: awayPitcher.loss,
            era: awayPitcher.era
          }
        }
      }
    };
  } else if (ele.game.home.probable_pitcher) {
    const homePitcher = ele.game.home.probable_pitcher;
    return {
      lineups: {
        home: {
          pitcher: {
            name: homePitcher.preferred_name,
            first_name: homePitcher.first_name,
            last_name: homePitcher.last_name,
            jersey_number: `${
              homePitcher.jersey_number ? homePitcher.jersey_number : '-'
            }`,
            id: homePitcher.id,
            win: homePitcher.win,
            loss: homePitcher.loss,
            era: homePitcher.era
          }
        }
      }
    };
  } else if (ele.game.away.probable_pitcher) {
    const awayPitcher = ele.game.away.probable_pitcher;
    return {
      lineups: {
        home: {
          pitcher: {
            name: awayPitcher.preferred_name,
            first_name: awayPitcher.first_name,
            last_name: awayPitcher.last_name,
            jersey_number: `${
              awayPitcher.jersey_number ? awayPitcher.jersey_number : '-'
            }`,
            id: awayPitcher.id,
            win: awayPitcher.win,
            loss: awayPitcher.loss,
            era: awayPitcher.era
          }
        }
      }
    };
  } else return {};
}
function repackage_team(homeData, awayData) {
  return {
    stat: {
      update_time: firestore.Timestamp.fromDate(new Date(new Date())),
      home: {
        r: homeData.statistics.hitting.overall.runs.total,
        h: homeData.statistics.hitting.overall.onbase.h,
        hr: homeData.statistics.hitting.overall.onbase.hr,
        avg: Number.parseFloat(homeData.statistics.hitting.overall.avg),
        obp: homeData.statistics.hitting.overall.obp,
        slg: homeData.statistics.hitting.overall.slg
      },
      away: {
        r: awayData.statistics.hitting.overall.runs.total,
        h: awayData.statistics.hitting.overall.onbase.h,
        hr: awayData.statistics.hitting.overall.onbase.hr,
        avg: Number.parseFloat(awayData.statistics.hitting.overall.avg),
        obp: awayData.statistics.hitting.overall.obp,
        slg: awayData.statistics.hitting.overall.slg
      }
    }
  };
}
