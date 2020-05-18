const modules = require('../../util/modules');
async function livescoreHome(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const homeMatches = await queryHomeMatches(args);

      const result = await repackage(args, homeMatches);

      resolve(result);
    } catch (err) {
      console.error('Error in sport/livescoreModel by DY', err);
      reject({ code: 500, error: err });
    }
  });
}
function queryHomeMatches(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const begin = modules.convertTimezone(
        modules.moment().utcOffset(8).format('YYYY-MM-DD')
      );
      const end =
        modules.convertTimezone(
          modules.moment().utcOffset(8).format('YYYY-MM-DD'),
          {
            op: 'add',
            value: 1,
            unit: 'days'
          }
        ) - 1;

      const queries = await modules.firestore
        .collection(modules.leagueCodebook(args.league).match)
        .where('flag.status', '==', modules.MATCH_STATUS.INPLAY)
        .where('scheduled', '>=', begin)
        .where('scheduled', '<=', end)
        .get();

      const matches = [];

      queries.docs.map(function(doc) {
        matches.push(doc.data());
      });

      return resolve(await Promise.all(matches));
    } catch (err) {
      return reject(`${err.stack} by DY`);
    }
  });
}
async function repackage(args, matches) {
  const data = [];
  // let limitMatches = 4;
  for (let i = 0; i < matches.length; i++) {
    const ele = matches[i];
    const temp = {
      id: ele.bets_id,
      league: ele.league.name_ch,
      ori_league: ele.league.name,
      sport: modules.league2Sport(args.league),
      status: ele.flag.status,
      newest_spread: {
        handicap: ele.newest_spread ? ele.newest_spread.handicap : null,
        home_tw: ele.newest_spread ? ele.newest_spread.home_tw : null,
        away_tw: ele.newest_spread ? ele.newest_spread.away_tw : null
      },
      home: {
        team_name: ele.home.team_name,
        player_name: ele.home.player_name,
        name: ele.home.name,
        alias: ele.home.alias,
        alias_ch: ele.home.alias_ch,
        image_id: ele.home.image_id
      },
      away: {
        team_name: ele.away.team_name,
        player_name: ele.away.player_name,
        name: ele.away.name,
        name_ch: ele.away.name_ch,
        alias: ele.away.alias,
        alias_ch: ele.away.alias_ch,
        image_id: ele.away.image_id
      }
    };

    data.push(temp);
    return data;
  }
}
module.exports = livescoreHome;
