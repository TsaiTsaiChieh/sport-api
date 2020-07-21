const configs = {
  league: 'KBO',
  official_URL: 'http://eng.koreabaseball.com/',
  // TODO table titles should be dynamic to crawler
  officialTeamStandingsUpperTitles: ['RK', 'TEAM', 'GAMES', 'W', 'L', 'D', 'PCT', 'GB', 'STREAK', 'HOME', 'AWAY'],
  officialTeamStandingsLowerTitles: ['RK', 'TEAM', 'AVG', 'ERA', 'RUNS', 'RUNS ALLOWED', 'HR'],
  pitcherByTeamPage1Titles: ['PLAYER', 'TEAM', 'ERA',	'G',	'CG', 'SHO', 'W', 'L', 'SV', 'HLD', 'PCT', 'PA', 'NP', 'IP', 'H', '2B', '3B', 'HR'],
  pitcherByTeamPage2Titles: ['PLAYER', 'TEAM', 'SAC', 'SF', 'BB', 'IBB', 'HBP', 'SO', 'WP', 'BK', 'R', 'ER', 'BS', 'WHIP', 'OAVG', 'QS'],
  teamNumber: 10,
  collectionName: 'baseball_KBO',
  // DOOSAN, KIWOOM, SK, LG, NC, KT, KIA, SAMSUNG, HANWHA, LOTTE
  teamCode: ['OB', 'WO', 'SK', 'LG', 'NC', 'KT', 'HT', 'SS', 'HH', 'LT']
};
const modules = require('../../util/modules');
const dbEngine = require('../../util/databaseEngine');
const AppErrors = require('../../util/AppErrors');
const teamsMapping = require('../../util/teamsMapping');
const teamStandings = {};
// TODO crawler KBO prematch information:
// 1. 隊伍資訊 ex: team_base, team_hit
// team_base: 近十場戰績 L10，（本季）戰績 W-L-D，（本季）主客隊戰績 at_home/at_away，（本季）平均得分/失分 RG/-RG (per_R & allow_per_R)
// team_hit: 得分，安打，全壘打數，打擊率，上壘率，長打率
// 2. 本季投手資訊
// 勝敗，防禦率，三振數

async function prematch_KBO() {
  return new Promise(async function(resolve, reject) {
    try {
      // season should be a function to catch error
      const season = await getSeason(configs.league);
      await crawler_KBO(season);
      await crawlerPitcher(season);
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
      const $_officialData = await crawler(`${configs.official_URL}Standings/TeamStandings.aspx?searchDate=2020-07-20`);
      const officialData = await getTeamStandingsFromOfficial($_officialData);
      insertTeamToFirestore(officialData, season);
      return resolve();
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

function crawlerPitcher(season) {
  return new Promise(async function(resolve, reject) {
    try {
      // TODO deploy should change to configs.teamCode.length
      for (let i = 0; i < 1; i++) {
        const teamCode = configs.teamCode[i];
        const $_pitchingStats = await crawler(`${configs.official_URL}Stats/PitchingByTeams.aspx?codeTeam=${teamCode}`);
        const pitchingStatsData = await getPitchingStatsFromOfficial($_pitchingStats);
        repackagePitcherData(pitchingStatsData, season);
      }
    } catch (err) {
      return reject(new AppErrors.KBOCrawlersError(`${err.stack} by TsaiChieh`));
    }
  });
}

function getPitchingStatsFromOfficial($) {
  return new Promise(async function(resolve, reject) {
    try {
      const pitcherStats = [];
      const pitcherIds = [];
      $('td').each(function(i, ele) {
        if (i % configs.pitcherByTeamPage1Titles.length === 0) {
          const pitcherId = $(ele).find('a').attr('href').replace('/teams/playerinfopitcher/summary.aspx?pcode=', '');
          pitcherIds.push(pitcherId);
        }
        pitcherStats.push($(this).text());
      });
      return resolve({ pitcherStats, pitcherIds });
    } catch (err) {
      return reject(new AppErrors.CrawlersError(`${err.stack} by TsaiChieh`));
    }
  });
}

function repackagePitcherData(pitchingStats, season) {
  const { pitcherStats, pitcherIds } = pitchingStats;
  // console.log(pitcherIds);
  let j = 0;
  const data = {};
  const teamId = teamsMapping.KBO_teamName2id(pitcherStats[1]);
  for (let i = 0; i < pitcherStats.length; i++) {
    if (i % configs.pitcherByTeamPage1Titles.length === 0) {
      const name = pitcherStats[i];
      const pitcherId = pitcherIds[j];
      const ERA = pitcherStats[i + 3];
      const G = pitcherStats[i + 4];
      data[pitcherId] = { name, ERA, G };
      j++;
    }
  }
  insertPitcherToFirestore(data, teamId, season);
}

function insertPitcherToFirestore(officialData, teamId, season) {
  return new Promise(async function(resolve, reject) {
    try {
      const data = {};
      data[`season_${season}`] = {};
      data[`season_${season}`].pitchers = {};
      data[`season_${season}`].pitchers = officialData;
      // console.log(data);
      // console.log(officialData.pitcherId);
      const result = await modules.firestore.collection(configs.collectionName).doc(teamId).set(data, { merge: true });
      console.log(result);
    } catch (err) {
      return reject(new AppErrors.FirebaseCollectError(`${err.stack} by TsaiChieh`));
    }
  });
}
module.exports = prematch_KBO;
