const modules = require('../../util/modules');
async function livescore(args) {
  return new Promise(async function (resolve, reject) {
    try {
      const match = await queryMatch(args);
      const result = await repackage(args, match);
      resolve(result);
    } catch (err) {
      console.error('Error in livescore/livescoreDetailPBPModel by DY', err);
      reject({ code: 500, error: err });
    }
  });
}

function queryMatch(args) {
  return new Promise(async function (resolve, reject) {
    try {
      const query = await modules.firestore
        .collection(modules.leagueCodebook(args.league).match)
        .where('bets_id', '==', args.eventID)
        .get();
      const match = [];
      query.docs.map(function (doc) {
        match.push(doc.data());
      });
      return resolve(await Promise.all(match));
    } catch (err) {
      return reject(`${err.stack} by DY`);
    }
  });
}

async function repackage(args, match) {
  const ele = match[0];

  const temp = {
    id: ele.bets_id,
    status: ele.flag.status,
    sport: modules.league2Sport(args.league).sport,
    league: ele.league.name_ch,
    ori_league: args.league,
    scheduled: ele.scheduled * 1000,
    newest_spread: {
      handicap: ele.newest_spread ? ele.newest_spread.handicap : null,
      home_tw: ele.newest_spread ? ele.newest_spread.home_tw : null,
      away_tw: ele.newest_spread ? ele.newest_spread.away_tw : null
    },
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

  return temp;
}
module.exports = livescore;
