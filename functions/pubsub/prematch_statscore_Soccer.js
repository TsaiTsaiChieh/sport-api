const modules = require('../util/modules');
const leagueUtil = require('../util/leagueUtil');
const db = require('../util/dbUtil');
const axios = require('axios');
const AppErrors = require('../util/AppErrors');
const Match = db.Match;
const competitionID = ['1718', '1507']; // 各種足球
const leagueID = '8';
const league = 'Soccer';

async function prematch_statscore_Soccer() {
  return new Promise(async function(resolve, reject) {
    try {
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

      const token = await queryForToken();
      for (let i = 0; i < competitionID.length; i++) {
        const URL = `https://api.statscore.com/v2/events?token=${token[0].token}&date_from=${date1}&date_to=${date2}&competition_id=${competitionID[i]}`;
        const data = await axiosForURL(URL);
        const ele = await queryForMatches(
          modules.convertTimezone(date1),
          modules.convertTimezone(date2)
        );

        const eventLength =
          data.api.data.competitions[0].seasons[0].stages[0].groups[0].events
            .length;
        for (let i = 0; i < eventLength; i++) {
          const eventID =
            data.api.data.competitions[0].seasons[0].stages[0].groups[0].events[
              i
            ].id;
          const startDate =
            modules.convertTimezone(
              data.api.data.competitions[0].seasons[0].stages[0].groups[0]
                .events[i].start_date
            ) + 28800; // 加八個小時
          const homeTeamName = change(
            data.api.data.competitions[0].seasons[0].stages[0].groups[0].events[
              i
            ].participants[0].name
          );
          const awayTeamName = change(
            data.api.data.competitions[0].seasons[0].stages[0].groups[0].events[
              i
            ].participants[1].name
          );
          for (let j = 0; j < ele.length; j++) {
            const timeOne = new Date(startDate * 1000).toString().split(' ')[2];
            const timeTwo = new Date(ele[j].scheduled * 1000)
              .toString()
              .split(' ')[2];
            if (timeOne === timeTwo) {
              if (
                homeTeamName === ele[j].home_name &&
                awayTeamName === ele[j].away_name
              ) {
                await Match.upsert({
                  bets_id: ele[j].id,
                  radar_id: eventID
                });
              }
            }
          }
        }
        // await database
        //  .ref(`${sport}/${league}/${ele.id}/Summary/status`)
        //  .set('scheduled');
      }
      return resolve('ok');
    } catch (err) {
      return reject(
        new AppErrors.AxiosError(`${err} at prematchFunctions_${league} by DY`)
      );
    }
  });
}

function change(team) {
  switch (team) {
    case 'CD Alaves': {
      return 'Alaves';
    }
    case 'Valencia CF': {
      return 'Valencia';
    }
    case 'Villarreal CF': {
      return 'Villarreal';
    }
    case 'CD Leganes': {
      return 'Leganes';
    }
    case 'Sevilla FC': {
      return 'Sevilla';
    }
    case 'Espanyol Barcelona': {
      return 'RCD Espanyol';
    }
    case 'Levante UD': {
      return 'Levante';
    }
    case 'Real Betis Balompie, S.A.D.': {
      return 'Real Betis';
    }
    case 'Seongnam Ilhwa Chunma': {
      return 'Seongnam FC';
    }
    case 'Sangju Sangmu': {
      return 'Sangju Sangmu FC';
    }
    case 'Football Club Seoul': {
      return 'FC Seoul';
    }
    case 'Ulsan Hyundai Football Club': {
      return 'Ulsan Hyundai FC';
    }
    case 'Football Club Pohang Steelers': {
      return 'Pohang Steelers FC';
    }
    default: {
      return team;
    }
  }
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
					  AND game.scheduled between '${date1}' and '${date2}'
					  AND game.status = '${leagueUtil.MATCH_STATUS.SCHEDULED}'
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
module.exports = prematch_statscore_Soccer;
