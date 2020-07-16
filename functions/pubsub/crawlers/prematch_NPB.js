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
  // const URL = 'https://npb.jp/bis/2020/stats/tmb_c.html'; 團隊打擊
  const URL = 'https://npb.jp/bis/2020/stats/std_c.html'; // 中央聯盟球隊基本資料
  // const URL = `https://npb.jp/bis/2020/stats/std_p.html`; // 台平洋聯盟球隊基本資料
  await getTeamsStandings(URL);
}

function getTeamsStandings(URL) {
  return new Promise(async function(resolve, reject) {
    try {
      // 球隊的季戰績
      let URL = 'https://npb.jp/bis/2020/stats/std_c.html';
      let { data } = await modules.axios.get(URL);
      let $ = modules.cheerio.load(data);
      const teamStatC = [];
      $('td').each(function(i) {
        teamStatC.push($(this).text());
      });

      URL = 'https://npb.jp/bis/2020/stats/std_p.html';
      data = await modules.axios.get(URL);
      $ = modules.cheerio.load(data);
      const teamStatP = [];
      $('td').each(function(i) {
        teamStatP.push($(this).text());
      });
      await upsertFirestoreTeamC(teamStatC);
      await upsertFirestoreTeamP(teamStatP);
      resolve('ok');
    } catch (err) {
      console.error(err, '=-----');
      return reject(new AppErrors.CrawlersError(`${err.stack} by DY`));
    }
  });
}

 function mapTeam(name) {
  switch (name) {
    case '広　島' || '広島東洋カープ': {
      return '3324';
    }
    case 'DeNA' || '横浜DeNAベイスターズ': {
      return '3323';
    }
    case '巨　人' || '読　売ジャイアンツ': {
      return '45295';
    }
    case '中　日' || '中　日ドラゴンズ': {
      return '3318';
    }
    case 'ヤクルト' || '東京ヤクルトスワローズ': {
      return '10216';
    }
    case '阪　神' || '阪　神タイガース': {
      return '3317';
    }
    case '楽　天' || '東北楽天ゴールデンイーグルス': {
      return '5438';
    }
    case 'ソフトバンク' || '福岡ソフトバンクホークス': {
      return '2386';
    }
    case '西　武' || '埼玉西武ライオンズ': {
      return '2387';
    }
    case 'オリックス' || 'オリックスバファローズ': {
      return '8025';
    }
    case 'ロッテ' || '千葉ロッテマリーンズ': {
      return '5438';
    }
    case '日本ハム' || '北海道日本ハムファイターズ': {
      return '10078';
    }
  }
 }
async function upsertFirestoreTeamC(result) {
  // const team1 = '45295';
  // const team2 = '10216';
  // const team3 = '3323';
  // const team4 = '3324';
  // const team5 = '3318';
	// const team6 = '3317';
	mapTeam('aa');
}
async function upsertFirestoreTeamP(result) {
  // const team1 = '5438';
  // const team2 = '2386';
  // const team3 = '5438';
  // const team4 = '2387';
  // const team5 = '10078';
  // const team6 = '8025';
}
module.exports = prematch_NPB;
