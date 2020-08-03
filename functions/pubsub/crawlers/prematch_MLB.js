const AppErrors = require('../../util/AppErrors');
const { getSeason } = require('../../util/databaseEngine');
const { leagueCodebook } = require('../../util/leagueUtil');
const { getDataByAxios, setDataToFirestore, insertTeamNameToFirestore, debugLogger } = require('../../util/crawlerUtil');
const { MLB_teamName2id } = require('../../util/teamsMapping');
const firebaseAdmin = require('../../util/firebaseUtil');

const configs = {
  league: 'MLB',
  collectionName: 'baseball_MLB',
  // official_URL: 'https://www.mlb.com'
  // TODO season query params should be dynamic
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
      await repackageTeamBase(season, data);
      // const teamBase = await getTeamBase($_teamBase);
      return resolve();
    } catch (err) {
      return reject(new AppErrors.MLB_CrawlersError(err.stack));
    }
  });
}

function repackageTeamBase(season, data) {
  return new Promise(async function(resolve, reject) {
    try {
      // Go through each region
      for (let i = 0; i < data.records.length; i++) {
        for (let j = 0; j < data.records[i].teamRecords.length; j++) {
          const teamData = data.records[i].teamRecords[j];
          const teamName = teamData.team.name;
          const teamAlias = teamData.team.shortName;
          const teamId = MLB_teamName2id(teamName).id;
          const Win = String(teamData.leagueRecord.wins);
          const Loss = String(teamData.leagueRecord.losses);
          const G = String(Number(Win) + Number(Loss));
          const PCT = String(`0${teamData.leagueRecord.pct}`); // 勝率
          const GB = teamData.gamesBack; // 勝差
          const R = String(teamData.runsScored);
          const per_R = String((Number(R) / Number(G)).toFixed(1));
          const allow_R = String(teamData.runsAllowed);
          const per_allow_R = String((Number(allow_R) / Number(G)).toFixed(1));
          const STRK = teamData.streak.streakCode;
          const at_home = `${teamData.records.splitRecords[0].wins}-${teamData.records.splitRecords[0].losses}`;
          const at_away = `${teamData.records.splitRecords[1].wins}-${teamData.records.splitRecords[1].losses}`;
          // add create time & update time to debug
          const update_time = firebaseAdmin().firestore.Timestamp.now();

          await insertTeamNameToFirestore(teamAlias, { collectionName: configs.collectionName, teamId });
          await setDataToFirestore({ Win, Loss, G, PCT, GB, R, per_R, allow_R, per_allow_R, STRK, at_home, at_away, update_time }, { season, fieldName: 'team_base', collectionName: configs.collectionName, teamId });
          // debugLogger({ league: configs.league, teamId, teamName: teamAlias, fieldName: 'team_base' });
        }
      }
      return resolve();
    } catch (err) {
      return reject(new AppErrors.RepackageError());
    }
  });
}

module.exports = prematch_MLB;
