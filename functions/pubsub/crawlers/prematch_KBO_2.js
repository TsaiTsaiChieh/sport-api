const configs = {
  league: 'KBO',
  official_URL: 'http://eng.koreabaseball.com/',
  blackboard_URL: 'https://mykbostats.com/',
  blackboardTeamTableTitles: ['Rank/Team', 'W', 'L', 'D', 'PCT', 'GB', 'STRK/LAST 10G'],
  collectionName: 'baseball_KBO'
};
const modules = require('../../util/modules');
const AppErrors = require('../../util/AppErrors');

// TODO crawler KBO prematch information:
// 1. 隊伍資訊 ex: team_base, team_hit
// team_base: 近十場戰績 L10，（本季）戰績 W-L-D，（本季）主客隊戰績 at_home/at_away，平均得分/失分 RG/-RG
// team_hit: 得分，安打率，全壘打數，打擊率，上壘率，長打率
// 2. 球員資訊

async function prematch_KBO() {
  return new Promise(async function(resolve, reject) {
    try {
      await crawler_KBO();
    } catch (err) {
      return reject(new AppErrors.KBOCrawlersError(err.stack));
    }
  });
}

function crawler_KBO() {
  return new Promise(async function(resolve, reject) {
    try {
      // 官網
      // await crawler(configs.official_URL);
      // 黑板
      const blackboardData = await crawler(configs.blackboard_URL);
      const blackboardTeamData = await getTeamsStandingsFromBlackboard(blackboardData);
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
  name = name.toLowerCase();
  switch (name) {
    case 'lotte giants':
      return 2408;
    case 'samsung lions':
      return 3356;
    case 'kia tigers':
      return 4202;
    case 'doosan bears':
      return 2406;
    case 'hanwha eagles':
      return 2405;
    case 'sk wyverns':
      return 8043;
    case 'lg twins':
      return 2407;
    case 'kiwoom heroes':
      return 269103;
    case 'nc dinos':
      return 3353;
    case 'kt wiz':
      return 3354;
    default:
      return 'unknown team name';
  }
}

module.exports = prematch_KBO;
