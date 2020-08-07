const modules = require('../util/modules');
const leagueUtil = require('../util/leagueUtil');
const db = require('../util/dbUtil');
const AppErrors = require('../util/AppErrors');
const axios = require('axios');
const Match = db.Match;
const competitionID = '101'; // NBA
const leagueID = '2274';
const league = 'NBA';
async function prematch_statscore_NBA() {
  return new Promise(async function(resolve, reject) {
    try {
      const token = await queryForToken();
      const unix = Math.floor(Date.now() / 1000);
      const date2 = modules.convertTimezoneFormat(unix, {
        format: 'YYYY-MM-DD 00:00:00',
        op: 'add',
        value: 2,
        unit: 'days'
      });
      const date1 = modules.convertTimezoneFormat(unix, {
        format: 'YYYY-MM-DD 00:00:00',
        op: 'add',
        value: -1,
        unit: 'days'
      });
      const URL = `https://api.statscore.com/v2/events?token=${token[0].token}&date_from=${date1}&date_to=${date2}&competition_id=${competitionID}&limit=100`;
      const data = await axiosForURL(URL);
      const ele = await queryForMatches();

      const eventLength =
        data.api.data.competitions[0].seasons[0].stages[0].groups[0].events
          .length;
      // eventLength
      for (let i = 0; i < eventLength; i++) {
        const eventID =
          data.api.data.competitions[0].seasons[0].stages[0].groups[0].events[i]
            .id;
        const startDate =
          modules.convertTimezone(
            data.api.data.competitions[0].seasons[0].stages[0].groups[0].events[
              i
            ].start_date
          ) + 28800; // 加八個小時
        const homeTeamID =
          data.api.data.competitions[0].seasons[0].stages[0].groups[0].events[i]
            .participants[0].id;
        const awayTeamID =
          data.api.data.competitions[0].seasons[0].stages[0].groups[0].events[i]
            .participants[1].id;
        const homeTeamName = teamTrans(homeTeamID);
        const awayTeamName = teamTrans(awayTeamID);
        for (let j = 0; j < ele.length; j++) {
          const timeOne = new Date(startDate * 1000).toString().split(':')[0];
          const timeTwo = new Date(ele[j].scheduled * 1000)
            .toString()
            .split(':')[0];
          if (timeOne === timeTwo) {
            if (
              homeTeamName === ele[j].home_name &&
              awayTeamName === ele[j].away_name
            ) {
              Match.upsert({
                bets_id: ele[j].id,
                radar_id: eventID
              });
            }
          }
        }
      }

      return resolve('ok');
    } catch (err) {
      return reject(
        new AppErrors.AxiosError(`${err} at prematchFunctions_${league} by DY`)
      );
    }
  });
}

async function axiosForURL(URL) {
  return new Promise(async function(resolve, reject) {
    try {
      const { data } = await axios(URL);
      return resolve(data);
    } catch (err) {
      return reject(
        new AppErrors.AxiosError(`${err} at prematchFunctions_${league} by DY`)
      );
    }
  });
}

function teamTrans(team) {
  switch (team) {
    case 1256: {
      return 'Houston Rockets';
    }
    case 1283: {
      return 'Oklahoma City Thunder';
    }
    case 1064: {
      return 'Milwaukee Bucks';
    }
    case 1393: {
      return 'Chicago Bulls';
    }
    case 1195: {
      return 'Los Angeles Clippers';
    }
    case 1376: {
      return 'Golden State Warriors';
    }
    case 1106: {
      return 'Toronto Raptors';
    }
    case 1495: {
      return 'Washington Wizards';
    }
    case 1040: {
      return 'Philadelphia 76ers';
    }
    case 1233: {
      return 'Denver Nuggets';
    }
    case 1293: {
      return 'Los Angeles Lakers';
    }
    case 1675: {
      return 'Brooklyn Nets';
    }
    case 1177: {
      return 'New York Knicks';
    }
    case 1431: {
      return 'Indiana Pacers';
    }
    case 1412: {
      return 'New Orleans Pelicans';
    }
    case 1198: {
      return 'Cleveland Cavaliers';
    }
    case 1176: {
      return 'Atlanta Hawks';
    }
    case 1383: {
      return 'Utah Jazz';
    }
    case 1560: {
      return 'Sacramento Kings';
    }
    case 1093: {
      return 'Portland Trail Blazers';
    }
    case 1460: {
      return 'San Antonio Spurs';
    }
    case 1534: {
      return 'Orlando Magic';
    }
    case 1253: {
      return 'Phoenix Suns';
    }
    case 1549: {
      return 'Boston Celtics';
    }
    case 1541: {
      return 'Detroit Pistons';
    }
    case 1201: {
      return 'Miami Heat';
    }
    case 1036: {
      return 'Memphis Grizzlies';
    }
    case 1354: {
      return 'Minnesota Timberwolves';
    }
    case 1120: {
      return 'Charlotte Hornets';
    }
    case 1131: {
      return 'Dallas Mavericks';
    }
    default: {
      return team;
    }
  }
}

async function queryForToken() {
  return new Promise(async function(resolve, reject) {
    try {
      const queries = await db.sequelize.query(
        // take 169 ms
        `(
					SELECT token
					  FROM tokens
					 WHERE tokens.name='statscore'
				)`,
        {
          type: db.sequelize.QueryTypes.SELECT
        }
      );
      return resolve(queries);
    } catch (err) {
      return reject(`${err.stack} by DY`);
    }
  });
}

async function queryForMatches() {
  return new Promise(async function(resolve, reject) {
    try {
      const queries = await db.sequelize.query(
        // take 169 ms
        `(
				 SELECT game.bets_id as id, game.scheduled as scheduled, home.name as home_name, away.name as away_name
					 FROM matches as game,
						    match__teams as home,
							  match__teams as away
					WHERE game.league_id = '${leagueID}'
						AND game.status = '${leagueUtil.MATCH_STATUS.SCHEDULED}'
						AND game.radar_id IS NULL
				  	AND home.team_id = game.home_id
				  	AND away.team_id = game.away_id
				)`,
        {
          type: db.sequelize.QueryTypes.SELECT
        }
      );
      return resolve(queries);
    } catch (err) {
      return reject(`${err.stack} by DY`);
    }
  });
}
module.exports = prematch_statscore_NBA;
