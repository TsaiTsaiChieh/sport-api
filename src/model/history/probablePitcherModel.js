const leagueUtil = require('../../util/leagueUtil');
const db = require('../../util/dbUtil');
const firebaseAdmin = require('../../util/firebaseUtil');
const firestore = firebaseAdmin().firestore();
const season = 2020;
async function probablePitcher(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const data = await queryEvents(args);
      if (data.length <= 0) {
        resolve({
          homeHistory: {

          },
          awayHistory: {

          }
        });
      };
      const result = await queryPitchers(data);
      resolve(result);
    } catch (err) {
      reject(err);
    }
  });
}

async function queryEvents(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const queries = await db.sequelize.query(
        // take 169 ms
        `(
          SELECT league_id, home_id, away_id, home_player, away_player
						FROM matches AS game
					 WHERE game.bets_id = :event_id
					   AND game.league_id = :league_id
        )`,
        {
          replacements: {
            event_id: args.event_id,
            league_id: leagueUtil.leagueCodebook(args.league).id
          },
          type: db.sequelize.QueryTypes.SELECT

        }
      );

      return resolve(queries);
    } catch (err) {
      return reject(`${err.stack} by DY`);
    }
  });
}

async function queryPitchers(data) {
  const leagueName = leagueUtil.leagueDecoder(data[0].league_id);
  const sportName = leagueUtil.league2Sport(leagueName).sport;
  const collectionName = `${sportName}_${leagueName}`;
  const homePlayer = JSON.parse(data[0].home_player);
  const awayPlayer = JSON.parse(data[0].away_player);
  const result = {};
  if (homePlayer !== null) {
    if (homePlayer.pitchers !== null) {
      if (homePlayer.pitchers.id !== 0) {
        const homeData = (await firestore.collection(collectionName).doc(data[0].home_id).get()).data();
        const homeTemp = homeData[`season_${season}`].pitchers[`${homePlayer.pitchers.id}`];
        result.homePitcher = {
          player: homeTemp.ori_name,
          win: homeTemp.Win,
          lose: homeTemp.Loss,
          ERA: homeTemp.ERA,
          BA: homeTemp.babip,
          Inning: homeTemp.IP,
          whip: homeTemp.WHIP,
          SO: homeTemp.SO,
          BB: homeTemp.BB
        };
      } else {
        result.homePitcher = {};
      }
    } else {
      result.homePitcher = {};
    }
  } else {
    result.homePitcher = {};
  }
  if (awayPlayer !== null) {
    if (awayPlayer.pitchers !== null) {
      if (awayPlayer.pitchers.id !== 0) {
        const awayData = (await firestore.collection(collectionName).doc(data[0].away_id).get()).data();
        const awayTemp = awayData[`season_${season}`].pitchers[`${awayPlayer.pitchers.id}`];
        result.awayPitcher = {
          player: awayTemp.ori_name,
          win: awayTemp.Win,
          lose: awayTemp.Loss,
          ERA: awayTemp.ERA,
          BA: awayTemp.babip,
          Inning: awayTemp.IP,
          whip: awayTemp.WHIP,
          SO: awayTemp.SO,
          BB: awayTemp.BB
        };
      } else {
        result.awayPitcher = {};
      }
    } else {
      result.awayPitcher = {};
    }
  } else {
    result.awayPitcher = {};
  }
  return result;
}
module.exports = probablePitcher;
