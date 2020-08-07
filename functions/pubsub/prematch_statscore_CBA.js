const modules = require('../util/modules');
const leagueUtil = require('../util/leagueUtil');
const db = require('../util/dbUtil');
const AppErrors = require('../util/AppErrors');
const axios = require('axios');
const Match = db.Match;
const competitionID = '133'; // CBA
const leagueID = '2319';
const league = 'CBA';
async function prematch_statscore_CBA() {
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
    case 1940: {
      return 'Bayi Nanchang Rockets';
    }
    case 2704: {
      return 'Beijing Royal Fighters';
    }
    case 1941: {
      return 'Beijing Ducks';
    }
    case 1944: {
      return 'Fujian Sturgeons';
    }
    case 1945: {
      return 'Guangdong Southern Tigers';
    }
    case 1948: {
      return 'Jilin Northeast Tigers';
    }
    case 1949: {
      return 'Liaoning Dinosaurs';
    }
    case 2703: {
      return 'NanJing TongXi DaSheng';
    }
    case 1950: {
      return 'Qingdao Double Star Eagle';
    }
    case 1951: {
      return 'Shangdong Golden Stars';
    }
    case 1952: {
      return 'Shanghai Sharks';
    }
    case 1942: {
      return 'Shenzhen Aviators';
    }
    case 1943: {
      return 'Guangzhou Long-Lions';
    }
    case 2485: {
      return 'Sichuan Whales';
    }
    case 1939: {
      return 'Tianjin Pioneers';
    }
    case 1937: {
      return 'Xinjiang Flying Tigers';
    }
    case 1938: {
      return 'Zhejiang Golden Bulls';
    }
    case 1946: {
      return 'Zhejiang Lions';
    }
    case 1947: {
      return 'Jiangsu Dragons';
    }
    case 1953: {
      return 'Shanxi Guotou Loongs';
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
module.exports = prematch_statscore_CBA;
