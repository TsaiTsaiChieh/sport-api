const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
module.exports.eSoccer = {};

const firebaseName = 'pagetest_eSoccer';
module.exports.eSoccer.upcoming = async function (date) {
  const _date = modules.dateFormat(date);
  const sportID = 1;
  const leagueArray = [22614, 22808, 22764, 22537, 22724];
  const results = [];

  for (let i = 0; i < leagueArray.length; i++) {
    const leagueID = leagueArray[i];

    const URL = `https://api.betsapi.com/v2/events/upcoming?sport_id=${sportID}&token=${modules.betsToken}&league_id=${leagueID}&day=${date}`;
    try {
      const { data } = await modules.axios(URL);
      const Match = await db.Match.sync();
      const MatchTeam = await db.Team.sync();
      for (let j = 0; j < data.results.length; j++) {
        const ele = data.results[j];
        if (ele.home.name.indexOf('Esports') !== -1) {
          ele.home.name = ele.home.name.replace('Esports', '');
        }

        if (ele.away.name.indexOf('Esports') !== -1) {
          ele.away.name = ele.away.name.replace('Esports', '');
        }
        results.push(
          modules.firestore
            .collection(firebaseName)
            .doc(ele.id)
            .set(repackage_bets(ele), { merge: true })
        );
        results.push(
          modules.firestore
            .collection(firebaseName)
            .doc(ele.id)
            .set(repackage_bets(ele), { merge: true })
        );

        try {
          const dataEvent = {
            bets_id: ele.id,
            league_id: '22000',
            ori_league_id: ele.league.id,
            sport_id: ele.sport_id,
            ori_sport_id: ele.sport_id,
            home_id: ele.home.id,
            away_id: ele.away.id,
            scheduled: Number.parseInt(ele.time),
            scheduled_tw: Number.parseInt(ele.time) * 1000,
            flag_prematch: 1,
            status: 2
          };
          await Match.upsert(dataEvent);

          const dataHomeTeam = {
            team_id: ele.home.id,
            league_id: '22000',
            sport_id: ele.sport_id,
            name: ele.home.name,
            alias: ele.home.name,
            alias_ch: ele.home.name,
            image_id: ele.home.image_id
          };

          const dataAwayTeam = {
            team_id: ele.away.id,
            league_id: '22000',
            sport_id: ele.sport_id,
            name: ele.away.name,
            alias: ele.away.name,
            alias_ch: ele.away.name,
            image_id: ele.away.image_id
          };
          await MatchTeam.upsert(dataHomeTeam);
          await MatchTeam.upsert(dataAwayTeam);
        } catch (err) {
          console.error(err);
        }
      }
    } catch (error) {
      console.error(
        `Error in pubsub/util/prematchFunctions_ESoccer upcoming axios by DY on ${Date.now()}`,
        error
      );
      return error;
    }
  }

  console.log('esport scheduled success');
  return new Promise(async function (resolve, reject) {
    try {
      resolve(await Promise.all(results));
    } catch (error) {
      console.error(
        `Error in pubsub/util/prematchFunctions_ESoccer upcoming axios by DY on ${Date.now()}`,
        error
      );
      reject(error);
    }
  });
};

function repackage_bets(ele) {
  let leagueCH = '';
  switch (ele.league.id) {
    case '22614': {
      leagueCH = '足球電競之戰－8分鐘';
      break;
    }
    case '22808': {
      leagueCH = '墨西哥聯賽－12分鐘';
      break;
    }
    case '22764': {
      leagueCH = 'FUFV聯賽－12分鐘';
      break;
    }
    case '22537': {
      leagueCH = '職業聯賽－12分鐘';
      break;
    }
    case '22724': {
      leagueCH = '職業球員盃－12分鐘';
      break;
    }
    default: {
    }
  }
  let homeTeamName = '';
  let homePlayerName = '';
  let awayTeamName = '';
  let awayPlayerName = '';

  if (ele.home.name.indexOf('(') !== -1) {
    homeTeamName = ele.home.name.split('(')[0];
    homePlayerName = ele.home.name.split('(')[1].replace(')', '');
  } else {
    homeTeamName = ele.home.name;
    homePlayerName = null;
  }
  if (ele.away.name.indexOf('(') !== -1) {
    awayTeamName = ele.away.name.split('(')[0];
    awayPlayerName = ele.away.name.split('(')[1].replace(')', '');
  } else {
    awayTeamName = ele.away.name;
    awayPlayerName = null;
  }

  return {
    update_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(new Date()),
    scheduled: Number.parseInt(ele.time),
    scheduled_tw: modules.firebaseAdmin.firestore.Timestamp.fromDate(
      new Date(Number.parseInt(ele.time) * 1000)
    ),
    bets_id: ele.id,
    league: {
      ori_bets_id: ele.league.id,
      bets_id: '22000',
      name: 'eSoccer',
      name_ch: leagueCH
    },
    home: {
      name: ele.home.name,
      alias: ele.home.name,
      alias_ch: ele.home.name,
      team_name: homeTeamName,
      player_name: homePlayerName,
      image_id: ele.home.image_id,
      bets_id: ele.home.id
    },
    away: {
      name: ele.away.name,
      alias: ele.away.name,
      alias_ch: ele.away.name,
      team_name: awayTeamName,
      player_name: awayPlayerName,
      image_id: ele.away.image_id,
      bets_id: ele.away.id
    },
    flag: {
      spread: 0,
      totals: 0,
      status: 2,
      prematch: 1
    }
  };
}
