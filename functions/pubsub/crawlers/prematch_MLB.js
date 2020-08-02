const AppErrors = require('../../util/AppErrors');
const { getSeason } = require('../../util/databaseEngine');
const { leagueCodebook } = require('../../util/leagueUtil');
const { getDataByAxios } = require('../../util/crawlerUtil');
const { MLB_teamName2id } = require('../../util/teamsMapping');
// const https = require('https');

const configs = {
  league: 'MLB',
  // official_URL: 'https://www.mlb.com'
  teamBaseAPI: 'https://statsapi.mlb.com/api/v1/standings?leagueId=103,104&season=2020&date=2020-09-27&standingsTypes=regularSeason&hydrate=division,conference,sport,league,team(nextSchedule(team,gameType=%5BR,F,D,L,W,C%5D,inclusive=false),previousSchedule(team,gameType=%5BR,F,D,L,W,C%5D,inclusive=true))'
};

async function prematch_MLB(req, res) {
  return new Promise(async function(resolve, reject) {
    try {
      const season = await getSeason(leagueCodebook(configs.league).id);
      await crawlerTeamBase(season);

      return resolve(res.json('MLB'));
    } catch (err) {
      return reject(new AppErrors.MLB_CrawlersError(err.stack));
    }
  });
}

function crawlerTeamBase(season) {
  return new Promise(async function(resolve, reject) {
    try {
      const data = await getDataByAxios(`${configs.teamBaseAPI}`);
      await repackageTeamBase(data);
      // const teamBase = await getTeamBase($_teamBase);
      return resolve();
    } catch (err) {
      return reject(new AppErrors.MLB_CrawlersError(err.stack));
    }
  });
}

function repackageTeamBase(data) {
  return new Promise(async function(resolve, reject) {
    try {
      // Go through each region
      for (let i = 0; i < data.records.length; i++) {
        for (let j = 0; j < data.records[i].teamRecords.length; j++) {
          const teamData = data.records[i].teamRecords[j];
          const teamName = teamData.team.name;
          const teamId = MLB_teamName2id(teamName).id;
          const Win = String(teamData.leagueRecord.wins);
          const Loss = String(teamData.leagueRecord.losses);
          const G = String(Number(Win) + Number(Loss));
          const PCT = String(`0${teamData.leagueRecord.pct}`);
          // const GB = teamData.leagueGamesBack; // not correct
          const R = String(teamData.runsScored);
          const allow_R = String(teamData.runsAllowed);
          const STRK = teamData.streak.streakCode;
          console.log(teamName, teamId, G, PCT, R, allow_R, STRK);
        }
      }
    } catch (err) {
      return reject(new AppErrors.RepackageError());
    }
  });
}
module.exports = prematch_MLB;
