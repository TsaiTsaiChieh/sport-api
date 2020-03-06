const modules = require('../../util/modules');

module.exports.MLB_PRE = {
  upcomming: async function(date) {
    const _date = modules.dateFormat(date);
    const URL = `https://api.betsapi.com/v2/events/upcoming?sport_id=16&token=${modules.betsToken}&league_id=3939&day=${_date.year}${_date.month}${_date.day}`;
    console.log(`BetsAPI MLB_PRE URL on ${date}: ${URL}`);
    // axios
    const results = [];
    try {
      const { data } = await modules.axios(URL);
      for (let i = 0; i < data.results.length; i++) {
        const ele = data.results[i];
        results.push(
          modules.firestore
            .collection(modules.db.baseball_MLB)
            .doc(ele.id)
            .set(repackage_bets(ele), { merge: true })
        );
      }
    } catch (error) {
      console.error(
        'Error in pubsub/util/prematchFunctions_MLB_PRE upcomming axios by TsaiChieh',
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
          'Error in pubsub/util/prematchFunctions_MLB_PRE upcomming axios by TsaiChieh',
          error
        );
        reject(error);
      }
    });
  },
  prematch: async function(date) {
    const _date = modules.dateFormat(date);
    // If query today information, it will return tomorrow information
    const URL = `http://api.sportradar.us/mlb/trial/v6.6/en/games/${_date.year}/${_date.month}/${_date.day}/schedule.json?api_key=${modules.sportRadarKeys.BASEBALL_MLB}`;
    console.log(`SportRadar MLB_PRE URL on ${date}: ${URL}`);
    try {
      const { data } = await modules.axios(URL);
      const query = await query_MLB(date);

      for (let i = 0; i < data.games.length; i++) {
        const ele = data.games[i];
        integration(query, ele);
      }
    } catch (error) {
      console.error(
        'Error in pubsub/util/prematchFunctions_MLB_PRE axios or query by Tsai-Chieh',
        error
      );
    }
  }
};
function repackage_bets(ele) {
  data = {
    bets_id: ele.id,
    scheduled: modules.firebaseAdmin.firestore.Timestamp.fromDate(
      new Date(Number.parseInt(ele.time) * 1000)
    ),
    home: {
      alias: encode(ele.home.id, ele.home.name),
      image_id: ele.home.image_id,
      bets_id: ele.home.id
    },
    away: {
      alias: encode(ele.away.id, ele.away.name),
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
      lineup: 0
    }
  };
  return data;
}
// eslint-disable-next-line consistent-return
function encodeSeason(name) {
  name = name.toLowerCase();
  switch (name) {
    case 'exhibition games':
      return 'PRE';
  }
}

function encode(id, name) {
  id = Number.parseInt(id);
  switch (id | name) {
    // American League-West
    case 1090 | 'LA Angels':
      return 'LAA';
    case 1222 | 'OAK Athletics':
      return 'OAK';
    case 1202 | 'SEA Mariners':
      return 'SEA';
    case 1217 | 'HOU Astros':
      return 'HOU';
    case 1311 | 'TEX Rangers':
      return 'TEX';
    // American League-Central
    case 1091 | 'DET Tigers':
      return 'DET';
    case 1478 | 'KC Royals':
      return 'KC';
    case 1310 | 'CLE Indians':
      return 'CLE';
    case 1203 | 'CHI White Sox':
      return 'CWS';
    case 1088 | 'MIN Twins':
      return 'MIN';
    // American League-East
    case 1120 | 'BAL Orioles':
      return 'BAL';
    case 1089 | 'TOR Blue Jays':
      return 'TOR';
    case 1121 | 'NY Yankees':
      return 'NYY';
    case 1216 | 'TB Rays':
      return 'TB';
    case 1479 | 'BOS Red Sox':
      return 'BOS';
    // National League-West
    case 1369 | 'LA Dodgers':
      return 'LAD';
    case 1353 | 'SF Giants':
      return 'SF';
    case 1108 | 'SD Padres':
      return 'SD';
    case 1365 | 'ARI Diamondbacks':
      return 'ARI';
    case 1146 | 'COL Rockies':
      return 'COL';
    // National League-Central
    case 1223 | 'STL Cardinals':
      return 'STL';
    case 1186 | 'PIT Pirates':
      return 'PIT';
    case 1187 | 'MIL Brewers':
      return 'MIL';
    case 1364 | 'CIN Reds':
      return 'CIN';
    case 1368 | 'CHI Cubs':
      return 'CHC';
    // National League-East
    case 1147 | 'WAS Nationals':
      return 'WSH';
    case 1352 | 'ATL Braves':
      return 'ATL';
    case 1109 | 'MIA Marlins':
      return 'MIA';
    case 1113 | 'NY Mets':
      return 'NYM';
    case 1112 | 'PHI Phillies':
      return 'PHI';
  }
}

async function query_MLB(date) {
  const eventsRef = modules.firestore.collection(modules.db.baseball_MLB);
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
      'Error in pubsub/util/prematchFunctions_MLB query_MLB function by TsaiChieh',
      error
    );
    return error;
  }
}

function integration(query, ele, league) {
  for (let i = 0; i < query.length; i++) {
    console.log(query[i].bets_id);
  }
}
