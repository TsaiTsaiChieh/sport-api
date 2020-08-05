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
      const URL = `https://api.statscore.com/v2/events?token=${token[0].token}&date_from=${date1}&date_to=${date2}&competition_id=${competitionID}`;
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
        let homeTeamName =
          data.api.data.competitions[0].seasons[0].stages[0].groups[0].events[i]
            .participants[0].name;
        let awayTeamName =
          data.api.data.competitions[0].seasons[0].stages[0].groups[0].events[i]
            .participants[1].name;

        homeTeamName = teamTrans(homeTeamName);
        awayTeamName = teamTrans(awayTeamName);
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
    case 'Houston Rockets': {
      return 'Houston Rockets';
    }
    case 'Oklahoma City Thunder': {
      return 'Oklahoma City Thunder';
    }
    case 'Milwaukee Bucks': {
      return 'Milwaukee Bucks';
    }
    case 'Chicago Bulls': {
      return 'Chicago Bulls';
    }
    case 'Los Angeles Clippers': {
      return 'Los Angeles Clippers';
    }
    case 'Golden State Warriors': {
      return 'Golden State Warriors';
    }
    case 'Toronto Raptors': {
      return 'Toronto Raptors';
    }
    case 'Washington Wizards': {
      return 'Washington Wizards';
    }
    case 'Philadelphia 76ers': {
      return 'Philadelphia 76ers';
    }
    case 'Denver Nuggets': {
      return 'Denver Nuggets';
    }
    case 'Los Angeles Lakers': {
      return 'Los Angeles Lakers';
    }
    case 'Brooklyn Nets': {
      return 'Brooklyn Nets';
    }
    case 'New York Knicks': {
      return 'New York Knicks';
    }
    case 'Indiana Pacers': {
      return 'Indiana Pacers';
    }
    case 'New Orleans Pelicans': {
      return 'New Orleans Pelicans';
    }
    case 'Cleveland Cavaliers': {
      return 'Cleveland Cavaliers';
    }
    case 'Atlanta Hawks': {
      return 'Atlanta Hawks';
    }
    case 'Utah Jazz': {
      return 'Utah Jazz';
    }
    case 'Sacramento Kings': {
      return 'Sacramento Kings';
    }
    case 'Portland Trail Blazers': {
      return 'Portland Trail Blazers';
    }
    case 'San Antonio Spurs': {
      return 'San Antonio Spurs';
    }
    case 'Orlando Magic': {
      return 'Orlando Magic';
    }
    case 'Phoenix Suns': {
      return 'Phoenix Suns';
    }
    case 'Boston Celtics': {
      return 'Boston Celtics';
    }
    case 'Detroit Pistons': {
      return 'Detroit Pistons';
    }
    case 'Miami Heat': {
      return 'Miami Heat';
    }
    case 'Memphis Grizzlies': {
      return 'Memphis Grizzlies';
    }
    case 'Minnesota Timberwolves': {
      return 'Minnesota Timberwolves';
    }
    case 'Charlotte Hornets': {
      return 'Charlotte Hornets';
    }
    case 'Dallas Mavericks': {
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

async function queryForMatches(date1, date2) {
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
