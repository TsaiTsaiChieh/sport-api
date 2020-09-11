const leagueUtil = require('../../util/leagueUtil');
const db = require('../../util/dbUtil');
const firebaseAdmin = require('../../util/firebaseUtil');
const firestore = firebaseAdmin().firestore();
const season = 2020;
async function teamBattingInformation(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const data = await queryEvents(args);
      if (data.length <= 0) {
        resolve({
          describe: 'AVG, OBP, SLG, averageR, HR, BB, SO',
          homeRecord: {

          },
          awayRecord: {

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
          SELECT league_id, home_id, away_id
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
  const result = {};
  const homeData = (await firestore.collection(collectionName).doc(data[0].home_id).get()).data();
  const homeAtHome = homeData[`season_${season}`].team_advance_home ? homeData[`season_${season}`].team_advance_home : {};
  const homeAtaway = homeData[`season_${season}`].team_advance_away ? homeData[`season_${season}`].team_advance_away : {};
  const homeRecent = homeData[`season_${season}`].team_advance_recent ? homeData[`season_${season}`].team_advance_recent : {};
  const homeSeason = homeData[`season_${season}`].team_advance_season ? homeData[`season_${season}`].team_advance_season : {};
  const homeMonth = homeData[`season_${season}`].team_advance_month ? homeData[`season_${season}`].team_advance_month : {};
  const homeVersusRight = homeData[`season_${season}`].team_advance_versus_right ? homeData[`season_${season}`].team_advance_versus_right : {};
  const homeVersusLeft = homeData[`season_${season}`].team_advance_versus_left ? homeData[`season_${season}`].team_advance_versus_left : {};
  const homeAtDay = homeData[`season_${season}`].team_advance_day ? homeData[`season_${season}`].team_advance_day : {};
  const homeAtNight = homeData[`season_${season}`].team_advance_night ? homeData[`season_${season}`].team_advance_night : {};
  result.describe = 'AVG, OBP, SLG, averageR, HR, BB, SO';
  // home
  result.homeRecord = {};
  if (homeAtHome) {
    result.homeRecord.home = {};
    result.homeRecord.home.data = [];
    result.homeRecord.home.rank = [];
    result.homeRecord.home.data.push(parseFloat(homeAtHome.AVG), parseFloat(homeAtHome.OBP), parseFloat(homeAtHome.SLG), parseFloat(homeAtHome.averageR), parseFloat(homeAtHome.HR), parseFloat(homeAtHome.BB), parseFloat(homeAtHome.SO));
    result.homeRecord.home.rank.push(parseFloat(homeAtHome.rankAVG), parseFloat(homeAtHome.rankOBP), parseFloat(homeAtHome.rankSLG), parseFloat(homeAtHome.rankAverageR), parseFloat(homeAtHome.rankHR), parseFloat(homeAtHome.rankBB), parseFloat(homeAtHome.rankSO));
  } else {
    result.homeRecord.home = {};
    result.homeRecord.home.data = [];
    result.homeRecord.home.rank = [];
  }

  if (homeAtaway) {
    result.homeRecord.away = {};
    result.homeRecord.away.data = [];
    result.homeRecord.away.rank = [];
    result.homeRecord.away.data.push(parseFloat(homeAtaway.AVG), parseFloat(homeAtaway.OBP), parseFloat(homeAtaway.SLG), parseFloat(homeAtaway.averageR), parseFloat(homeAtaway.HR), parseFloat(homeAtaway.BB), parseFloat(homeAtaway.SO));
    result.homeRecord.away.rank.push(parseFloat(homeAtaway.rankAVG), parseFloat(homeAtaway.rankOBP), parseFloat(homeAtaway.rankSLG), parseFloat(homeAtaway.rankAverageR), parseFloat(homeAtaway.rankHR), parseFloat(homeAtaway.rankBB), parseFloat(homeAtaway.rankSO));
  } else {
    result.homeRecord.away = {};
    result.homeRecord.away.data = [];
    result.homeRecord.away.rank = [];
  }
  if (homeRecent) {
    result.homeRecord.recent = {};
    result.homeRecord.recent.data = [];
    result.homeRecord.recent.rank = [];
    result.homeRecord.recent.data.push(parseFloat(homeRecent.AVG), parseFloat(homeRecent.OBP), parseFloat(homeRecent.SLG), parseFloat(homeRecent.averageR), parseFloat(homeRecent.HR), parseFloat(homeRecent.BB), parseFloat(homeRecent.SO));
    result.homeRecord.recent.rank.push(parseFloat(homeRecent.rankAVG), parseFloat(homeRecent.rankOBP), parseFloat(homeRecent.rankSLG), parseFloat(homeRecent.rankAverageR), parseFloat(homeRecent.rankHR), parseFloat(homeRecent.rankBB), parseFloat(homeRecent.rankSO));
  } else {
    result.homeRecord.recent = {};
    result.homeRecord.recent.data = [];
    result.homeRecord.recent.rank = [];
  }
  if (homeSeason) {
    result.homeRecord.season = {};
    result.homeRecord.season.data = [];
    result.homeRecord.season.rank = [];
    result.homeRecord.season.data.push(parseFloat(homeSeason.AVG), parseFloat(homeSeason.OBP), parseFloat(homeSeason.SLG), parseFloat(homeSeason.averageR), parseFloat(homeSeason.HR), parseFloat(homeSeason.BB), parseFloat(homeSeason.SO));
    result.homeRecord.season.rank.push(parseFloat(homeSeason.rankAVG), parseFloat(homeSeason.rankOBP), parseFloat(homeSeason.rankSLG), parseFloat(homeSeason.rankAverageR), parseFloat(homeSeason.rankHR), parseFloat(homeSeason.rankBB), parseFloat(homeSeason.rankSO));
  } else {
    result.homeRecord.season = {};
    result.homeRecord.season.data = [];
    result.homeRecord.season.rank = [];
  }
  if (homeMonth) {
    result.homeRecord.month = {};
    result.homeRecord.month.data = [];
    result.homeRecord.month.rank = [];
    result.homeRecord.month.data.push(parseFloat(homeMonth.AVG), parseFloat(homeMonth.OBP), parseFloat(homeMonth.SLG), parseFloat(homeMonth.averageR), parseFloat(homeMonth.HR), parseFloat(homeMonth.BB), parseFloat(homeMonth.SO));
    result.homeRecord.month.rank.push(parseFloat(homeMonth.rankAVG), parseFloat(homeMonth.rankOBP), parseFloat(homeMonth.rankSLG), parseFloat(homeMonth.rankAverageR), parseFloat(homeMonth.rankHR), parseFloat(homeMonth.rankBB), parseFloat(homeMonth.rankSO));
  } else {
    result.homeRecord.month = {};
    result.homeRecord.month.data = [];
    result.homeRecord.month.rank = [];
  }
  if (homeVersusRight) {
    result.homeRecord.versusRight = {};
    result.homeRecord.versusRight.data = [];
    result.homeRecord.versusRight.rank = [];
    result.homeRecord.versusRight.data.push(parseFloat(homeVersusRight.AVG), parseFloat(homeVersusRight.OBP), parseFloat(homeVersusRight.SLG), parseFloat(homeVersusRight.averageR), parseFloat(homeVersusRight.HR), parseFloat(homeVersusRight.BB), parseFloat(homeVersusRight.SO));
    result.homeRecord.versusRight.rank.push(parseFloat(homeVersusRight.rankAVG), parseFloat(homeVersusRight.rankOBP), parseFloat(homeVersusRight.rankSLG), parseFloat(homeVersusRight.rankAverageR), parseFloat(homeVersusRight.rankHR), parseFloat(homeVersusRight.rankBB), parseFloat(homeVersusRight.rankSO));
  } else {
    result.homeRecord.versusRight = {};
    result.homeRecord.versusRight.data = [];
    result.homeRecord.versusRight.rank = [];
  }
  if (homeVersusLeft) {
    result.homeRecord.versusLeft = {};
    result.homeRecord.versusLeft.data = [];
    result.homeRecord.versusLeft.rank = [];
    result.homeRecord.versusLeft.data.push(parseFloat(homeVersusLeft.AVG), parseFloat(homeVersusLeft.OBP), parseFloat(homeVersusLeft.SLG), parseFloat(homeVersusLeft.averageR), parseFloat(homeVersusLeft.HR), parseFloat(homeVersusLeft.BB), parseFloat(homeVersusLeft.SO));
    result.homeRecord.versusLeft.rank.push(parseFloat(homeVersusLeft.rankAVG), parseFloat(homeVersusLeft.rankOBP), parseFloat(homeVersusLeft.rankSLG), parseFloat(homeVersusLeft.rankAverageR), parseFloat(homeVersusLeft.rankHR), parseFloat(homeVersusLeft.rankBB), parseFloat(homeVersusLeft.rankSO));
  } else {
    result.homeRecord.versusLeft = {};
    result.homeRecord.versusLeft.data = [];
    result.homeRecord.versusLeft.rank = [];
  }
  if (homeAtDay) {
    result.homeRecord.day = {};
    result.homeRecord.day.data = [];
    result.homeRecord.day.rank = [];
    result.homeRecord.day.data.push(parseFloat(homeAtDay.AVG), parseFloat(homeAtDay.OBP), parseFloat(homeAtDay.SLG), parseFloat(homeAtDay.averageR), parseFloat(homeAtDay.HR), parseFloat(homeAtDay.BB), parseFloat(homeAtDay.SO));
    result.homeRecord.day.rank.push(parseFloat(homeAtDay.rankAVG), parseFloat(homeAtDay.rankOBP), parseFloat(homeAtDay.rankSLG), parseFloat(homeAtDay.rankAverageR), parseFloat(homeAtDay.rankHR), parseFloat(homeAtDay.rankBB), parseFloat(homeAtDay.rankSO));
  } else {
    result.homeRecord.day = {};
    result.homeRecord.day.data = [];
    result.homeRecord.day.rank = [];
  }

  if (homeAtNight) {
    result.homeRecord.night = {};
    result.homeRecord.night.data = [];
    result.homeRecord.night.rank = [];
    result.homeRecord.night.data.push(parseFloat(homeAtNight.AVG), parseFloat(homeAtNight.OBP), parseFloat(homeAtNight.SLG), parseFloat(homeAtNight.averageR), parseFloat(homeAtNight.HR), parseFloat(homeAtNight.BB), parseFloat(homeAtNight.SO));
    result.homeRecord.night.rank.push(parseFloat(homeAtNight.rankAVG), parseFloat(homeAtNight.rankOBP), parseFloat(homeAtNight.rankSLG), parseFloat(homeAtNight.rankAverageR), parseFloat(homeAtNight.rankHR), parseFloat(homeAtNight.rankBB), parseFloat(homeAtNight.rankSO));
  } else {
    result.homeRecord.night = {};
    result.homeRecord.night.data = [];
    result.homeRecord.night.rank = [];
  }
  // away
  const awayData = (await firestore.collection(collectionName).doc(data[0].away_id).get()).data();
  const awayAtHome = awayData[`season_${season}`].team_advance_home ? awayData[`season_${season}`].team_advance_home : {};
  const awayAtaway = awayData[`season_${season}`].team_advance_away ? awayData[`season_${season}`].team_advance_away : {};
  const awayRecent = awayData[`season_${season}`].team_advance_recent ? awayData[`season_${season}`].team_advance_recent : {};
  const awaySeason = awayData[`season_${season}`].team_advance_season ? awayData[`season_${season}`].team_advance_season : {};
  const awayMonth = awayData[`season_${season}`].team_advance_month ? awayData[`season_${season}`].team_advance_month : {};
  const awayVersusRight = awayData[`season_${season}`].team_advance_versus_right ? awayData[`season_${season}`].team_advance_versus_right : {};
  const awayVersusLeft = awayData[`season_${season}`].team_advance_versus_left ? awayData[`season_${season}`].team_advance_versus_left : {};
  const awayAtDay = awayData[`season_${season}`].team_advance_day ? awayData[`season_${season}`].team_advance_day : {};
  const awayAtNight = awayData[`season_${season}`].team_advance_night ? awayData[`season_${season}`].team_advance_night : {};

  result.awayRecord = {};
  if (awayAtHome) {
    result.awayRecord.home = {};
    result.awayRecord.home.data = [];
    result.awayRecord.home.rank = [];
    result.awayRecord.home.data.push(parseFloat(awayAtHome.AVG), parseFloat(awayAtHome.OBP), parseFloat(awayAtHome.SLG), parseFloat(awayAtHome.averageR), parseFloat(awayAtHome.HR), parseFloat(awayAtHome.BB), parseFloat(awayAtHome.SO));
    result.awayRecord.home.rank.push(parseFloat(awayAtHome.rankAVG), parseFloat(awayAtHome.rankOBP), parseFloat(awayAtHome.rankSLG), parseFloat(awayAtHome.rankAverageR), parseFloat(awayAtHome.rankHR), parseFloat(awayAtHome.rankBB), parseFloat(awayAtHome.rankSO));
  } else {
    result.awayRecord.home = {};
    result.awayRecord.home.data = [];
    result.awayRecord.home.rank = [];
  }
  if (awayAtaway) {
    result.awayRecord.away = {};
    result.awayRecord.away.data = [];
    result.awayRecord.away.rank = [];
    result.awayRecord.away.data.push(parseFloat(awayAtaway.AVG), parseFloat(awayAtaway.OBP), parseFloat(awayAtaway.SLG), parseFloat(awayAtaway.averageR), parseFloat(awayAtaway.HR), parseFloat(awayAtaway.BB), parseFloat(awayAtaway.SO));
    result.awayRecord.away.rank.push(parseFloat(awayAtaway.rankAVG), parseFloat(awayAtaway.rankOBP), parseFloat(awayAtaway.rankSLG), parseFloat(awayAtaway.rankAverageR), parseFloat(awayAtaway.rankHR), parseFloat(awayAtaway.rankBB), parseFloat(awayAtaway.rankSO));
  } else {
    result.awayRecord.away = {};
    result.awayRecord.away.data = [];
    result.awayRecord.away.rank = [];
  }
  if (awayRecent) {
    result.awayRecord.recent = {};
    result.awayRecord.recent.data = [];
    result.awayRecord.recent.rank = [];
    result.awayRecord.recent.data.push(parseFloat(awayRecent.AVG), parseFloat(awayRecent.OBP), parseFloat(awayRecent.SLG), parseFloat(awayRecent.averageR), parseFloat(awayRecent.HR), parseFloat(awayRecent.BB), parseFloat(awayRecent.SO));
    result.awayRecord.recent.rank.push(parseFloat(awayRecent.rankAVG), parseFloat(awayRecent.rankOBP), parseFloat(awayRecent.rankSLG), parseFloat(awayRecent.rankAverageR), parseFloat(awayRecent.rankHR), parseFloat(awayRecent.rankBB), parseFloat(awayRecent.rankSO));
  } else {
    result.awayRecord.recent = {};
    result.awayRecord.recent.data = [];
    result.awayRecord.recent.rank = [];
  }
  if (awaySeason) {
    result.awayRecord.season = {};
    result.awayRecord.season.data = [];
    result.awayRecord.season.rank = [];
    result.awayRecord.season.data.push(parseFloat(awaySeason.AVG), parseFloat(awaySeason.OBP), parseFloat(awaySeason.SLG), parseFloat(awaySeason.averageR), parseFloat(awaySeason.HR), parseFloat(awaySeason.BB), parseFloat(awaySeason.SO));
    result.awayRecord.season.rank.push(parseFloat(awaySeason.rankAVG), parseFloat(awaySeason.rankOBP), parseFloat(awaySeason.rankSLG), parseFloat(awaySeason.rankAverageR), parseFloat(awaySeason.rankHR), parseFloat(awaySeason.rankBB), parseFloat(awaySeason.rankSO));
  } else {
    result.awayRecord.season = {};
    result.awayRecord.season.data = [];
    result.awayRecord.season.rank = [];
  }
  if (awayMonth) {
    result.awayRecord.month = {};
    result.awayRecord.month.data = [];
    result.awayRecord.month.rank = [];
    result.awayRecord.month.data.push(parseFloat(awayMonth.AVG), parseFloat(awayMonth.OBP), parseFloat(awayMonth.SLG), parseFloat(awayMonth.averageR), parseFloat(awayMonth.HR), parseFloat(awayMonth.BB), parseFloat(awayMonth.SO));
    result.awayRecord.month.rank.push(parseFloat(awayMonth.rankAVG), parseFloat(awayMonth.rankOBP), parseFloat(awayMonth.rankSLG), parseFloat(awayMonth.rankAverageR), parseFloat(awayMonth.rankHR), parseFloat(awayMonth.rankBB), parseFloat(awayMonth.rankSO));
  } else {
    result.awayRecord.month = {};
    result.awayRecord.month.data = [];
    result.awayRecord.month.rank = [];
  }
  if (awayVersusRight) {
    result.awayRecord.versusRight = {};
    result.awayRecord.versusRight.data = [];
    result.awayRecord.versusRight.rank = [];
    result.awayRecord.versusRight.data.push(parseFloat(awayVersusRight.AVG), parseFloat(awayVersusRight.OBP), parseFloat(awayVersusRight.SLG), parseFloat(awayVersusRight.averageR), parseFloat(awayVersusRight.HR), parseFloat(awayVersusRight.BB), parseFloat(awayVersusRight.SO));
    result.awayRecord.versusRight.rank.push(parseFloat(awayVersusRight.rankAVG), parseFloat(awayVersusRight.rankOBP), parseFloat(awayVersusRight.rankSLG), parseFloat(awayVersusRight.rankAverageR), parseFloat(awayVersusRight.rankHR), parseFloat(awayVersusRight.rankBB), parseFloat(awayVersusRight.rankSO));
  } else {
    result.awayRecord.versusRight = {};
    result.awayRecord.versusRight.data = [];
    result.awayRecord.versusRight.rank = [];
  }
  if (awayVersusLeft) {
    result.awayRecord.versusLeft = {};
    result.awayRecord.versusLeft.data = [];
    result.awayRecord.versusLeft.rank = [];
    result.awayRecord.versusLeft.data.push(parseFloat(awayVersusLeft.AVG), parseFloat(awayVersusLeft.OBP), parseFloat(awayVersusLeft.SLG), parseFloat(awayVersusLeft.averageR), parseFloat(awayVersusLeft.HR), parseFloat(awayVersusLeft.BB), parseFloat(awayVersusLeft.SO));
    result.awayRecord.versusLeft.rank.push(parseFloat(awayVersusLeft.rankAVG), parseFloat(awayVersusLeft.rankOBP), parseFloat(awayVersusLeft.rankSLG), parseFloat(awayVersusLeft.rankAverageR), parseFloat(awayVersusLeft.rankHR), parseFloat(awayVersusLeft.rankBB), parseFloat(awayVersusLeft.rankSO));
  } else {
    result.awayRecord.versusLeft = {};
    result.awayRecord.versusLeft.data = [];
    result.awayRecord.versusLeft.rank = [];
  }
  if (awayAtDay) {
    result.awayRecord.day = {};
    result.awayRecord.day.data = [];
    result.awayRecord.day.rank = [];
    result.awayRecord.day.data.push(parseFloat(awayAtDay.AVG), parseFloat(awayAtDay.OBP), parseFloat(awayAtDay.SLG), parseFloat(awayAtDay.averageR), parseFloat(awayAtDay.HR), parseFloat(awayAtDay.BB), parseFloat(awayAtDay.SO));
    result.awayRecord.day.rank.push(parseFloat(awayAtDay.rankAVG), parseFloat(awayAtDay.rankOBP), parseFloat(awayAtDay.rankSLG), parseFloat(awayAtDay.rankAverageR), parseFloat(awayAtDay.rankHR), parseFloat(awayAtDay.rankBB), parseFloat(awayAtDay.rankSO));
  } else {
    result.awayRecord.day = {};
    result.awayRecord.day.data = [];
    result.awayRecord.day.rank = [];
  }
  if (awayAtNight) {
    result.awayRecord.night = {};
    result.awayRecord.night.data = [];
    result.awayRecord.night.rank = [];
    result.awayRecord.night.data.push(parseFloat(awayAtNight.AVG), parseFloat(awayAtNight.OBP), parseFloat(awayAtNight.SLG), parseFloat(awayAtNight.averageR), parseFloat(awayAtNight.HR), parseFloat(awayAtNight.BB), parseFloat(awayAtNight.SO));
    result.awayRecord.night.rank.push(parseFloat(awayAtNight.rankAVG), parseFloat(awayAtNight.rankOBP), parseFloat(awayAtNight.rankSLG), parseFloat(awayAtNight.rankAverageR), parseFloat(awayAtNight.rankHR), parseFloat(awayAtNight.rankBB), parseFloat(awayAtNight.rankSO));
  } else {
    result.awayRecord.night = {};
    result.awayRecord.night.data = [];
    result.awayRecord.night.rank = [];
  }
  return result;
}

module.exports = teamBattingInformation;
