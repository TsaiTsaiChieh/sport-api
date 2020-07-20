const modules = require('../../util/modules');
const AppErrors = require('../../util/AppErrors');
const leagueName = 'NPB';
const sportName = modules.league2Sport(leagueName).sport;
// const perStep = 1000; // 每秒抓一項資訊
// const timesPerLoop = 9; // 9項數值要抓 隊伍資訊, 隊伍打擊*4, 隊伍投手*4
const season = '2020';
const centralTeam = 6;
const pacificTeam = 6;
async function prematch_NPB(req, res) {
  // const URL;
  // const countForStatus2 = 0;
  // const timerForStatus2 = setInterval(async function () {
  //  countForStatus2 = countForStatus2 + 1;
  //  if (countForStatus2 > timesPerLoop) {
  //    console.log('craw NPB success');
  //    clearInterval(timerForStatus2);
  //  } else {
  //    switch (countForStatus2) {
  //    }
  //  }
  // }, perStep);
  // const URL = 'https://npb.jp/bis/2020/stats/tmb_c.html'; 團隊打擊
  // const URL = 'https://npb.jp/bis/2020/stats/std_c.html'; // 中央聯盟球隊基本資料
  // const URL = `https://npb.jp/bis/2020/stats/std_p.html`; // 台平洋聯盟球隊基本資料
  await getTeamsStandings();
}
async function crawl(URL) {
  const { data } = await modules.axios.get(URL);
  const $ = modules.cheerio.load(data);
  const result = [];
  $('td').each(function(i) {
    result.push($(this).text());
  });
  return result;
}
function getTeamsStandings() {
  return new Promise(async function(resolve, reject) {
    try {
      // 球隊的基本季戰績
      let URL = 'https://npb.jp/bis/2020/stats/std_c.html';
      const teamStatC = await crawl(URL);
      URL = 'https://npb.jp/bis/2020/stats/std_p.html';
      const teamStatP = await crawl(URL);

      await upsertTeambaseTeamC(teamStatC);
      await upsertTeambaseTeamP(teamStatP);
      resolve('ok');
    } catch (err) {
      console.error(err, '=-----');
      return reject(new AppErrors.CrawlersError(`${err.stack} by DY`));
    }
  });
}

async function upsertTeambaseTeamC(result) {
  const team = [];
  team[0] = '45295';
  team[1] = '10216';
  team[2] = '3323';
  team[3] = '3324';
  team[4] = '3318';
  team[5] = '3317';
  const index = 21;
  const offset = 17;
  for (let i = 0; i < centralTeam; i++) {
    const teamID = team[i];

    await modules.firestore
      .collection(`${sportName}_${leagueName}`)
      .doc(teamID)
      .set({
        [`season_${season}`]: {
          // 團隊對戰戰績
          team_base: {
            G: result[index + i * offset],
            Win: result[index + i * offset + 1],
            Draw: result[index + i * offset + 3],
            Lose: result[index + i * offset + 2],
            PCT: result[index + i * offset + 4],
            GB:
              result[index + i * offset + 5] === '--'
                ? '-'
                : result[index + i * offset + 5],
            [`${teamID}VS${team[0]}`]:
              result[index + i * offset + 8] === '***'
                ? ''
                : formatRecord(result[index + i * offset + 8]),
            [`${teamID}VS${team[1]}`]:
              result[index + i * offset + 9] === '***'
                ? ''
                : formatRecord(result[index + i * offset + 9]),
            [`${teamID}VS${team[2]}`]:
              result[index + i * offset + 10] === '***'
                ? ''
                : formatRecord(result[index + i * offset + 10]),
            [`${teamID}VS${team[3]}`]:
              result[index + i * offset + 11] === '***'
                ? ''
                : formatRecord(result[index + i * offset + 11]),
            [`${teamID}VS${team[4]}`]:
              result[index + i * offset + 12] === '***'
                ? ''
                : formatRecord(result[index + i * offset + 12]),
            [`${teamID}VS${team[5]}`]:
              result[index + i * offset + 13] === '***'
                ? ''
                : formatRecord(result[index + i * offset + 13]),
            at_home: formatRecord(result[index + i * offset + 6]),
            at_away: formatRecord(result[index + i * offset + 7])
          }
        }
      });
  }
}
async function upsertTeambaseTeamP(result) {
  const team = [];
  team[0] = '5438';
  team[1] = '2386';
  team[2] = '5438';
  team[3] = '2387';
  team[4] = '10078';
  team[5] = '8025';
  const index = 21;
  const offset = 17;

  for (let i = 0; i < pacificTeam; i++) {
    const teamID = team[i];

    await modules.firestore
      .collection(`${sportName}_${leagueName}`)
      .doc(teamID)
      .set({
        [`season_${season}`]: {
          // 團隊對戰戰績
          team_base: {
            G: result[index + i * offset],
            Win: result[index + i * offset + 1],
            Draw: result[index + i * offset + 3],
            Lose: result[index + i * offset + 2],
            PCT: result[index + i * offset + 4],
            GB:
              result[index + i * offset + 5] === '--'
                ? '-'
                : result[index + i * offset + 5],
            [`${teamID}VS${team[0]}`]:
              result[index + i * offset + 8] === '***'
                ? ''
                : formatRecord(result[index + i * offset + 8]),
            [`${teamID}VS${team[1]}`]:
              result[index + i * offset + 9] === '***'
                ? ''
                : formatRecord(result[index + i * offset + 9]),
            [`${teamID}VS${team[2]}`]:
              result[index + i * offset + 10] === '***'
                ? ''
                : formatRecord(result[index + i * offset + 10]),
            [`${teamID}VS${team[3]}`]:
              result[index + i * offset + 11] === '***'
                ? ''
                : formatRecord(result[index + i * offset + 11]),
            [`${teamID}VS${team[4]}`]:
              result[index + i * offset + 12] === '***'
                ? ''
                : formatRecord(result[index + i * offset + 12]),
            [`${teamID}VS${team[5]}`]:
              result[index + i * offset + 13] === '***'
                ? ''
                : formatRecord(result[index + i * offset + 13]),
            at_home: formatRecord(result[index + i * offset + 6]),
            at_away: formatRecord(result[index + i * offset + 7])
          }
        }
      });
  }
}

function formatRecord(oriString) {
  if (oriString.indexOf('(') >= 0) {
    const draw = oriString.split('(')[1].replace(')', '');
    const win = oriString.split('(')[0].split('-')[0];
    const lose = oriString.split('(')[0].split('-')[1];

    return `${win}-${draw}-${lose}`;
  } else {
    const draw = 0;
    const win = oriString.split('-')[0];
    const lose = oriString.split('-')[1];

    return `${win}-${draw}-${lose}`;
  }
}
module.exports = prematch_NPB;
