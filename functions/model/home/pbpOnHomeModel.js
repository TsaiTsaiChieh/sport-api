const livescore = require('./livescore');
const leagueUtil = require('../../util/leagueUtil');
const firebaseAdmin = require('../../util/firebaseUtil');
const database = firebaseAdmin().database();
const AppErrors = require('../../util/AppErrors');

module.exports.matchesOnHome = async function(totalData) {
  return new Promise(async function(resolve, reject) {
    try {
      // 需要播放的四場
      const result = await livescore(totalData);
      // 目前頁面上的四場
      let realtimeHome = await database.ref('home_livescore/').once('value');
      realtimeHome = realtimeHome.val();
      realtimeHome = realtimeHome !== null ? realtimeHome : [];
      const idArray = [];
      for (let i = 0; i < result.length; i++) {
        idArray.push(result[i].bets_id);
        if (realtimeHome === []) {
          write2HomeLivescore(result[i]);
        } else if (
          Object.keys(realtimeHome).indexOf(result[i].bets_id) === -1
        ) {
          // 加入頁面
          write2HomeLivescore(result[i]);
        } else if (Object.keys(realtimeHome).indexOf(result[i].bets_id) >= 0) {
          // 補充頁面
          if (
            !realtimeHome[`${result[i].bets_id}`].away ||
						!realtimeHome[`${result[i].bets_id}`].home ||
						result[i].status === 0
          ) {
            write2HomeLivescore(result[i]);
          }
        }
      }
      for (let j = 0; j < Object.keys(realtimeHome).length; j++) {
        if (idArray.indexOf(Object.keys(realtimeHome)[j]) === -1) {
          // 從頁面中刪除
          database.ref(`home_livescore/${Object.keys(realtimeHome)[j]}`).set(null);
        }
      }

      return resolve(result);
    } catch (err) {
      console.error('Error in home/livescoreModel by DY', err);
      reject({ code: 500, error: err });
    }
  });
};

module.exports.pbpOnHome = async function(
  betsID,
  sportInfo,
  homeScores,
  awayScores
) {
  return new Promise(async function(resolve, reject) {
    try {
      database
        .ref(`home_livescore/${betsID}/Summary/info/home/Total/points`)
        .set(homeScores);
      database
        .ref(`home_livescore/${betsID}/Summary/info/away/Total/points`)
        .set(awayScores);
      database.ref(`home_livescore/${betsID}/status`).set(1);
      switch (sportInfo.sport) {
        case 'baseball': {
          database
            .ref(`home_livescore/${betsID}/Now_innings`)
            .set(sportInfo.inningNow.toString());
          database
            .ref(`home_livescore/${betsID}/Now_halfs`)
            .set(sportInfo.halfNow.toString());
          break;
        }
        case 'basketball': {
          break;
        }
        case 'icehockey': {
          break;
        }
        case 'soccer': {
          database
            .ref(`home_livescore/${betsID}/Now_clock`)
            .set(sportInfo.timer);
          break;
        }
        case 'esports': {
          database
            .ref(`home_livescore/${betsID}/Now_clock`)
            .set(sportInfo.timer);
          break;
        }
        default: {
          break;
        }
      }
      resolve('ok');
    } catch (err) {
      console.error('Error in home/livescoreModel by DY', err);
      reject({ code: 500, error: err });
    }
  });
};

async function write2HomeLivescore(firestoreData) {
  return new Promise(async function(resolve, reject) {
    try {
      if (firestoreData.status === 0) {
        database.ref(`home_livescore/${firestoreData.bets_id}`).set({
          id: firestoreData.bets_id,
          league: leagueUtil.leagueDecoder(firestoreData.league_id),
          ori_league: firestoreData.league_name_ch,
          sport: leagueUtil.league2Sport(
            leagueUtil.leagueDecoder(firestoreData.league_id)
          ).sport,
          status: firestoreData.status,
          scheduled: firestoreData.scheduled,
          spread: {
            handicap:
              firestoreData.handicap === null ? null : firestoreData.handicap,
            home_tw:
              firestoreData.home_tw === null ? null : firestoreData.home_tw,
            away_tw:
              firestoreData.away_tw === null ? null : firestoreData.away_tw
          },
          home: {
            teamname:
              firestoreData.home_alias_ch.indexOf('(') > 0
                ? firestoreData.home_alias_ch.split('(')[0].trim()
                : firestoreData.home_alias_ch,
            player_name:
              firestoreData.home_name.indexOf('(') > 0
                ? firestoreData.home_name.split('(')[1].replace(')', '').trim()
                : null,
            name: firestoreData.home_name,
            alias: firestoreData.home_alias,
            alias_ch:
              firestoreData.home_alias_ch.indexOf('(') > 0
                ? firestoreData.home_alias_ch.split('(')[0].trim()
                : firestoreData.home_alias_ch,
            image_id: firestoreData.home_image_id
          },
          away: {
            teamname:
              firestoreData.away_alias_ch.indexOf('(') > 0
                ? firestoreData.away_alias_ch.split('(')[0].trim()
                : firestoreData.away_alias_ch,
            player_name:
              firestoreData.away_name.indexOf('(') > 0
                ? firestoreData.away_name.split('(')[1].replace(')', '').trim()
                : null,
            name: firestoreData.away_name,
            alias: firestoreData.away_alias,
            alias_ch:
              firestoreData.away_alias_ch.indexOf('(') > 0
                ? firestoreData.away_alias_ch.split('(')[0].trim()
                : firestoreData.away_alias_ch,
            image_id: firestoreData.away_image_id
          },
          Summary: {
            info: {
              home: {
                Total: {
                  points: firestoreData.home_points
                }
              },
              away: {
                Total: {
                  points: firestoreData.away_points
                }
              }
            }
          }
        });
      } else {
        database.ref(`home_livescore/${firestoreData.bets_id}`).set({
          id: firestoreData.bets_id,
          league: leagueUtil.leagueDecoder(firestoreData.league_id),
          ori_league: firestoreData.league_name_ch,
          sport: leagueUtil.league2Sport(
            leagueUtil.leagueDecoder(firestoreData.league_id)
          ).sport,
          status: firestoreData.status,
          scheduled: firestoreData.scheduled,
          spread: {
            handicap:
              firestoreData.handicap === null ? null : firestoreData.handicap,
            home_tw:
              firestoreData.home_tw === null ? null : firestoreData.home_tw,
            away_tw:
              firestoreData.away_tw === null ? null : firestoreData.away_tw
          },
          home: {
            teamname:
              firestoreData.home_alias_ch.indexOf('(') > 0
                ? firestoreData.home_alias_ch.split('(')[0].trim()
                : firestoreData.home_alias_ch,
            player_name:
              firestoreData.home_name.indexOf('(') > 0
                ? firestoreData.home_name.split('(')[1].replace(')', '').trim()
                : null,
            name: firestoreData.home_name,
            alias: firestoreData.home_alias,
            alias_ch:
              firestoreData.home_alias_ch.indexOf('(') > 0
                ? firestoreData.home_alias_ch.split('(')[0].trim()
                : firestoreData.home_alias_ch,
            image_id: firestoreData.home_image_id
          },
          away: {
            teamname:
              firestoreData.away_alias_ch.indexOf('(') > 0
                ? firestoreData.away_alias_ch.split('(')[0].trim()
                : firestoreData.away_alias_ch,
            player_name:
              firestoreData.away_name.indexOf('(') > 0
                ? firestoreData.away_name.split('(')[1].replace(')', '').trim()
                : null,
            name: firestoreData.away_name,
            alias: firestoreData.away_alias,
            alias_ch:
              firestoreData.away_alias_ch.indexOf('(') > 0
                ? firestoreData.away_alias_ch.split('(')[0].trim()
                : firestoreData.away_alias_ch,
            image_id: firestoreData.away_image_id
          }
        });
      }
    } catch (err) {
      return reject(
        new AppErrors.FirebaseRealtimeError(
          `${err} at pbpOnHome on ${firestoreData.bets_id} by DY`
        )
      );
    }
    return resolve('ok');
  });
}
