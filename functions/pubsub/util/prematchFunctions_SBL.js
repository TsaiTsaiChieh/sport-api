const modules = require('../../util/modules');

module.exports.SBL = {};
// eslint-disable-next-line consistent-return
module.exports.SBL.upcomming = async function (date) {
  const _date = modules.dateFormat(date);
  const URL = `https://api.betsapi.com/v2/events/upcoming?sport_id=18&token=${modules.betsToken}&league_id=8251&day=${_date.year}${_date.month}${_date.day}`;
  console.log(`BetsAPI SBL URL on ${date}: ${URL}`);
  // axios
  const results = [];
  try {
    const { data } = await modules.axios(URL);
    for (let i = 0; i < data.results.length; i++) {
      const ele = data.results[i];
      results.push(
        modules.firestore
          .collection(modules.db.basketball_SBL)
          .doc(ele.id)
          .set(repackage_bets(ele), { merge: true })
      );
      console.log(`BetsAPI SBL match id: ${ele.id}`);
    }
  } catch (error) {
    console.error(
      'Error in pubsub/prematchFunctions_SBL upcomming axios by TsaiChieh',
      error
    );
    return error;
  }
  // firestore
  return new Promise(async function (resolve, reject) {
    try {
      resolve(await Promise.all(results));
    } catch (error) {
      console.error(
        'Error in pubsub/prematchFunctions_SBL upcomming function by TsaiChieh',
        error
      );
      reject(error);
    }
  });
};

function repackage_bets (ele) {
  const data = {};
  data.scheduled = modules.firebaseAdmin.firestore.Timestamp.fromDate(
    new Date(Number.parseInt(ele.time) * 1000)
  );
  data.bets_id = ele.id;
  data.home = {
    alias: encode(ele.home.name, ele.home.id),
    bets_id: ele.home.id
  };
  data.away = {
    alias: encode(ele.away.name, ele.away.id),
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
function encode (name, id) {
  name = name.toLowerCase();
  id = Number.parseInt(id);

  if (name === 'pauian archiland' || id === 319674) return 'PAR';
  else if (name === 'taiwan beer' || id === 193059) return 'TAI';
  else if (name === 'yulon dinos' || id === 295972) return 'YUL';
  else if (name === 'jeoutai technology' || id === 319673) return 'JEO';
  else if (name === 'bank of taiwan' || id === 193057) return 'BAN';
}
// eslint-disable-next-line consistent-return
module.exports.SBL.prematch = async function (date) {
  const _date = modules.dateFormat(date);
  // If query today information, it will return today information
  const URL = `http://api.sportradar.us/basketball/trial/v2/en/schedules/${_date.year}-${_date.month}-${_date.day}/summaries.json?api_key=${modules.sportRadarKeys.GLOABL_BASKETBALL}`;
  // const sportRadarURL = `http://api.sportradar.us/basketball/trial/v2/en/schedules/${year}-03-07/summaries.json?api_key=${modules.sportRadarKeys.GLOABL_BASKETBALL}`;
  console.log(`SportRadar SBL URL on ${date}: ${URL}`);
  try {
    const { data } = await modules.axios(URL);
    const query = await query_SBL(date);

    for (let i = 0; i < data.summaries.length; i++) {
      const ele = data.summaries[i];
      if (ele.sport_event.sport_event_context !== undefined) {
        if (
          ele.sport_event.sport_event_context.competition.name.toUpperCase() ===
          'SBL'
        ) {
          integration(query, ele);
          console.log(
            `SportRadar SBL match_id: ${ele.sport_event.id.replace(
              'sr:sport_event:',
              ''
            )}`
          );
        }
      }
    }
  } catch (error) {
    console.error(
      'error happened in pubsub/prematchFunctions_SBL prematch axios or query by Tsai-Chieh',
      error
    );
    return error;
  }
};
async function query_SBL (date) {
  const basketRef = modules.firestore.collection(modules.db.basketball_SBL);
  const beginningDate = modules.moment(date);
  const endDate = modules.moment(date).add(1, 'days');
  const results = [];
  try {
    const query = await basketRef
      .where('scheduled', '>=', beginningDate)
      .where('scheduled', '<', endDate)
      .get();

    query.forEach(async function (ele) {
      results.push(ele.data());
    });
    await Promise.all(results);
    return results;
  } catch (error) {
    console.error(
      'Error in pubsub/prematchFunctions_SBL integration function by TsaiChieh',
      error
    );
    return error;
  }
}
function integration (query, ele) {
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
        .collection(modules.db.basketball_SBL)
        .doc(query[i].bets_id)
        .set(repackage_sportradar(ele), { merge: true });
    }
  }
}
function repackage_sportradar (ele) {
  const data = {};
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
  data.home.alias_ch = codebook(
    ele.sport_event.competitors[0].abbreviation
  ).alias_ch;
  data.home.name_ch = codebook(
    ele.sport_event.competitors[0].abbreviation
  ).name_ch;

  data.away = {
    radar_id: ele.sport_event.competitors[1].id,
    name: ele.sport_event.competitors[1].name
  };

  data.away.alias_ch = codebook(
    ele.sport_event.competitors[1].abbreviation
  ).alias_ch;
  data.away.name_ch = codebook(
    ele.sport_event.competitors[1].abbreviation
  ).name_ch;

  return data;
}

// eslint-disable-next-line consistent-return
function codebook (alias) {
  alias = alias.toUpperCase();
  switch (alias) {
    case 'PAR':
      return {
        name_ch: '桃園璞園建築',
        alias_ch: '璞園'
      };
    case 'TAI':
      return {
        name_ch: '台灣啤酒',
        alias_ch: '台啤'
      };
    case 'YUL':
      return {
        name_ch: '裕隆納智捷',
        alias_ch: '裕隆'
      };
    case 'JEO':
      return {
        name_ch: '九太科技',
        alias_ch: '九太'
      };
    case 'BAN':
      return {
        name_ch: '台灣銀行',
        alias_ch: '台銀'
      };
  }
}
