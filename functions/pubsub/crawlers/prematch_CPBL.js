const firebaseAdmin = require('../../util/firebaseUtil');
const firestore = firebaseAdmin().firestore();
const axios = require('axios');
const AppErrors = require('../../util/AppErrors');
const cheerio = require('cheerio');
// const db = require('../../util/dbUtil');
const CPBL_URL = 'http://www.cpbl.com.tw';
const totalTeam = 4;
const leagueName = 'CPBL';
const leagueUtil = require('../../util/leagueUtil');
// const league = leagueUtil.leagueCodebook(leagueName);
const sportName = leagueUtil.league2Sport(leagueName).sport;
// const sport = '16';
const perStep = 1000; // 每秒抓一項資訊
const timesPerLoop = 9; // 9項數值要抓 隊伍資訊, 隊伍打擊*4, 隊伍投手*4
const season = '2020';
async function prematch_CPBL(req, res) {
  let URL;
  let countForStatus2 = 0;
  const timerForStatus2 = setInterval(async function() {
    countForStatus2 = countForStatus2 + 1;
    if (countForStatus2 > timesPerLoop) {
      console.log('craw CPBL success');
      clearInterval(timerForStatus2);
    } else {
      switch (countForStatus2) {
        case 1: {
          // 取得各隊伍的資訊
          URL = `${CPBL_URL}/standing/season.html`;
          await getTeamsStandings(URL);
          break;
        }
        case 2: {
          URL = `${CPBL_URL}/web/team_playergrade.php?&team=E02&gameno=01`;
          await getHittersStandings(URL); // 中信兄弟 選手打擊
          break;
        }
        case 3: {
          URL = `${CPBL_URL}/web/team_playergrade.php?&team=L01&gameno=01`;
          await getHittersStandings(URL); // 統一獅 選手打擊
          break;
        }
        case 4: {
          URL = `${CPBL_URL}/web/team_playergrade.php?&team=AJL011&gameno=01`;
          await getHittersStandings(URL); // 樂天猴 選手打擊
          break;
        }
        case 5: {
          URL = `${CPBL_URL}/web/team_playergrade.php?&team=B04&gameno=01`;
          await getHittersStandings(URL); // 富邦 選手打擊
          break;
        }
        case 6: {
          URL = `${CPBL_URL}/web/team_playergrade.php?&gameno=01&team=E02&year=2020&grade=2&syear=2020`;
          await getPitchersStandings(URL); // 中信兄弟 選手投手
          break;
        }
        case 7: {
          URL = `${CPBL_URL}/web/team_playergrade.php?&gameno=01&team=L01&year=2020&grade=2&syear=2020`;
          await getPitchersStandings(URL); // 統一獅 選手投手
          break;
        }
        case 8: {
          URL = `${CPBL_URL}/web/team_playergrade.php?&gameno=01&team=AJL011&year=2020&grade=2&syear=2020`;
          await getPitchersStandings(URL); // 樂天猴 選手投手
          break;
        }
        case 9: {
          URL = `${CPBL_URL}/web/team_playergrade.php?&gameno=01&team=B04&year=2020&grade=2&syear=2020`;
          await getPitchersStandings(URL); // 富邦 選手投手
          break;
        }
        default: {
          break;
        }
      }
    }
  }, perStep);
}

function getPitchersStandings(URL) {
  return new Promise(async function(resolve, reject) {
    try {
      const { data } = await axios.get(URL);
      const $ = cheerio.load(data);
      let number = $('td').text();
      number = number.replace(/\r/g, '');
      number = number.replace(/\n/g, '');
      number = number.replace(/\t/g, ' ');
      number = number.split(' ');
      let result = [];
      for (let i = 0; i < number.length; i++) {
        if (number[i] === '') {
          continue;
        } else {
          result.push(number[i].trim());
        }
      }
      const totalPlayer = result.length - 1;
      let title = $('tr').text();
      title = title.replace(/\r/g, '');
      title = title.replace(/\n/g, '');
      title = title.replace(/\t/g, ' ');
      title = title.split(' ');
      result = [];
      for (let i = 0; i < title.length; i++) {
        if (title[i] === '') {
          continue;
        } else {
          result.push(title[i].trim());
        }
      }
      const id = $('tr td a');
      const playerID = [];
      id.each(function(index, ele) {
        if (index % 2 === 0) {
          playerID.push(
            ele.attribs.href.split('?')[1].split('=')[1].split('&')[0]
          );
        }
      });
      await upsertFirestorePitcher(result, totalPlayer, playerID);
    } catch (err) {
      console.error(err, '=-----');
      return reject(new AppErrors.CrawlersError(`${err.stack} by DY`));
    }
    resolve('ok');
  });
}

function getHittersStandings(URL) {
  return new Promise(async function(resolve, reject) {
    try {
      const { data } = await axios.get(URL);
      const $ = cheerio.load(data);
      let number = $('td').text();
      number = number.replace(/\r/g, '');
      number = number.replace(/\n/g, '');
      number = number.replace(/\t/g, ' ');
      number = number.split(' ');
      let result = [];
      for (let i = 0; i < number.length; i++) {
        if (number[i] === '') {
          continue;
        } else {
          result.push(number[i].trim());
        }
      }
      const totalPlayer = result.length - 1;
      let title = $('tr').text();
      title = title.replace(/\r/g, '');
      title = title.replace(/\n/g, '');
      title = title.replace(/\t/g, ' ');
      title = title.split(' ');
      result = [];
      for (let i = 0; i < title.length; i++) {
        if (title[i] === '') {
          continue;
        } else {
          result.push(title[i].trim());
        }
      }
      const id = $('tr td a');
      const playerID = [];
      id.each(function(index, ele) {
        if (index % 2 === 0) {
          playerID.push(
            ele.attribs.href.split('?')[1].split('=')[1].split('&')[0]
          );
        }
      });

      await upsertFirestoreHitter(result, totalPlayer, playerID);
    } catch (err) {
      console.error(err, '=-----');
      return reject(new AppErrors.CrawlersError(`${err.stack} by DY`));
    }
    resolve('ok');
  });
}

function getTeamsStandings(URL) {
  return new Promise(async function(resolve, reject) {
    try {
      // 球隊的季戰績
      const { data } = await axios.get(URL);
      const $ = cheerio.load(data);
      let titles = $('.gap_b20').text();

      titles = titles.replace(/\r/g, '');
      titles = titles.replace(/\n/g, '');
      titles = titles.replace(/\t/g, ' ');

      titles = titles.split(' ');
      const result = [];
      for (let i = 0; i < titles.length; i++) {
        if (titles[i] === '') {
          continue;
        } else if (titles[i] === '-') {
          result.push(titles[i].trim());
          result.push(' ');
        } else {
          result.push(titles[i].trim());
        }
      }
      for (let i = 0; i < result.length; i++) {
        console.log(i + '    ' + result[i]);
      }
      for (let i = 1; i <= totalTeam; i++) {
        // await upsertMysqlTeam(i, result);
        await upsertFirestoreTeam(i, result);
      }

      resolve('ok');
    } catch (err) {
      console.error(err, '=-----');
      return reject(new AppErrors.CrawlersError(`${err.stack} by DY`));
    }
  });
}

function mapTeam(name) {
  switch (name) {
    case '中信兄弟': {
      return '230422';
    }
    case '樂天': {
      return '329121';
    }
    case '統一7-ELEVEn': {
      return '224095';
    }
    case '富邦': {
      return '224094';
    }
  }
}

function change2English(STRK) {
  if (STRK[0] === '勝') {
    return STRK.split('勝')[1] + 'W';
  } else if (STRK[0] === '敗') {
    return STRK.split('敗')[1] + 'L';
  } else {
    return STRK;
  }
}
async function upsertFirestoreTeam(teamNumber, result) {
  const teamID = mapTeam(result[7 + teamNumber]);
  const team1 = mapTeam(result[8]);
  const team2 = mapTeam(result[9]);
  const team3 = mapTeam(result[10]);
  const team4 = mapTeam(result[11]);
  const index = 16 + 15 * (teamNumber - 1);
  const offsetPitch = 76 - teamNumber;
  const offsetBit = 147 - teamNumber;
  await firestore
    .collection(`${sportName}_${leagueName}`)
    .doc(teamID)
    .set(
      {
        [`season_${season}`]: {
          // 團隊對戰戰績
          team_base: {
            G: result[index + 2],
            Win: result[index + 3].split('-')[0],
            Draw: result[index + 3].split('-')[1],
            Lose: result[index + 3].split('-')[2],
            PCT: result[index + 4],
            GB: result[index + 5],
            [`${teamID}VS${team1}`]:
              teamID !== team1
                ? `${result[index + 7].split('-')[0]}-${
                    result[index + 7].split('-')[2]
                  }-${result[index + 7].split('-')[1]}`
                : null,
            [`${teamID}VS${team2}`]:
              teamID !== team2
                ? `${result[index + 8].split('-')[0]}-${
                    result[index + 8].split('-')[2]
                  }-${result[index + 8].split('-')[1]}`
                : null,
            [`${teamID}VS${team3}`]:
              teamID !== team3
                ? `${result[index + 9].split('-')[0]}-${
                    result[index + 9].split('-')[2]
                  }-${result[index + 9].split('-')[1]}`
                : null,
            [`${teamID}VS${team4}`]:
              teamID !== team4
                ? `${result[index + 10].split('-')[0]}-${
                    result[index + 10].split('-')[2]
                  }-${result[index + 10].split('-')[1]}`
                : null,
            at_home: `${result[index + 11].split('-')[0]}-${
              result[index + 11].split('-')[2]
            }-${result[index + 11].split('-')[1]}`,
            at_away: `${result[index + 12].split('-')[0]}-${
              result[index + 12].split('-')[2]
            }-${result[index + 12].split('-')[1]}`,
            STRK: change2English(result[index + 13]),
            L10: `${result[index + 14].split('-')[0]}-${
              result[index + 14].split('-')[2]
            }-${result[index + 14].split('-')[1]}`,
            R: result[index + offsetBit + 3],
            allow_R: result[index + offsetPitch + 10],
            per_R: (
              parseFloat(result[index + offsetBit + 3]) /
              parseFloat(result[index + 2])
            ).toFixed(3),
            per_allow_R: (
              parseFloat(result[index + offsetPitch + 10]) /
              parseFloat(result[index + 2])
            ).toFixed(3)
          },
          // 團隊投球成績
          team_pitch: {
            G: result[index + offsetPitch + 1],
            BF: result[index + offsetPitch + 2],
            NP: result[index + offsetPitch + 3],
            H: result[index + offsetPitch + 4],
            HR: result[index + offsetPitch + 5],
            BB: result[index + offsetPitch + 6],
            SO: result[index + offsetPitch + 7],
            WP: result[index + offsetPitch + 8],
            BK: result[index + offsetPitch + 9],
            R: result[index + offsetPitch + 10],
            ER: result[index + offsetPitch + 11],
            WHIP: result[index + offsetPitch + 12],
            ERA: result[index + offsetPitch + 13]
          },
          // 團隊打擊成績
          team_hit: {
            G: result[index + offsetBit + 1],
            AB: result[index + offsetBit + 2],
            R: result[index + offsetBit + 3],
            RBI: result[index + offsetBit + 4],
            H: result[index + offsetBit + 5],
            HR: result[index + offsetBit + 6],
            TB: result[index + offsetBit + 7],
            SO: result[index + offsetBit + 8],
            BB: result[index + offsetBit + 9],
            SB: result[index + offsetBit + 10],
            OBP: result[index + offsetBit + 11],
            SLG: result[index + offsetBit + 12],
            AVG: result[index + offsetBit + 13]
          }
        }
      },
      { merge: true }
    );
  // if (teamNumber === 1) {
  //  const index = 17;
  //  const offsetPitch = 74;
  //  const offsetBit = 145;
  //  await firestore
  //    .collection(`${sportName}_${leagueName}`)
  //    .doc(teamID)
  //    .set(
  //      {
  //        [`season_${season}`]: {
  //          // 團隊對戰戰績
  //          team_base: {
  //            G: result[index + 1],
  //            Win: result[index + 2].split('-')[0],
  //            Draw: result[index + 2].split('-')[1],
  //            Lose: result[index + 2].split('-')[2],
  //            PCT: result[index + 3],
  //            GB: result[index + 4],
  //            [`${teamID}VS${team1}`]:
  //              teamID !== team1
  //                ? `${result[index + 5].split('-')[0]}-${
  //                    result[index + 5].split('-')[2]
  //                  }-${result[index + 5].split('-')[1]}`
  //                : null,
  //            [`${teamID}VS${team2}`]:
  //              teamID !== team2
  //                ? `${result[index + 6].split('-')[0]}-${
  //                    result[index + 6].split('-')[2]
  //                  }-${result[index + 6].split('-')[1]}`
  //                : null,
  //            [`${teamID}VS${team3}`]:
  //              teamID !== team3
  //                ? `${result[index + 7].split('-')[0]}-${
  //                    result[index + 7].split('-')[2]
  //                  }-${result[index + 7].split('-')[1]}`
  //                : null,
  //            [`${teamID}VS${team4}`]:
  //              teamID !== team4
  //                ? `${result[index + 8].split('-')[0]}-${
  //                    result[index + 8].split('-')[2]
  //                  }-${result[index + 8].split('-')[1]}`
  //                : null,
  //            at_home: `${result[index + 9].split('-')[0]}-${
  //              result[index + 9].split('-')[2]
  //            }-${result[index + 9].split('-')[1]}`,
  //            at_away: `${result[index + 10].split('-')[0]}-${
  //              result[index + 10].split('-')[2]
  //            }-${result[index + 10].split('-')[1]}`,
  //            STRK: change2English(result[index + 11]),
  //            L10: `${result[index + 12].split('-')[0]}-${
  //              result[index + 12].split('-')[2]
  //            }-${result[index + 12].split('-')[1]}`,
  //            R: result[index + offsetBit + 2],
  //            allow_R: result[index + offsetPitch + 9],
  //            per_R: (
  //              parseFloat(result[index + offsetBit + 2]) /
  //              parseFloat(result[index + 1])
  //            ).toFixed(3),
  //            per_allow_R: (
  //              parseFloat(result[index + offsetPitch + 9]) /
  //              parseFloat(result[index + 1])
  //            ).toFixed(3)
  //          },
  //          // 團隊投球成績
  //          team_pitch: {
  //            G: result[index + offsetPitch],
  //            BF: result[index + offsetPitch + 1],
  //            NP: result[index + offsetPitch + 2],
  //            H: result[index + offsetPitch + 3],
  //            HR: result[index + offsetPitch + 4],
  //            BB: result[index + offsetPitch + 5],
  //            SO: result[index + offsetPitch + 6],
  //            WP: result[index + offsetPitch + 7],
  //            BK: result[index + offsetPitch + 8],
  //            R: result[index + offsetPitch + 9],
  //            ER: result[index + offsetPitch + 10],
  //            WHIP: result[index + offsetPitch + 11],
  //            ERA: result[index + offsetPitch + 12]
  //          },
  //          // 團隊打擊成績
  //          team_hit: {
  //            G: result[index + offsetBit],
  //            AB: result[index + offsetBit + 1],
  //            R: result[index + offsetBit + 2],
  //            RBI: result[index + offsetBit + 3],
  //            H: result[index + offsetBit + 4],
  //            HR: result[index + offsetBit + 5],
  //            TB: result[index + offsetBit + 6],
  //            SO: result[index + offsetBit + 7],
  //            BB: result[index + offsetBit + 8],
  //            SB: result[index + offsetBit + 9],
  //            OBP: result[index + offsetBit + 10],
  //            SLG: result[index + offsetBit + 11],
  //            AVG: result[index + offsetBit + 12]
  //          }
  //        }
  //      },
  //      {merge: true}
  //    );
  // } else {
  //  const index = teamNumber * 15 + 1;
  //  const offsetPitch = 76 - teamNumber;
  //  const offsetBit = 147 - teamNumber;
  //  await firestore
  //    .collection(`${sportName}_${leagueName}`)
  //    .doc(teamID)
  //    .set(
  //      {
  //        [`season_${season}`]: {
  //          team_base: {
  //            G: result[index + 1],
  //            Win: result[index + 2].split('-')[0],
  //            Draw: result[index + 2].split('-')[1],
  //            Lose: result[index + 2].split('-')[2],
  //            PCT: result[index + 3],
  //            GB: result[index + 4],
  //            [`${teamID}VS${team1}`]:
  //              teamID !== team1
  //                ? `${result[index + 6].split('-')[0]}-${
  //                    result[index + 6].split('-')[2]
  //                  }-${result[index + 6].split('-')[1]}`
  //                : null,
  //            [`${teamID}VS${team2}`]:
  //              teamID !== team2
  //                ? `${result[index + 7].split('-')[0]}-${
  //                    result[index + 7].split('-')[2]
  //                  }-${result[index + 7].split('-')[1]}`
  //                : null,
  //            [`${teamID}VS${team3}`]:
  //              teamID !== team3
  //                ? `${result[index + 8].split('-')[0]}-${
  //                    result[index + 8].split('-')[2]
  //                  }-${result[index + 8].split('-')[1]}`
  //                : null,
  //            [`${teamID}VS${team4}`]:
  //              teamID !== team4
  //                ? `${result[index + 9].split('-')[0]}-${
  //                    result[index + 9].split('-')[2]
  //                  }-${result[index + 9].split('-')[1]}`
  //                : null,
  //            at_home: `${result[index + 10].split('-')[0]}-${
  //              result[index + 10].split('-')[2]
  //            }-${result[index + 10].split('-')[1]}`,
  //            at_away: `${result[index + 11].split('-')[0]}-${
  //              result[index + 11].split('-')[2]
  //            }-${result[index + 11].split('-')[1]}`,
  //            STRK: change2English(result[index + 12]),
  //            L10: `${result[index + 13].split('-')[0]}-${
  //              result[index + 13].split('-')[2]
  //            }-${result[index + 13].split('-')[1]}`,
  //            R: result[index + offsetBit + 2],
  //            allow_R: result[index + offsetPitch + 9],
  //            per_R: (
  //              parseFloat(result[index + offsetBit + 2]) /
  //              parseFloat(result[index + 1])
  //            ).toFixed(3),
  //            per_allow_R: (
  //              parseFloat(result[index + offsetPitch + 9]) /
  //              parseFloat(result[index + 1])
  //            ).toFixed(3)
  //          },
  //          // 團隊投球成績
  //          team_pitch: {
  //            BF: result[index + offsetPitch + 1],
  //            NP: result[index + offsetPitch + 2],
  //            H: result[index + offsetPitch + 3],
  //            HR: result[index + offsetPitch + 4],
  //            BB: result[index + offsetPitch + 5],
  //            SO: result[index + offsetPitch + 6],
  //            WP: result[index + offsetPitch + 7],
  //            BK: result[index + offsetPitch + 8],
  //            R: result[index + offsetPitch + 9],
  //            ER: result[index + offsetPitch + 10],
  //            WHIP: result[index + offsetPitch + 11],
  //            ERA: result[index + offsetPitch + 12]
  //          },
  //          // 團隊打擊成績
  //          team_hit: {
  //            AB: result[index + offsetBit + 1],
  //            R: result[index + offsetBit + 2],
  //            RBI: result[index + offsetBit + 3],
  //            H: result[index + offsetBit + 4],
  //            HR: result[index + offsetBit + 5],
  //            TB: result[index + offsetBit + 6],
  //            SO: result[index + offsetBit + 7],
  //            BB: result[index + offsetBit + 8],
  //            SB: result[index + offsetBit + 9],
  //            OBP: result[index + offsetBit + 10],
  //            SLG: result[index + offsetBit + 11],
  //            AVG: result[index + offsetBit + 12]
  //          }
  //        }
  //      },
  //      {merge: true}
  //    );
  // }
}
function upsertFirestoreHitter(result, totalPlayer, playerID) {
  const teamID = mapTeam(result[33]);
  const start = 31;
  const offset = 32; // 一循環
  for (let i = 0; i < totalPlayer; i++) {
    firestore
      .collection(`${sportName}_${leagueName}`)
      .doc(teamID)
      .set(
        {
          [`season_${season}`]: {
            hitters: {
              // 背號＋姓名
              [`${playerID[i]}`]: {
                jersey_id: result[start + i * offset],
                ori_name: result[start + 1 + i * offset], // 原文
                name: result[start + 1 + i * offset], // 英文
                name_ch: result[start + 1 + i * offset], // 中文
                G: result[start + 3 + i * offset],
                PA: result[start + 4 + i * offset],
                AB: result[start + 5 + i * offset],
                RBI: result[start + 6 + i * offset],
                R: result[start + 7 + i * offset],
                H: result[start + 8 + i * offset],
                one_B: result[start + 9 + i * offset],
                two_B: result[start + 10 + i * offset],
                three_B: result[start + 11 + i * offset],
                HR: result[start + 12 + i * offset],
                TB: result[start + 13 + i * offset],
                SO: result[start + 14 + i * offset],
                SB: result[start + 15 + i * offset],
                OBP: result[start + 16 + i * offset],
                SLG: result[start + 17 + i * offset],
                AVG: result[start + 18 + i * offset],
                GIDP: result[start + 19 + i * offset],
                SAC: result[start + 20 + i * offset],
                SF: result[start + 21 + i * offset],
                BB: result[start + 22 + i * offset],
                IBB: result[start + 23 + i * offset],
                HBP: result[start + 24 + i * offset],
                CS: result[start + 25 + i * offset],
                GO: result[start + 26 + i * offset],
                AO: result[start + 27 + i * offset],
                // GF: result[start + 28 + i * offset],
                SBprecent: result[start + 29 + i * offset],
                TA: result[start + 30 + i * offset],
                SSA: result[start + 31 + i * offset]
              }
            }
          }
        },
        { merge: true }
      );
  }
}
function upsertFirestorePitcher(result, totalPlayer, playerID) {
  const teamID = mapTeam(result[33]);
  const start = 31;
  const offset = 32; // 一循環
  for (let i = 0; i < totalPlayer; i++) {
    firestore
      .collection(`${sportName}_${leagueName}`)
      .doc(teamID)
      .set(
        {
          [`season_${season}`]: {
            pitchers: {
              // 背號＋姓名
              [`${playerID[i]}`]: {
                jersey_id: result[start + i * offset],
                ori_name: result[start + 1 + i * offset], // 原文
                name: result[start + 1 + i * offset], // 英文
                name_ch: result[start + 1 + i * offset], // 中文
                G: result[start + 3 + i * offset],
                GS: result[start + 4 + i * offset],
                GR: result[start + 5 + i * offset],
                CG: result[start + 6 + i * offset],
                SHO: result[start + 7 + i * offset],
                NBB: result[start + 8 + i * offset],
                W: result[start + 9 + i * offset],
                L: result[start + 10 + i * offset],
                SV: result[start + 11 + i * offset],
                BS: result[start + 12 + i * offset],
                HLD: result[start + 13 + i * offset],
                IP: result[start + 14 + i * offset],
                WHIP: result[start + 15 + i * offset],
                ERA: result[start + 16 + i * offset],
                BF: result[start + 17 + i * offset],
                NP: result[start + 18 + i * offset],
                H: result[start + 19 + i * offset],
                HR: result[start + 20 + i * offset],
                BB: result[start + 21 + i * offset],
                IBB: result[start + 22 + i * offset],
                HBP: result[start + 23 + i * offset],
                SO: result[start + 24 + i * offset],
                WP: result[start + 25 + i * offset],
                BK: result[start + 26 + i * offset],
                R: result[start + 27 + i * offset],
                ER: result[start + 28 + i * offset],
                GO: result[start + 29 + i * offset],
                AO: result[start + 30 + i * offset],
                GF: result[start + 31 + i * offset]
              }
            }
          }
        },
        { merge: true }
      );
  }
}

module.exports = prematch_CPBL;
// 對戰成績
// console.log(result[17]); //接下來的數據是屬於哪一隊 team1
// console.log(result[18]); //總場數
// console.log(result[19]); //W-T-L
// console.log(result[20]); //PCT 勝率
// console.log(result[21]); //勝差
// console.log(result[23]); //對上下一隊的戰績
// console.log(result[24]); //對上下下一隊的戰績
// console.log(result[25]); //對上下下下一隊的戰績
// console.log(result[26]); //在主隊勝率
// console.log(result[27]); //在客隊勝率
// console.log(result[28]); // 連勝/連敗
// console.log(result[29]); //近十場

// console.log(result[31]); // 接下來的數據屬於哪一隊
// console.log(result[32]); //總場數
// console.log(result[33]); //W-T-L
// console.log(result[34]); //PCT 勝率
// console.log(result[35]); //勝差
// console.log(result[37]); //對上下一隊的戰績
// console.log(result[39]); //對上下下一隊的戰績
// console.log(result[40]); //對上下下下一隊的戰績
// console.log(result[41]); //在主隊勝率
// console.log(result[42]); //在客隊勝率
// console.log(result[43]); // 連勝/連敗
// console.log(result[44]); //近十場

// console.log(result[46]); // 接下來的數據屬於哪一隊
// console.log(result[47]); //總場數
// console.log(result[48]); //W-T-L
// console.log(result[49]); //PCT 勝率
// console.log(result[50]); //勝差
// console.log(result[52]); //對上下一隊的戰績
// console.log(result[53]); //對上下下一隊的戰績
// console.log(result[55]); //對上下下下一隊的戰績
// console.log(result[56]); //在主隊勝率
// console.log(result[57]); //在客隊勝率
// console.log(result[58]); // 連勝/連敗
// console.log(result[59]); //近十場

// console.log(result[61]); // 接下來的數據屬於哪一隊
// console.log(result[62]); //總場數
// console.log(result[63]); //W-T-L
// console.log(result[64]); //PCT 勝率
// console.log(result[65]); //勝差
// console.log(result[67]); //對上下一隊的戰績
// console.log(result[68]); //對上下下一隊的戰績
// console.log(result[69]); //對上下下下一隊的戰績
// console.log(result[71]); //在主隊勝率
// console.log(result[72]); //在客隊勝率
// console.log(result[73]); // 連勝/連敗
// console.log(result[74]); //近十場
// --------------投球成績
// console.log(result[90]); // 接下來的數據屬於哪一隊
// console.log(result[91]); //G
// console.log(result[92]); //BF
// console.log(result[93]); //NP
// console.log(result[94]); //H
// console.log(result[95]); //HR
// console.log(result[96]); //BB
// console.log(result[97]); //SO
// console.log(result[98]); //WP
// console.log(result[99]); //BK
// console.log(result[100]); //R
// console.log(result[101]); //ER
// console.log(result[102]); //WHIP
// console.log(result[103]); //ERA

// console.log(result[104]); // 接下來的數據屬於哪一隊
// console.log(result[105]); //G
// console.log(result[106]); //BF
// console.log(result[107]); //NP
// console.log(result[108]); //H
// console.log(result[109]); //HR
// console.log(result[110]); //BB
// console.log(result[111]); //SO
// console.log(result[112]); //WP
// console.log(result[113]); //BK
// console.log(result[114]); //R
// console.log(result[115]); //ER
// console.log(result[116]); //WHIP
// console.log(result[117]); //ERA

// console.log(result[118]); // 接下來的數據屬於哪一隊
// console.log(result[119]); //G
// console.log(result[120]); //BF
// console.log(result[121]); //NP
// console.log(result[122]); //H
// console.log(result[123]); //HR
// console.log(result[124]); //BB
// console.log(result[125]); //SO
// console.log(result[126]); //WP
// console.log(result[127]); //BK
// console.log(result[128]); //R
// console.log(result[129]); //ER
// console.log(result[130]); //WHIP
// console.log(result[131]); //ERA

// console.log(result[132]); // 接下來的數據屬於哪一隊
// console.log(result[133]); //G
// console.log(result[134]); //BF
// console.log(result[135]); //NP
// console.log(result[136]); //H
// console.log(result[137]); //HR
// console.log(result[138]); //BB
// console.log(result[139]); //SO
// console.log(result[140]); //WP
// console.log(result[141]); //BK
// console.log(result[142]); //R
// console.log(result[143]); //ER
// console.log(result[144]); //WHIP
// console.log(result[145]); //ERA

/// /--------------打擊成績
// console.log(result[161]); // 接下來的數據屬於哪一隊
// console.log(result[162]); //G
// console.log(result[163]); //AB
// console.log(result[164]); //R
// console.log(result[165]); //RBI
// console.log(result[166]); //H
// console.log(result[167]); //HR
// console.log(result[168]); //TB
// console.log(result[169]); //SO
// console.log(result[170]); //BB
// console.log(result[171]); //SB
// console.log(result[172]); //OBP
// console.log(result[173]); //SLG
// console.log(result[174]); //AVG

// console.log(result[175]); // 接下來的數據屬於哪一隊
// console.log(result[176]); //G
// console.log(result[177]); //AB
// console.log(result[178]); //R
// console.log(result[179]); //RBI
// console.log(result[180]); //H
// console.log(result[181]); //HR
// console.log(result[182]); //TB
// console.log(result[183]); //SO
// console.log(result[184]); //BB
// console.log(result[185]); //SB
// console.log(result[186]); //OBP
// console.log(result[187]); //SLG
// console.log(result[188]); //AVG

// console.log(result[189]); // 接下來的數據屬於哪一隊
// console.log(result[190]); //G
// console.log(result[191]); //AB
// console.log(result[192]); //R
// console.log(result[193]); //RBI
// console.log(result[194]); //H
// console.log(result[195]); //HR
// console.log(result[196]); //TB
// console.log(result[197]); //SO
// console.log(result[198]); //BB
// console.log(result[199]); //SB
// console.log(result[200]); //OBP
// console.log(result[201]); //SLG
// console.log(result[202]); //AVG

// console.log(result[203]); // 接下來的數據屬於哪一隊
// console.log(result[204]); //G
// console.log(result[205]); //AB
// console.log(result[206]); //R
// console.log(result[207]); //RBI
// console.log(result[208]); //H
// console.log(result[209]); //HR
// console.log(result[210]); //TB
// console.log(result[211]); //SO
// console.log(result[212]); //BB
// console.log(result[213]); //SB
// console.log(result[214]); //OBP
// console.log(result[215]); //SLG
// console.log(result[216]); //AVG

// 打擊球員資訊
// 31 背號  63下一位  95下一位
// 32 姓名
// 33 隊名
// 34 G
// 35 PA
// 36 AB
// 37 RBI
// 38 R
// 39 H
// 40 1B
// 41 2B
// 42 3B
// 43 HR
// 44 TB
// 45 SO
// 46 SB
// 47 OBP
// 48 SLG
// 49 AVG
// 50 GIDP
// 51 SAC
// 52 SF
// 53 BB
// 54 IBB
// 55 HBP
// 56 CS
// 57 GO
// 58 AO
// 59 G/F
// 60 SB%
// 61 TA
// 62 SSA
