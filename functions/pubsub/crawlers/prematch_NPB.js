const axios = require('axios');
const leagueName = 'NPB';
const leagueUtil = require('../../util/leagueUtil');
const sportName = leagueUtil.league2Sport(leagueName).sport;
const firebaseAdmin = require('../../util/firebaseUtil');
const firestore = firebaseAdmin().firestore();
const cheerio = require('cheerio');
const season = '2020';
const centralTeam = 6;
const pacificTeam = 6;
const teamAlias = ['l', 'h', 'e', 'm', 'f', 'b', 'g', 'db', 't', 'c', 'd', 's']; // 西武獅 福岡 樂天 千葉 北海道 歐力士 巨人 橫濱 阪神 東洋 中日 東京
async function prematch_NPB() {
  // 中央球隊的投手季戰績
  let URL = `https://npb.jp/bis/${season}/stats/tmp_c.html`;
  const teamPitcherC = await crawl(URL);
  await upsertPitcherTeamC(teamPitcherC);

  // 太平洋球隊的投手季戰績
  URL = `https://npb.jp/bis/${season}/stats/tmp_p.html`;
  const teamPitcherP = await crawl(URL);
  await upsertPitcherTeamP(teamPitcherP);

  // 中央球隊的基本季戰績
  URL = `https://npb.jp/bis/${season}/stats/std_c.html`;
  const teamStatC = await crawl(URL);
  await upsertTeambaseTeamC(teamStatC);

  // 太平洋球隊基本季戰績
  URL = `https://npb.jp/bis/${season}/stats/std_p.html`;
  const teamStatP = await crawl(URL);
  await upsertTeambaseTeamP(teamStatP);

  // 中央球隊的打擊季戰績
  URL = `https://npb.jp/bis/${season}/stats/tmb_c.html`;
  const teamHitterC = await crawl(URL);
  await upsertHitterTeamC(teamHitterC);

  // 太平洋球隊的打擊季戰績
  URL = `https://npb.jp/bis/${season}/stats/tmb_p.html`;
  const teamHitterP = await crawl(URL);
  await upsertHitterTeamP(teamHitterP);

  // 選手季戰績
  for (let teamCount = 0; teamCount < teamAlias.length; teamCount++) {
    URL = `https://npb.jp/bis/2020/stats/idb1_${teamAlias[teamCount]}.html`;
    const Hitter = await crawl(URL);
    URL = `https://npb.jp/bis/teams/rst_${teamAlias[teamCount]}.html`;
    const [HitterID, HitterUID] = await crawlId(URL);
    await upsertHitter(Hitter, HitterID, HitterUID);
    URL = `https://npb.jp/bis/2020/stats/idp1_${teamAlias[teamCount]}.html`;
    const Pitcher = await crawl(URL);
    URL = `https://npb.jp/bis/teams/rst_${teamAlias[teamCount]}.html`;
    const [PitcherID, PitcherUID] = await crawlId(URL);
    await upsertPitcher(Pitcher, PitcherID, PitcherUID);
  }
}

async function crawlId(URL) {
  // 背號
  const { data } = await axios.get(URL);
  const $ = cheerio.load(data);
  const result = [];
  $('td').each(function(i) {
    result.push($(this).text());
  });
  const id = $('tr td a');
  const result2 = [];
  id.each(function(index, ele) {
    if (ele.attribs.href.indexOf('/') >= 0) {
      result2.push(ele.attribs.href.split('/')[3].split('.')[0]);
    }
  });
  return [result, result2];
}

async function crawl(URL) {
  const { data } = await axios.get(URL);
  const $ = cheerio.load(data);
  const result = [];
  $('td').each(function(i) {
    result.push($(this).text());
  });
  return result;
}

async function upsertPitcher(result, result2, result3) {
  const playerNumber = [];
  const playerName = [];
  let j = 0;
  const teamID = mapTeam(result2[1]);
  for (let i = 8; i < result2.length; i = i + 8) {
    playerNumber[j] = result2[i];
    playerName[j] = result2[i + 1];
    j = j + 1;
  }
  let k = 0;
  for (let i = 3; i < result.length - 26; i = i + 26) {
    const docName = result[i];
    let matchNumber;
    for (let j = 0; j < playerName.length; j++) {
      if (docName === playerName[j]) {
        matchNumber = result3[k];
        k = k + 1;
        break;
      }
    }
    firestore
      .collection(`${sportName}_${leagueName}`)
      .doc(teamID)
      .set(
        {
          [`season_${season}`]: {
            pitchers: {
              [`${matchNumber}`]: {
                // AO:,
                BB: result[i + 15],
                BF: result[i + 11],
                BK: result[i + 20],
                // BS:,
                CG: result[i + 7],
                ER: result[i + 22],
                ERA: result[i + 23],
                G: result[i + 1],
                // GF:,
                // GO:,
                // GR:,
                // GS:,
                H: result[i + 13],
                HBP: result[i + 6],
                HLD: result[i + 5],
                HR: result[i + 14],
                IBB: result[i + 16],
                IP: result[i + 12],
                L: result[i + 3],
                NBB: result[i + 9],
                // NP:,
                R: result[i + 21],
                SHO: result[i + 8],
                SO: result[i + 18],
                SV: result[i + 4],
                W: result[i + 2],
                WHIP: isNaN((result[i + 13] + result[i + 15]) / result[i + 12])
                  ? '0'
                  : (result[i + 13] + result[i + 15]) / result[i + 12],
                WP: result[i + 19],
                name: result[i],
                name_ch: result[i],
                ori_name: result[i],
                player_id: matchNumber
              }
            }
          }
        },
        { merge: true }
      );
  }
}

async function upsertHitter(result, result2, result3) {
  const playerNumber = [];
  const playerName = [];
  let j = 0;
  const teamID = mapTeam(result2[1]);
  for (let i = 8; i < result2.length; i = i + 8) {
    playerNumber[j] = result2[i];
    playerName[j] = result2[i + 1];
    j = j + 1;
  }
  let k = 0;
  for (let i = 2; i < result.length - 24; i = i + 24) {
    const docName = result[i];
    let matchNumber;
    for (let j = 0; j < playerName.length; j++) {
      if (docName === playerName[j]) {
        matchNumber = result3[k];
        k = k + 1;
        break;
      }
    }
    firestore
      .collection(`${sportName}_${leagueName}`)
      .doc(teamID)
      .set(
        {
          [`season_${season}`]: {
            hitters: {
              [`${matchNumber}`]: {
                AB: result[i + 3],
                // AO:result[i + 14],
                AVG: '0' + result[i + 20],
                BB: result[i + 15],
                CS: result[i + 12],
                G: result[i + 1],
                GIDP: result[i + 19], // 雙殺打
                // GO:result[i + 13],
                H: result[i + 5],
                HBP: result[i + 17],
                HR: result[i + 8],
                IBB: result[i + 16],
                OBP: '0' + result[i + 22],
                PA: result[i + 2],
                R: result[i + 4],
                RBI: result[i + 10],
                SAC: result[i + 13],
                SB: result[i + 11],
                SBprecent: isNaN(
                  result[i + 11] / (result[i + 11] + result[i + 12])
                )
                  ? '0'
                  : result[i + 11] / (result[i + 11] + result[i + 12]),
                SF: result[i + 14],
                SLG: '0' + result[i + 21],
                SO: result[i + 18],
                SSA: isNaN(
                  result[i + 20] * 1000 +
                    result[i + 8] * 20 +
                    result[i + 10] * 5 +
                    result[i + 9]
                )
                  ? '0'
                  : result[i + 20] * 1000 +
                    result[i + 8] * 20 +
                    result[i + 10] * 5 +
                    result[i + 9],
                TA: isNaN(
                  (result[i + 9] + result[i + 11] + result[i + 15]) /
                    (result[i + 3] -
                      result[i + 5] +
                      result[i + 12] +
                      result[i + 19])
                )
                  ? '0'
                  : (result[i + 9] + result[i + 11] + result[i + 15]) /
                    (result[i + 3] -
                      result[i + 5] +
                      result[i + 12] +
                      result[i + 19]),
                TB: result[i + 9],
                one_B:
                  result[i + 5] - result[i + 6] - result[i + 7] - result[i + 8],
                two_B: result[i + 6],
                three_B: result[i + 7],
                name: result[i],
                name_ch: result[i],
                ori_name: result[i],
                player_id: matchNumber
              }
            }
          }
        },
        { merge: true }
      );
  }
}

async function upsertPitcherTeamC(result) {
  const team = [];
  team[0] = mapTeam(result[0]);
  team[1] = mapTeam(result[25]);
  team[2] = mapTeam(result[50]);
  team[3] = mapTeam(result[75]);
  team[4] = mapTeam(result[100]);
  team[5] = mapTeam(result[125]);
  const offset = 25;
  const index = 1;
  for (let i = 0; i < centralTeam; i++) {
    const teamID = team[i];
    firestore
      .collection(`${sportName}_${leagueName}`)
      .doc(teamID)
      .set(
        {
          [`season_${season}`]: {
            team_pitcher: {
              BB:
                result[index + i * offset + 16] +
                result[index + i * offset + 17],
              BF: result[index + i * offset + 11],
              BK: result[index + i * offset + 21],
              ER: result[index + i * offset + 23],
              ERA: result[index + i * offset],
              H: result[index + i * offset + 14],
              HR: result[index + i * offset + 15],
              // NP:
              R: result[index + i * offset + 22],
              SO: result[index + i * offset + 19],
              WHIP:
                (result[index + i * offset + 14] +
                  result[index + i * offset + 16] +
                  result[index + i * offset + 17]) /
                result[index + i * offset + 12],
              WP: result[index + i * offset + 20]
            }
          }
        },
        { merge: true }
      );
  }
}

async function upsertPitcherTeamP(result) {
  const team = [];
  team[0] = mapTeam(result[0]);
  team[1] = mapTeam(result[25]);
  team[2] = mapTeam(result[50]);
  team[3] = mapTeam(result[75]);
  team[4] = mapTeam(result[100]);
  team[5] = mapTeam(result[125]);
  const offset = 25;
  const index = 1;
  for (let i = 0; i < pacificTeam; i++) {
    const teamID = team[i];
    firestore
      .collection(`${sportName}_${leagueName}`)
      .doc(teamID)
      .set(
        {
          [`season_${season}`]: {
            team_pitcher: {
              BB:
                result[index + i * offset + 16] +
                result[index + i * offset + 17],
              BF: result[index + i * offset + 11],
              BK: result[index + i * offset + 21],
              ER: result[index + i * offset + 23],
              ERA: result[index + i * offset],
              H: result[index + i * offset + 14],
              HR: result[index + i * offset + 15],
              // NP:
              R: result[index + i * offset + 22],
              SO: result[index + i * offset + 19],
              WHIP:
                (result[index + i * offset + 14] +
                  result[index + i * offset + 16] +
                  result[index + i * offset + 17]) /
                result[index + i * offset + 12],
              WP: result[index + i * offset + 20]
            }
          }
        },
        { merge: true }
      );
  }
}
async function upsertHitterTeamC(result) {
  const team = [];
  team[0] = mapTeam(result[0]);
  team[1] = mapTeam(result[23]);
  team[2] = mapTeam(result[46]);
  team[3] = mapTeam(result[69]);
  team[4] = mapTeam(result[92]);
  team[5] = mapTeam(result[115]);
  for (let i = 0; i < centralTeam; i++) {
    const teamID = team[i];
    const offset = 23;
    const index = 1;
    firestore
      .collection(`${sportName}_${leagueName}`)
      .doc(teamID)
      .set(
        {
          [`season_${season}`]: {
            team_hit: {
              AB: result[index + i * offset + 3],
              AVG: '0' + result[index + i * offset], // 1
              BB:
                result[index + i * offset + 15] +
                result[index + i * offset + 16],
              H: result[index + i * offset + 5],
              HR: result[index + i * offset + 8],
              OBP: '0' + result[index + i * offset + 21],
              R: result[index + i * offset + 4],
              RBI: result[index + i * offset + 10],
              SB: result[index + i * offset + 11],
              SLG: '0' + result[index + i * offset + 20],
              SO: result[index + i * offset + 18],
              TB: result[index + i * offset + 9]
            }
          }
        },
        { merge: true }
      );
  }
}
async function upsertHitterTeamP(result) {
  const team = [];
  team[0] = mapTeam(result[0]);
  team[1] = mapTeam(result[23]);
  team[2] = mapTeam(result[46]);
  team[3] = mapTeam(result[69]);
  team[4] = mapTeam(result[92]);
  team[5] = mapTeam(result[115]);
  const offset = 23;
  const index = 1;
  for (let i = 0; i < pacificTeam; i++) {
    const teamID = team[i];
    firestore
      .collection(`${sportName}_${leagueName}`)
      .doc(teamID)
      .set(
        {
          [`season_${season}`]: {
            team_hit: {
              AB: result[index + i * offset + 3],
              AVG: '0' + result[index + i * offset], // 1
              BB:
                result[index + i * offset + 15] +
                result[index + i * offset + 16],
              H: result[index + i * offset + 5],
              HR: result[index + i * offset + 8],
              OBP: '0' + result[index + i * offset + 21],
              R: result[index + i * offset + 4],
              RBI: result[index + i * offset + 10],
              SB: result[index + i * offset + 11],
              SLG: '0' + result[index + i * offset + 20],
              SO: result[index + i * offset + 18],
              TB: result[index + i * offset + 9]
            }
          }
        },
        { merge: true }
      );
  }
}
async function upsertTeambaseTeamC(result) {
  const team = [];
  team[0] = mapTeam(result[20]);
  team[1] = mapTeam(result[37]);
  team[2] = mapTeam(result[54]);
  team[3] = mapTeam(result[71]);
  team[4] = mapTeam(result[88]);
  team[5] = mapTeam(result[105]);

  const index = 21;
  const offset = 17;
  for (let i = 0; i < centralTeam; i++) {
    const teamID = team[i];
    firestore
      .collection(`${sportName}_${leagueName}`)
      .doc(teamID)
      .set(
        {
          [`season_${season}`]: {
            // 團隊對戰戰績
            team_base: {
              G: result[index + i * offset],
              Win: result[index + i * offset + 1],
              Draw: result[index + i * offset + 3],
              Loss: result[index + i * offset + 2],
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
        },
        { merge: true }
      );
  }
}
async function upsertTeambaseTeamP(result) {
  const team = [];
  team[0] = mapTeam(result[20]);
  team[1] = mapTeam(result[37]);
  team[2] = mapTeam(result[54]);
  team[3] = mapTeam(result[71]);
  team[4] = mapTeam(result[88]);
  team[5] = mapTeam(result[105]);
  const index = 21;
  const offset = 17;

  for (let i = 0; i < pacificTeam; i++) {
    const teamID = team[i];

    firestore
      .collection(`${sportName}_${leagueName}`)
      .doc(teamID)
      .set(
        {
          [`season_${season}`]: {
            // 團隊對戰戰績
            team_base: {
              G: result[index + i * offset],
              Win: result[index + i * offset + 1],
              Draw: result[index + i * offset + 3],
              Loss: result[index + i * offset + 2],
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
        },
        { merge: true }
      );
  }
}

function formatRecord(oriString) {
  if (oriString.indexOf('(') >= 0) {
    const draw = oriString.split('(')[1].replace(')', '');
    const win = oriString.split('(')[0].split('-')[0];
    const loss = oriString.split('(')[0].split('-')[1];

    return `${win}-${loss}-${draw}`;
  } else {
    const draw = 0;
    const win = oriString.split('-')[0];
    const loss = oriString.split('-')[1];

    return `${win}-${loss}-${draw}`;
  }
}

function mapTeam(name) {
  switch (name) {
    case '広　島': {
      return '3324';
    }
    case '広島東洋カープ': {
      return '3324';
    }
    case 'DeNA': {
      return '3323';
    }
    case '横浜DeNAベイスターズ': {
      return '3323';
    }
    case '巨　人': {
      return '45295';
    }
    case '読　売ジャイアンツ': {
      return '45295';
    }
    case '読売ジャイアンツ': {
      return '45295';
    }
    case '中　日': {
      return '3318';
    }
    case '中　日ドラゴンズ': {
      return '3318';
    }
    case '中日ドラゴンズ': {
      return '3318';
    }
    case 'ヤクルト': {
      return '10216';
    }
    case '東京ヤクルトスワローズ': {
      return '10216';
    }
    case '阪　神': {
      return '3317';
    }
    case '阪　神タイガース': {
      return '3317';
    }
    case '阪神タイガース': {
      return '3317';
    }
    case '楽　天': {
      return '5438';
    }
    case '東北楽天ゴールデンイーグルス': {
      return '5438';
    }
    case 'ソフトバンク': {
      return '2386';
    }
    case '福岡ソフトバンクホークス': {
      return '2386';
    }
    case '西　武': {
      return '2387';
    }
    case '埼玉西武ライオンズ': {
      return '2387';
    }
    case 'オリックス': {
      return '8025';
    }
    case 'オリックスバファローズ': {
      return '8025';
    }
    case 'オリックス・バファローズ': {
      return '8025';
    }
    case 'ロッテ': {
      return '5438';
    }
    case '千葉ロッテマリーンズ': {
      return '5438';
    }
    case '日本ハム': {
      return '10078';
    }
    case '北海道日本ハムファイターズ': {
      return '10078';
    }
  }
}

module.exports = prematch_NPB;
