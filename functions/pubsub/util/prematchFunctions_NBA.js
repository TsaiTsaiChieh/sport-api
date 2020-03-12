const modules = require('../../util/modules');

module.exports.NBA = {};
// eslint-disable-next-line consistent-return
module.exports.NBA.upcomming = async function(date) {
  const _date = modules.dateFormat(date);
  const URL = `https://api.betsapi.com/v2/events/upcoming?sport_id=18&token=${modules.betsToken}&league_id=2274&day=${_date.year}${_date.month}${_date.day}`;
  console.log(`BetsAPI NBA URL on ${date}: ${URL}`);
  // axios
  const results = [];
  try {
    const { data } = await modules.axios(URL);
    for (let i = 0; i < data.results.length; i++) {
      let ele = data.results[i];
      results.push(
        modules.firestore
          .collection(modules.db.basketball_NBA)
          .doc(ele.id)
          .set(repackage_bets(ele), { merge: true })
      );
      console.log(`BetsAPI NBA match id: ${ele.id}`);
    }
  } catch (error) {
    console.error(
      `Error in pubsub/util/prematchFunctions_NBA upcomming axios by TsaiChieh on ${Date.now()}`,
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
        `Error in pubsub/util/prematchFunctions_NBA upcomming function by TsaiChieh on ${Date.now()}`,
        error
      );
      reject(error);
    }
  });
};
function repackage_bets(ele) {
  return {
    update_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(new Date()),
    scheduled: modules.firebaseAdmin.firestore.Timestamp.fromDate(
      new Date(Number.parseInt(ele.time) * 1000)
    ),
    bets_id: ele.id,
    home: {
      alias: encode(ele.home.name),
      image_id: ele.home.image_id,
      bets_id: ele.home.id
    },
    away: {
      alias: encode(ele.away.name),
      image_id: ele.away.image_id,
      bets_id: ele.away.id
    },
    league: {
      bets_id: ele.league.id,
      name: ele.league.name.toUpperCase()
    },
    flag: {
      spread: 0,
      totals: 0,
      status: 2,
      lineup: 0
    }
  };
}
function encode(name) {
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
module.exports.NBA.prematch = async function(date) {
  const _date = modules.dateFormat(date);
  // If query today information, it will return tomorrow information
  const URL = `http://api.sportradar.us/nba/trial/v7/en/games/${_date.year}/${_date.month}/${_date.day}/schedule.json?api_key=${modules.sportRadarKeys.BASKETBALL_NBA}`;
  console.log(`SportRadarAPI NBA URL on ${date}: ${URL}`);
  try {
    const { data } = await modules.axios(URL);
    const query = await query_NBA(date);

    for (let i = 0; i < data.games.length; i++) {
      let ele = data.games[i];
      integration(query, ele, data.league);
      console.log(`SportRadar NBA match_id: ${ele.id}`);
    }
  } catch (error) {
    console.error(
      `error happened in pubsub/util/prematchFunctions_NBA axios or query by Tsai-Chieh on ${Date.now()}`,
      error
    );
  }
};
function integration(query, ele, league) {
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
        .collection(modules.db.basketball_NBA)
        .doc(query[i].bets_id)
        .set(repackage_sportradar(ele, query[i], league), { merge: true });
    }
  }
}
async function query_NBA(date) {
  const eventsRef = modules.firestore.collection(modules.db.basketball_NBA);
  const beginningDate = modules.moment(date).add(1, 'days');
  const endDate = modules.moment(date).add(2, 'days');
  const results = [];
  try {
    const query = await eventsRef
      .where('scheduled', '>=', beginningDate)
      .where('scheduled', '<=', endDate)
      .get();

    query.forEach(async function(ele) {
      results.push(ele.data());
    });
    await Promise.all(results);
    return results;
  } catch (error) {
    console.error(
      'Error in pubsub/util/prematchFunctions_NBA query_NBA function by TsaiChieh',
      error
    );
    return error;
  }
}
function repackage_sportradar(ele, query, league) {
  const homeFlag = ele.home.alias.toUpperCase() === query.home.alias;
  const awayFlag = ele.away.alias.toUpperCase() === query.away.alias;
  const data = {
    update_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(new Date()),
    scheduled: modules.firebaseAdmin.firestore.Timestamp.fromDate(
      new Date(ele.scheduled)
    ),
    radar_id: ele.id,
    home: {
      alias: ele.home.alias,
      alias_ch: codebook(ele.home.alias).alias_ch,
      name: ele.home.name,
      name_ch: codebook(ele.home.alias).name_ch,
      bets_id: `${homeFlag ? query.home.bets_id : query.away.bets_id}`,
      radar_id: ele.home.id,
      image_id: `${homeFlag ? query.home.image_id : query.away.image_id}`
    },
    away: {
      alias: ele.away.alias,
      alias_ch: codebook(ele.away.alias).alias_ch,
      name: ele.away.name,
      name_ch: codebook(ele.away.alias).name_ch,
      bets_id: `${awayFlag ? query.away.bets_id : query.home.bets_id}`,
      radar_id: ele.away.id,
      image_id: `${awayFlag ? query.away.image_id : query.home.image_id}`
    },
    league: {
      radar_id: league.id
    },
    venue: {
      name: ele.venue.name,
      city: ele.venue.city,
      country: ele.venue.country
    }
  };
  if (ele.sr_id) data.sr_id = ele.sr_id;
  return data;
}
// eslint-disable-next-line consistent-return
function codebook(alias) {
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
module.exports.NBA.lineup = async function(date) {
  const querys = await query_before40Min(date);
  const URL = `https://api.sportradar.us/nba/trial/v7/en/games`;
  try {
    for (let i = 0; i < querys.length; i++) {
      const ele = querys[i];
      const completeURL = `${URL}/${ele.radar_id}/summary.json?api_key=${modules.sportRadarKeys.BASKETBALL_NBA}`;
      // eslint-disable-next-line no-await-in-loop
      const { data } = await modules.axios.get(completeURL);
      console.log(
        `${modules.db.basketball_NBA}(${ele.bets_id}) - ${ele.away.alias_ch}(${
          ele.away.alias
        }):${ele.home.alias_ch}(${ele.home.alias}) at ${modules
          .moment(ele.scheduled._seconds * 1000)
          .format('llll')}, URL: ${completeURL}`
      );
      modules.firestore
        .collection(modules.db.basketball_NBA)
        .doc(querys[i].bets_id)
        .set(repackage_lineup(data), { merge: true });
    }
  } catch (error) {
    console.error(
      'Error in pubsub/util/prematchFunctions_NBA lineup function by TsaiChieh',
      error
    );
  }
};
async function query_before40Min(date) {
  const eventsRef = modules.firestore.collection(modules.db.basketball_NBA);
  const results = [];

  try {
    const query = await eventsRef
      .where('scheduled', '>=', date)
      .where('scheduled', '<=', modules.moment().add(40, 'minutes'))
      .where('flag.lineup', '==', 0)
      .get();

    query.docs.map(function(docs) {
      results.push(docs.data());
    });
    return await Promise.all(results);
  } catch (error) {
    console.error(
      'Error in pubsub/util/prematchFunctions_NBA query_before40Min function by TsaiChieh',
      error
    );
    return error;
  }
}
function repackage_lineup(ele) {
  data = {
    flag: {
      lineup: 1
    },
    lineups: {
      home: {
        starters: [],
        substitutes: []
      },
      away: {
        starters: [],
        substitutes: []
      }
    }
  };
  for (let i = 0; i < ele.home.players.length; i++) {
    const player = ele.home.players[i];
    if (player.on_court) {
      data.lineups.home.starters.push(repackage_player(player));
    } else {
      data.lineups.home.substitutes.push(repackage_player(player));
    }
  }
  for (let i = 0; i < ele.away.players.length; i++) {
    const player = ele.away.players[i];
    if (player.on_court) {
      data.lineups.away.starters.push(repackage_player(player));
    } else {
      data.lineups.away.substitutes.push(repackage_player(player));
    }
  }

  return data;
}
function repackage_player(ele) {
  return {
    name: ele.full_name,
    first_name: ele.first_name,
    last_name: ele.last_name,
    primary_position: ele.primary_position,
    id: ele.id,
    sr_id: ele.sr_id
  };
}
