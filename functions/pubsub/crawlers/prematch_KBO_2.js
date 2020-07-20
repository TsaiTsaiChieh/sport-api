const configs = {
  league: 'KBO',
  official_URL: 'http://eng.koreabaseball.com/',
  blackboard_URL: 'https://mykbostats.com/',
  // TODO table titles should be dynamic to crawler
  officialTeamStandingsUpperTitles: ['RK', 'TEAM', 'GAMES', 'W', 'L', 'D', 'PCT', 'GB', 'STREAK', 'HOME', 'AWAY'],
  officialTeamStandingsLowerTitles: ['RK', 'TEAM', 'AVG', 'ERA', 'RUNS', 'RUNS ALLOWED', 'HR'],
  blackboardTeamTableTitles: ['Rank/Team', 'W', 'L', 'D', 'PCT', 'GB', 'STRK/LAST 10G'],
  blackboardTeamSplitsTitles: ['Season', 'G', 'W', 'L', 'D', 'W%', 'R/G', '-R/G', 'R', '-R', 'dR', 'H/G', '-H/G', 'H',
    '-H', 'dH', 'HR/G', '-HR/G', 'HR', '-HR', 'dHR', 'BA', 'ERA_sp', 'ERA_rp'],
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
// team_hit: 得分，安打率，全壘打數，打擊率，上壘率，長打率
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
      // combineTwoTableFromOfficial(officialData);

      // 黑板
      // const $_blackboardData = await crawler(configs.blackboard_URL);
      // const blackboardTeamData = await getTeamsStandingsFromBlackboard($_blackboardData);
      // const $_blackboardTeamSplitsData = await crawler(`${configs.blackboard_URL}stats/team_splits/${season}`);
      // const blackboardTeamSplitsData = await getTeamSplitsFromBlackboard($_blackboardTeamSplitsData);
      // console.log(blackboardTeamData, blackboardTeamSplitsData);
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
            // const data = repackageUpperTable({ i, teamName, G, Win, Loss, Draw, PCT, GB, STRK, at_home, at_away }, season);
            teamStandings[teamName].push({ G });
            await insertFirestoreForUpperTable({ G, Win, Loss, Draw, PCT, GB, STRK, at_home, at_away }, teamId, season);
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
            await insertFirestoreForLowerTable({ R, allow_R, per_R, per_allow_R }, teamId, season);
          }
        }
      }
    } catch (err) {
      return reject(new AppErrors.RepackageError(`${err.stack} by TsaiChieh`));
    }
  });
}

function repackageUpperTable(upperTable, season) {
  try {
    const { G, Win, Loss, Draw, PCT, GB, STRK, at_home, at_away } = upperTable;
    return {
      G, Win, Loss, Draw, PCT, GB, STRK, at_home, at_away
    };
  } catch (err) {
    console.error(`${err.stack} by TsaiChieh`);
    throw new AppErrors.RepackageError(`${err.stack} by TsaiChieh`);
  }
}

function insertFirestoreForUpperTable(data, teamId, season) {
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

function insertFirestoreForLowerTable(data, teamId, season) {
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
// function combineTwoTableFromOfficial(officialData) {
//   try {
//     console.log(officialData);
//   } catch (err) {
//     console.error(`${err.stack} by TsaiChieh`);
//     throw new AppErrors.RepackageError(`${err.stack} by TsaiChieh`);
//   }
// }
function getTeamsStandingsFromBlackboard($) {
  return new Promise(async function(resolve, reject) {
    try {
      const tdArray = [];
      let teamsCount = 0;
      $('td').each(function(i) {
        // The i is to be filtered when it is a multiple of 7
        if (i % configs.blackboardTeamTableTitles.length === 0) {
          teamsCount += 1;
          const removeLineBreaks = $(this).text().replace(`\n${teamsCount}\n\n`, '').trim();
          tdArray[i] = removeLineBreaks;
        } else tdArray[i] = $(this).text();
      });
      const data = decompose_STRK_LAST(tdArray);
      return resolve(decomposeTeamBaseAndName(data));
    } catch (err) {
      return reject(new AppErrors.CrawlersError(`${err.stack} by TsaiChieh`));
    }
  });
}

// ex: 將 3W / 7W 3L 0D 拆成 3W 和 7W 3L 0D (連贏連敗/近十場)
function decompose_STRK_LAST(tdArray) {
  const temp = [...tdArray]; // Deep copy

  let L10_Array = [];
  for (let i = 0; i < tdArray.length; i++) {
    for (let j = 0; j < tdArray.length; j = j + configs.blackboardTeamTableTitles.length) {
      if (i === configs.blackboardTeamTableTitles.length - 1) {
        const ele = tdArray[i + j];
        const slashIndex = ele.indexOf('/');
        const STRK = ele.substring(0, slashIndex).trim();
        const L10 = ele.substring(slashIndex + 1, ele.length).trim();
        L10_Array.push(L10);
        temp.splice(j + configs.blackboardTeamTableTitles.length - 1, 1, STRK);
      }
    }
  }
  L10_Array = repackage_L10(L10_Array);
  let j = 0;
  for (let i = configs.blackboardTeamTableTitles.length; i <= temp.length; i = i + configs.blackboardTeamTableTitles.length + 1) {
    temp.splice(i, 0, L10_Array[j]);
    j++;
  }
  return temp;
}

// 7W 3L 0D 改為 7-0-3
function repackage_L10(data) {
  const temp = [];
  for (let i = 0; i < data.length; i++) {
    const ele = data[i];
    const winIndex = ele.indexOf('W');
    const lossIndex = ele.indexOf('L');
    const win = ele.substring(0, winIndex).trim();
    const loss = ele.substring(winIndex + 1, lossIndex).trim();
    const fair = ele.substring(lossIndex + 1, ele.length - 1).trim();
    const L10 = `${win}-${fair}-${loss}`;
    temp.push(L10);
  }
  return temp;
}

function decomposeTeamBaseAndName(teamsStats) {
  return new Promise(async function(resolve, reject) {
    try {
      const teamBase = [];
      const teamNames = [];
      for (let i = 0; i < teamsStats.length; i = i + configs.blackboardTeamTableTitles.length + 1) {
        teamNames.push({ team_id: String(teamName2id(teamsStats[i])), team_name: teamsStats[i] });
        const temp = {
          G: String(Number.parseInt(teamsStats[i + 1]) + Number.parseInt(teamsStats[i + 2]) + Number.parseInt(teamsStats[i + 3])),
          Win: teamsStats[i + 1],
          Draws: teamsStats[i + 3],
          Loss: teamsStats[i + 2],
          PCT: `${teamsStats[i + 4]}`,
          GB: teamsStats[i + 5],
          STRK: teamsStats[i + 6],
          L10: teamsStats[i + 7]
        };
        teamBase.push(temp);
      }
      return resolve({ teamBase, teamNames });
    } catch (err) {
      return reject(new AppErrors.RepackageError(`${err.stack} by TsaiChieh`));
    }
  });
}

function teamName2id(name) {
  name = name.toLowerCase().trim();
  switch (name) {
    case 'lotte giants':
    case 'lotte':
      return 2408;
    case 'samsung lions':
    case 'samsung':
      return 3356;
    case 'kia tigers':
    case 'kia':
      return 4202;
    case 'doosan bears':
    case 'doosan':
      return 2406;
    case 'hanwha eagles':
    case 'hanwha':
      return 2405;
    case 'sk wyverns':
    case 'sk':
      return 8043;
    case 'lg twins':
    case 'lg':
      return 2407;
    case 'kiwoom heroes':
    case 'kiwoom':
      return 269103;
    case 'nc':
    case 'nc dinos':
      return 3353;
    case 'kt wiz':
    case 'kt':
      return 3354;
    default:
      return 'Unknown team name';
  }
}

function getTeamSplitsFromBlackboard($) {
  return new Promise(async function(resolve, reject) {
    try {
      const tdArray = [];
      $('td').each(function(i) {
        // Just want the season table
        if (i < configs.blackboardTeamSplitsTitles.length * configs.teamNumber) {
          if (i % configs.blackboardTeamSplitsTitles.length === 0) {
            const removeLineBreaks = $(this).text().replace('\n\n', '').trim();
            tdArray[i] = removeLineBreaks;
          } else {
            const removeLineBreaks = $(this).text().replace('\n', '').trim();
            tdArray[i] = removeLineBreaks;
          }
        }
      });
      return resolve(tdArray);
    } catch (err) {
      return reject(new AppErrors.CrawlersError(`${err.stack} by TsaiChieh`));
    }
  });
}

module.exports = prematch_KBO;
