const leagueUtil = require('../../util/leagueUtil');
const db = require('../../util/dbUtil');
const firebaseAdmin = require('../../util/firebaseUtil');
const firestore = firebaseAdmin().firestore();
const season = 2020;
async function probablePitcherPastGame(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const data = await queryEvents(args);
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
        )`,
        {
          replacements: {
            event_id: args.event_id
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
  result.homeHistory = [];
  result.awayHistory = [];
  if (homePlayer.pitchers !== null) {
    if (homePlayer.pitchers.id !== 0) {
      const homeData = (await firestore.collection(collectionName).doc(data[0].home_id).get()).data();
      const homeTemp = homeData[`season_${season}`].pitchers[`${homePlayer.pitchers.id}`].past_game;
      for (let i = 0; i < Object.keys(homeTemp).length; i++) {
        const matchId = Object.keys(homeTemp)[i];
        result.homeHistory.push(
          {
            opponentName: homeTemp[`${matchId}`].opponentName,
            score: {
              homeScore: String(homeTemp[`${matchId}`].homeScore),
              awayScore: String(homeTemp[`${matchId}`].awayScore),
              atWhichTeam: homeTemp[`${matchId}`].atWhichTeam
            },
            ERA: homeTemp[`${matchId}`].ERA,
            IP: homeTemp[`${matchId}`].IP,
            R: homeTemp[`${matchId}`].R,
            ER: homeTemp[`${matchId}`].ER,
            HR: homeTemp[`${matchId}`].HR,
            BB: homeTemp[`${matchId}`].BB,
            SO: homeTemp[`${matchId}`].SO,
            H: homeTemp[`${matchId}`].H
          }
        );
      }
    } else {
      result.homeHistory = {};
    }
  } else {
    result.homeHistory = {};
  }
  if (awayPlayer.pitchers !== null) {
    if (awayPlayer.pitchers.id !== 0) {
      const awayData = (await firestore.collection(collectionName).doc(data[0].away_id).get()).data();
      const awayTemp = awayData[`season_${season}`].pitchers[`${awayPlayer.pitchers.id}`].past_game;
      for (let i = 0; i < Object.keys(awayTemp).length; i++) {
        const matchId = Object.keys(awayTemp)[i];
        result.awayHistory.push(
          {
            opponentName: awayTemp[`${matchId}`].opponentName,
            score: {
              homeScore: String(awayTemp[`${matchId}`].homeScore),
              awayScore: String(awayTemp[`${matchId}`].awayScore),
              atWhichTeam: awayTemp[`${matchId}`].atWhichTeam
            },
            ERA: awayTemp[`${matchId}`].ERA,
            IP: awayTemp[`${matchId}`].IP,
            R: awayTemp[`${matchId}`].R,
            ER: awayTemp[`${matchId}`].ER,
            HR: awayTemp[`${matchId}`].HR,
            BB: awayTemp[`${matchId}`].BB,
            SO: awayTemp[`${matchId}`].SO,
            H: awayTemp[`${matchId}`].H
          }
        );
      }
    } else {
      result.awayHistory = {};
    }
  } else {
    result.awayHistory = {};
  }
  return result;
}

module.exports = probablePitcherPastGame;
