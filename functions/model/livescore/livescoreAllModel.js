const modules = require('../../util/modules');
const AppErrors = require('../../util/AppErrors');

async function livescoreAll(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const allMatches = await queryAllMatches(args);
      const result = await repackage(args, allMatches);
      resolve(result);
    } catch (err) {
      reject(err);
    }
  });
}

function queryAllMatches(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const begin = modules.convertTimezone(args.date);
      const end =
        modules.convertTimezone(args.date, {
          op: 'add',
          value: 1,
          unit: 'days'
        }) - 1;

      const queries = await modules.firestore // 變數命名也注意單複數
        .collection(modules.leagueCodebook(args.league).match)
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
  try {
    const data = [];
    for (let i = 0; i < matches.length; i++) {
      const ele = matches[i];
      const temp = {
        id: ele.bets_id,
        status: ele.flag.status,
        sport: modules.league2Sport(args.league),
        league: ele.league.name_ch,
        ori_league: args.league,
        scheduled: ele.scheduled * 1000,
        newest_spread: {
          handicap: ele.newest_spread ? ele.newest_spread.handicap : null,
          home_tw: ele.newest_spread ? ele.newest_spread.home_tw : null,
          away_tw: ele.newest_spread ? ele.newest_spread.away_tw : null
        },
        // group: args.league === 'eSoccer' ? ele.league.name : null, // 電競足球的子分類叫 league 我覺得不是很合理欸，所以改成 group
        home: {
          team_name: ele.home.team_name,
          player_name: ele.home.player_name,
          name: ele.home.name,
          name_ch: ele.home.name_ch,
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
    }
    return data;
  } catch (err) {
    console.error(`${err.stack} by DY`);
    throw AppErrors.RepackageError(`${err.stack} by DY`);
  }
}
module.exports = livescoreAll;
