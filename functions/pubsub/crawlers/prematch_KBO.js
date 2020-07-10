const league = 'KBO';
const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
const AppErrors = require('../../util/AppErrors');
const dbEngine = require('../../util/databaseEngine');
const KBO_URL = 'https://mykbostats.com/';
const teamTableTitles = ['Rank/Team', 'W', 'L', 'D', 'PCT', 'GB', 'STRK/LAST 10G'];
const teamTableFieldCount = teamTableTitles.length;

// 1. 取得各隊伍的資訊
// 2. insert match__teams
async function prematch_KBO() {
  return new Promise(async function(resolve, reject) {
    try {
      const teamData = await getTeamsStandings();
      await insertToTeamDB(teamData);
    } catch (err) {
      return reject(new AppErrors.KBOCrawlersError(`${err.stack} by TsaiChieh`));
    }
  });
}

function getTeamsStandings() {
  return new Promise(async function(resolve, reject) {
    try {
      const { data } = await modules.axios.get(KBO_URL);
      const $ = modules.cheerio.load(data); // load in the HTML
      return resolve(await getTeamsStats($));
    } catch (err) {
      return reject(new AppErrors.CrawlersError(`${err.stack} by TsaiChieh`));
    }
  });
}

function getTeamsStats($) {
  return new Promise(async function(resolve, reject) {
    try {
      const tdArray = [];
      let teamsCount = 0;
      $('td').each(function(i) {
        // The i is to be filtered when it is a multiple of 7
        if (i % teamTableFieldCount === 0) {
          teamsCount += 1;
          const removeLineBreaks = $(this).text().replace(`\n${teamsCount}\n\n`, '').trim();
          tdArray[i] = removeLineBreaks;
        } else tdArray[i] = $(this).text();
      });
      const data = decompose_STRK_LAST(tdArray);
      return resolve(repackageTeamStats(data));
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
    for (let j = 0; j < tdArray.length; j = j + teamTableFieldCount) {
      if (i === teamTableFieldCount - 1) {
        const ele = tdArray[i + j];
        const slashIndex = ele.indexOf('/');
        const STRK = ele.substring(0, slashIndex).trim();
        const L10 = ele.substring(slashIndex + 1, ele.length).trim();
        L10_Array.push(L10);
        temp.splice(j + teamTableFieldCount - 1, 1, STRK);
      }
    }
  }

  L10_Array = repackage_L10(L10_Array);
  let j = 0;
  for (let i = teamTableFieldCount; i <= temp.length; i = i + teamTableFieldCount + 1) {
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
    // const fairIndex = ele.indexOf('D');
    const win = ele.substring(0, winIndex).trim();
    const loss = ele.substring(winIndex + 1, lossIndex).trim();
    const fair = ele.substring(lossIndex + 1, ele.length - 1).trim();
    const L10 = `${win}-${fair}-${loss}`;
    temp.push(L10);
  }
  return temp;
}

function repackageTeamStats(teamsStats) {
  return new Promise(async function(resolve, reject) {
    try {
      const data = [];
      for (let i = 0; i < teamsStats.length; i = i + teamTableFieldCount + 1) {
        const temp = {
          team_id: String(teamName2id(teamsStats[i])),
          G: teamsStats[i + 1] + teamsStats[i + 2],
          Win: teamsStats[i + 1],
          Fair: teamsStats[i + 3],
          Loss: teamsStats[i + 2],
          PCT: `0${teamsStats[i + 4]}`,
          GB: teamsStats[i + 5],
          STRK: teamsStats[i + 6],
          L10: teamsStats[i + 7]
        };
        data.push(temp);
      }
      return resolve(data);
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

function insertToTeamDB(teamData) {
  return new Promise(async function(resolve, reject) {
    const resultArray = [];
    try {
      for (let i = 0; i < teamData.length; i++) {
        const data = {};
        const ele = teamData[i];
        const season = await getSeason(league);
        data[`season_${season}`] = { team_base: ele };
        const result = await db.Team.update(
          {
            baseball_stats: JSON.stringify(data)
          },
          { where: { team_id: ele.team_id } });
        console.log(`Update KBO_${season}, team id is ${ele.team_id}`);

        resultArray.push(result);
      }
      // TODO if result === 0 (update failed, should rerun this program)
      return resolve(resultArray);
    } catch (err) {
      return reject(new AppErrors.MysqlError(`${err.stack} by TsaiChieh`));
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
module.exports = prematch_KBO;
