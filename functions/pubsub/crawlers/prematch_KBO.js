const modules = require('../../util/modules');
const AppErrors = require('../../util/AppErrors');
const KBO_URL = 'https://mykbostats.com/';
const teamTableTitles = ['Rank/Team', 'W', 'L', 'D', 'PCT', 'GB', 'STRK/LAST 10G'];
const teamTableFieldCount = teamTableTitles.length;

// 1. 取得各隊伍的資訊
async function prematch_KBO(req, res) {
  // const d = await getTeamsStandings();
  res.json(await getTeamsStandings());
}

function getTeamsStandings() {
  return new Promise(async function(resolve, reject) {
    try {
      const { data } = await modules.axios.get(KBO_URL);
      const $ = modules.cheerio.load(data); // load in the HTML

      return resolve(await getTeamsStats($));
    } catch (err) {
      console.error(err, '=-----');
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
    for (let j = 0; j < tdArray.length; j = j + 7) {
      if (i === 6) {
        const ele = tdArray[i + j];
        const slashIndex = ele.indexOf('/');
        const STRK = ele.substring(0, slashIndex).trim();
        const L10 = ele.substring(slashIndex + 1, ele.length).trim();
        L10_Array.push(L10);
        temp.splice(j + 6, 1, STRK);
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
  const data = {
    season_2020: []
  };
  for (let i = 0; i < teamsStats.length; i = i + teamTableFieldCount + 1) {
    const temp = {
      team_alias: teamsStats[i],
      G: teamsStats[i + 1] + teamsStats[i + 2],
      Win: teamsStats[i + 1],
      Draw: teamsStats[i + 3],
      Loss: teamsStats[i + 2],
      PCT: `0${teamsStats[i + 4]}`,
      GB: teamsStats[i + 5],
      STRK: teamsStats[i + 6],
      L10: teamsStats[i + 7]
    };
    data.season_2020.push(temp);
  }
  return data;
}

module.exports = prematch_KBO;
