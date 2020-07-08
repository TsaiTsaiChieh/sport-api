const modules = require('../../util/modules');
const AppErrors = require('../../util/AppErrors');
const KBO_URL = 'https://mykbostats.com/';
const teamTableTitles = ['Rank/Team', 'W', 'L', 'D', 'PCT', 'GB', 'STRK/LAST 10G'];
const teamTableFieldCount = teamTableTitles.length;

// 1. 取得各隊伍的資訊
async function prematch_KBO(req, res) {
  const d = await getTeamsStandings();
}

function getTeamsStandings() {
  return new Promise(async function(resolve, reject) {
    try {
      const { data } = await modules.axios.get(KBO_URL);
      const $ = modules.cheerio.load(data); // load in the HTML
      const a = await getTeamsStats($);
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
      const a = decompose_STRK_LAST(tdArray);
      return resolve(repackageTeamStats(tdArray));
    } catch (err) {
      return reject(new AppErrors.CrawlersError(`${err.stack} by TsaiChieh`));
    }
  });
}

function decompose_STRK_LAST(tdArray) {
  const temp = [...tdArray]; // deep copy
  // const temp = tdArray;
  const L10_Array = [];
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
  // console.log(L10_Array);
  // console.log('---');
  // console.log(temp);
  let j = 0;

  for (let i = 7; i <= temp.length; i = i + 7 + 1) {
    // for (let j = 0; j < L10_Array.length; j++) {
    //  const element = array[j];
    temp.splice(i, 0, L10_Array[j]);
    j = j + 1;
    // }
  }
  // console.log(temp, '--');
  temp.forEach(function(ele, i) {
    console.log(i, ele);
  });
}
function repackageTeamStats(teamsStats) {
  const data = {
    KBO_2020: []
  };
  for (let i = 0; i < teamsStats.length; i = i + 7) {
    const temp = {
      team_alias: teamsStats[i],
      win_count: teamsStats[i + 1],
      loss_count: teamsStats[i + 2],
      fair_count: teamsStats[i + 3],
      win_rate: teamsStats[i + 4],
      game_behind: teamsStats[i + 5],
      last_10_games: teamsStats[i + 6]
    };
    data.KBO_2020.push(temp);
  }
  return data;
}
module.exports = prematch_KBO;
