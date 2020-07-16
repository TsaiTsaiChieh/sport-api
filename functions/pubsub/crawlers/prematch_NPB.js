const modules = require('../../util/modules');
const AppErrors = require('../../util/AppErrors');
// const db = require('../../util/dbUtil');
// const NPB_URL = 'http://www.cpbl.com.tw';
// const totalTeam = 12;
// const leagueName = 'NPB';
// const sportName = modules.league2Sport(leagueName).sport;
const perStep = 1000; // 每秒抓一項資訊
const timesPerLoop = 9; // 9項數值要抓 隊伍資訊, 隊伍打擊*4, 隊伍投手*4
// const season = '2020';

async function prematch_NPB(req, res) {
  // const URL;
  let countForStatus2 = 0;
  const timerForStatus2 = setInterval(async function() {
    countForStatus2 = countForStatus2 + 1;
    if (countForStatus2 > timesPerLoop) {
      console.log('craw NPB success');
      clearInterval(timerForStatus2);
    } else {
      switch (
        countForStatus2
        // case 1: {
        //  // 取得各隊伍的資訊
        //  URL = `${NPB_URL}/standing/season.html`;
        //  await getTeamsStandings(URL);
        //  break;
        // }
        //  // 取得球員資訊
        //  case 2: {
        //    URL = `${CPBL_URL}/web/team_playergrade.php?&team=E02&gameno=01`;
        //    await getHittersStandings(URL); // 中信兄弟 選手打擊
        //    break;
        //  }
        //  case 3: {
        //    URL = `${CPBL_URL}/web/team_playergrade.php?&team=L01&gameno=01`;
        //    await getHittersStandings(URL); // 統一獅 選手打擊
        //    break;
        //  }
        //  case 4: {
        //    URL = `${CPBL_URL}/web/team_playergrade.php?&team=AJL011&gameno=01`;
        //    await getHittersStandings(URL); // 樂天猴 選手打擊
        //    break;
        //  }
        //  case 5: {
        //    URL = `${CPBL_URL}/web/team_playergrade.php?&team=B04&gameno=01`;
        //    await getHittersStandings(URL); // 富邦 選手打擊
        //    break;
        //  }
        //  case 6: {
        //    URL = `${CPBL_URL}/web/team_playergrade.php?&gameno=01&team=E02&year=2020&grade=2&syear=2020`;
        //    await getPitchersStandings(URL); // 中信兄弟 選手投手
        //    break;
        //  }
        //  case 7: {
        //    URL = `${CPBL_URL}/web/team_playergrade.php?&gameno=01&team=L01&year=2020&grade=2&syear=2020`;
        //    await getPitchersStandings(URL); // 統一獅 選手投手
        //    break;
        //  }
        //  case 8: {
        //    URL = `${CPBL_URL}/web/team_playergrade.php?&gameno=01&team=AJL011&year=2020&grade=2&syear=2020`;
        //    await getPitchersStandings(URL); // 樂天猴 選手投手
        //    break;
        //  }
        //  case 9: {
        //    URL = `${CPBL_URL}/web/team_playergrade.php?&gameno=01&team=B04&year=2020&grade=2&syear=2020`;
        //    await getPitchersStandings(URL); // 富邦 選手投手
        //    break;
        //  }
        //  default: {
        //    break;
        //  }
      ) {
      }
    }
  }, perStep);
  const URL = 'https://www.rotowire.com/npb/standings.php';

  await getTeamsStandings(URL);
}

function getTeamsStandings(URL) {
  return new Promise(async function(resolve, reject) {
    try {
      // 球隊的季戰績
      const { data } = await modules.axios.get(URL);
      const $ = modules.cheerio.load(data);
      const titles = $('div div div div div').text();
      console.log(titles);

      //* [@id="datatable1594872315168"]/div[2]/div[2]/div/div[1]/div[1]
      // titles = titles.replace(/\r/g, '');
      // titles = titles.replace(/\n/g, '');
      // titles = titles.replace(/\t/g, ' ');
      // titles = titles.split(' ');
      // const result = [];
      // for (let i = 0; i < titles.length; i++) {
      //  if (titles[i] === '') {
      //    continue;
      //  } else {
      //    result.push(titles[i].trim());
      //  }
      // }

      // await upsertFirestoreTeam(result);

      resolve('ok');
    } catch (err) {
      console.error(err, '=-----');
      return reject(new AppErrors.CrawlersError(`${err.stack} by DY`));
    }
  });
}

// async function upsertFirestoreTeam(result) {
//  for (let i = 0; i < result.length; i++) {
//    console.log(i + '    ' + result[i]);
//  }
// }

module.exports = prematch_NPB;
