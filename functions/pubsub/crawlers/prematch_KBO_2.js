const configs = {
  league: 'KBO',
  official_URL: 'http://eng.koreabaseball.com/',
  // TODO table titles should be dynamic to crawler
  officialTeamStandingsUpperTitles: ['RK', 'TEAM', 'GAMES', 'W', 'L', 'D', 'PCT', 'GB', 'STREAK', 'HOME', 'AWAY'],
  officialTeamStandingsLowerTitles: ['RK', 'TEAM', 'AVG', 'ERA', 'RUNS', 'RUNS ALLOWED', 'HR'],
  teamNumber: 10,
  collectionName: 'baseball_KBO'
};
const modules = require('../../util/modules');
const dbEngine = require('../../util/databaseEngine');
const AppErrors = require('../../util/AppErrors');
const teamsMapping = require('../../util/teamsMapping');
const teamStandings = {};
// TODO crawler KBO prematch information:
// 1. 隊伍資訊 ex: team_base, team_hit
// team_base: 近十場戰績 L10，（本季）戰績 W-L-D，（本季）主客隊戰績 at_home/at_away，（本季）平均得分/失分 RG/-RG
// team_hit: 得分，安打，全壘打數，打擊率，上壘率，長打率
// 2. 球員資訊

async function prematch_KBO() {
  return new Promise(async function(resolve, reject) {
    try {
      // season should be a function to catch error
      const season = await getSeason(configs.league);
      await crawler_KBO(season);
    } catch (err) {
      return reject(new AppErrors.KBOCrawlersError(err.stack));
    }
  });
}

function getSeason(league) {
  return new Promise(async function(resolve, reject) {
    try {
      return resolve(await dbEngine.getSeason(modules.leagueCodebook(league).id));
    } catch (err) {
      return reject(new AppErrors.MysqlError(`${err.stack} by TsaiChieh`));
    }
  });
}

function crawler_KBO(season) {
  return new Promise(async function(resolve, reject) {
    try {
      // 官網
      // TODO searchDate should be today(default)
      const today = modules.convertTimezoneFormat(Math.floor(Date.now() / 1000), { format: 'YYYY-MM-DD' });
      console.log(today);
      const $_officialData = await crawler(`${configs.official_URL}Standings/TeamStandings.aspx?searchDate=2020-07-19`);
      const officialData = await getTeamStandingsFromOfficial($_officialData);
      insertTeamToFirestore(officialData, season);
    } catch (err) {
      return reject(new AppErrors.KBOCrawlersError(`${err.stack} by TsaiChieh`));
    }
  });
}

function crawler(URL) {
  return new Promise(async function(resolve, reject) {
    try {
      const { data } = await modules.axios.get(URL);
      const $ = modules.cheerio.load(data); // load in the HTML
      return resolve($);
    } catch (err) {
      return reject(new AppErrors.CrawlersError(`${err.stack} by TsaiChieh`));
    }
  });
}

function getTeamStandingsFromOfficial($) {
  return new Promise(async function(resolve, reject) {
    try {
      const upperTable = []; // team_base
      const lowerTable = [];
      $('td').each(function(i) {
        // upper table
        if (i < configs.officialTeamStandingsUpperTitles.length * configs.teamNumber) {
          upperTable[i] = $(this).text();
        } else { // lower table
          lowerTable.push($(this).text());
        }
      });
      return resolve({ upperTable, lowerTable });
    } catch (err) {
      return reject(new AppErrors.CrawlersError(`${err.stack} by TsaiChieh`));
    }
  });
}

function insertTeamToFirestore(officialData, season) {
  return new Promise(async function(resolve, reject) {
    try {
      const { upperTable, lowerTable } = officialData;
      // 由於官網的本季資訊會隨當天日期而變化，若無比賽或未更新完成，lowerTable 會為空陣列，藉此來判斷本季資訊有無更新再做變動
      if (lowerTable.length !== 0) {
        for (let i = 0; i < upperTable.length; i++) {
          if (i % configs.officialTeamStandingsUpperTitles.length === 0) {
            const teamName = upperTable[i + 1];
            teamStandings[teamName] = [];
            const teamId = teamsMapping.KBO_teamName2id(teamName);
            const G = upperTable[i + 2]; // games
            const Win = upperTable[i + 3]; // W
            const Loss = upperTable[i + 4]; // L
            const Draw = upperTable[i + 5]; // D
            const PCT = upperTable[i + 6]; // 勝率
            const GB = upperTable[i + 7]; // 勝差
            const STRK = upperTable[i + 8]; // streak 連勝/連輸
            const at_home = upperTable[i + 9];
            const at_away = upperTable[i + 10];
            teamStandings[teamName].push({ G });
            await insertFirestore({ G, Win, Loss, Draw, PCT, GB, STRK, at_home, at_away }, teamId, season);
          }
        }

        for (let i = 0; i < lowerTable.length; i++) {
          if (i % configs.officialTeamStandingsLowerTitles.length === 0) {
            const teamName = lowerTable[i + 1];
            const teamId = teamsMapping.KBO_teamName2id(teamName);
            const R = lowerTable[i + 4]; // Runs
            const allow_R = lowerTable[i + 5]; // Runs Allowed
            const G = parseInt(teamStandings[teamName][0].G); // games
            const per_R = String((parseInt(R) / G).toFixed(3));
            const per_allow_R = String((parseInt(allow_R) / G).toFixed(3));
            await insertFirestore({ R, allow_R, per_R, per_allow_R }, teamId, season);
          }
        }
      }
    } catch (err) {
      return reject(new AppErrors.RepackageError(`${err.stack} by TsaiChieh`));
    }
  });
}

function insertFirestore(data, teamId, season) {
  return new Promise(async function(resolve, reject) {
    try {
      const temp = {};
      temp[`season_${season}`] = {};
      temp[`season_${season}`].team_base = data;
      await modules.firestore.collection(configs.collectionName).doc(teamId).set(temp, { merge: true });
      return resolve();
    } catch (err) {
      console.error(err);
      return reject(new AppErrors.FirebaseCollectError(`${err.stack} by TsaiChieh`));
    }
  });
}

module.exports = prematch_KBO;
