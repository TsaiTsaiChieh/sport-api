const logger = require('firebase-functions/lib/logger');
const firebaseAdmin = require('../../util/firebaseUtil');
const firestore = firebaseAdmin().firestore();
const axios = require('axios');
const AppErrors = require('../../util/AppErrors');
const cheerio = require('cheerio');
const CPBL_URL = 'http://www.cpbl.com.tw';
const totalTeam = 4;
const leagueName = 'CPBL';
const leagueUtil = require('../../util/leagueUtil');
const sportName = leagueUtil.league2Sport(leagueName).sport;
const season = '2020';

async function prematch_CPBL() {
  let URL;

  // 取得各隊伍的資訊
  URL = `${CPBL_URL}/standing/season.html`;
  await getTeamsStandings(URL);

  URL = `${CPBL_URL}/web/team_playergrade.php?&team=E02&gameno=01`;
  await getHittersStandings(URL); // 中信兄弟 選手打擊

  URL = `${CPBL_URL}/web/team_playergrade.php?&team=L01&gameno=01`;
  await getHittersStandings(URL); // 統一獅 選手打擊

  URL = `${CPBL_URL}/web/team_playergrade.php?&team=AJL011&gameno=01`;
  await getHittersStandings(URL); // 樂天猴 選手打擊

  URL = `${CPBL_URL}/web/team_playergrade.php?&team=B04&gameno=01`;
  await getHittersStandings(URL); // 富邦 選手打擊

  URL = `${CPBL_URL}/web/team_playergrade.php?&gameno=01&team=E02&year=2020&grade=2&syear=2020`;
  await getPitchersStandings(URL); // 中信兄弟 選手投手

  URL = `${CPBL_URL}/web/team_playergrade.php?&gameno=01&team=L01&year=2020&grade=2&syear=2020`;
  await getPitchersStandings(URL); // 統一獅 選手投手

  URL = `${CPBL_URL}/web/team_playergrade.php?&gameno=01&team=AJL011&year=2020&grade=2&syear=2020`;
  await getPitchersStandings(URL); // 樂天猴 選手投手

  URL = `${CPBL_URL}/web/team_playergrade.php?&gameno=01&team=B04&year=2020&grade=2&syear=2020`;
  await getPitchersStandings(URL); // 富邦 選手投手
}

async function getPitchersStandings(URL) {
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
      upsertFirestorePitcher(result, totalPlayer, playerID);
    } catch (err) {
      console.error(err, '=-----');
      return reject(new AppErrors.CrawlersError(`${err.stack} by DY`));
    }
    resolve('ok');
  });
}

async function getHittersStandings(URL) {
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

      upsertFirestoreHitter(result, totalPlayer, playerID);
    } catch (err) {
      console.error(err, '=-----');
      return reject(new AppErrors.CrawlersError(`${err.stack} by DY`));
    }
    resolve('ok');
  });
}

async function getTeamsStandings(URL) {
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
      for (let i = 1; i <= totalTeam; i++) {
        upsertFirestoreTeam(i, result);
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
  firestore
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
            Loss: result[index + 3].split('-')[2],
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
  debugLogger(teamID);
}
async function upsertFirestoreHitter(result, totalPlayer, playerID) {
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
async function upsertFirestorePitcher(result, totalPlayer, playerID) {
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

function debugLogger(teamId) {
  logger.debug(`棒球 ${leagueName} 更新隊伍 (${teamId}) 完成`);
}

module.exports = prematch_CPBL;
