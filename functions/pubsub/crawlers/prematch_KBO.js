const modules = require('../../util/modules');
const leagueUtil = require('../../util/leagueUtil');
const axios = require('axios');
const firebaseAdmin = require('../../util/firebaseUtil');
const firestore = firebaseAdmin().firestore();
const cheerio = require('cheerio');
const dbEngine = require('../../util/databaseEngine');
const AppErrors = require('../../util/AppErrors');
const teamsMapping = require('../../util/teamsMapping');
const teamStandings = {};
const configs = {
  league: 'KBO',
  official_URL: 'http://eng.koreabaseball.com/',
  myKBO_ULR: 'https://mykbostats.com/',
  // TODO table titles should be dynamic to crawler
  officialTeamStandingsUpperTitles: ['RK', 'TEAM', 'GAMES', 'W', 'L', 'D', 'PCT', 'GB', 'STREAK', 'HOME', 'AWAY'],
  officialTeamStandingsLowerTitles: ['RK', 'TEAM', 'AVG', 'ERA', 'RUNS', 'RUNS ALLOWED', 'HR'],
  teamStandingsFromMyKBO: ['Rank / Team', 'W', 'L', 'D', 'PCT', 'GB', 'STRK/LAST 10G'],
  pitcherByTeamPage1Titles: ['PLAYER', 'TEAM', 'ERA',	'G',	'CG', 'SHO', 'W', 'L', 'SV', 'HLD', 'PCT', 'PA', 'NP', 'IP', 'H', '2B', '3B', 'HR'],
  pitcherByTeamPage2Titles: ['PLAYER', 'TEAM', 'SAC', 'SF', 'BB', 'IBB', 'HBP', 'SO', 'WP', 'BK', 'R', 'ER', 'BS', 'WHIP', 'OAVG', 'QS'],
  pitcherSearchTitles: ['PLAYER', 'No.', 'POSITION', 'BORN', 'HT, WT'],
  teamBattingStatsPage1Titles: ['TEAM', 'AVG', 'G', 'PA', 'AB', 'R', 'H', '2B', '3B', 'HR', 'TB', 'RBI', 'SB', 'CS', 'SAC', 'SF'],
  teamBattingStatsPage2Titles: ['TEAM', 'BB', 'IBB', 'HBP', 'SO', 'GIDP', 'SLG', 'OBP', 'E', 'SBPCT', 'BB/K', 'XBH/H', 'MH', 'OPS', 'RISP', 'PH'],
  teamNumber: 10,
  collectionName: 'baseball_KBO',
  // DOOSAN, KIWOOM, SK, LG, NC, KT, KIA, SAMSUNG, HANWHA, LOTTE
  teamCode: ['OB', 'WO', 'SK', 'LG', 'NC', 'KT', 'HT', 'SS', 'HH', 'LT']
};
// TODO crawler KBO prematch information:
// 1. 隊伍資訊 ex: team_base, team_hit
// team_base: 近十場戰績 L10，（本季）戰績 W-L-D，（本季）主客隊戰績 at_home/at_away，（本季）平均得分/失分 RG/-RG (per_R & allow_per_R)
// 2. 本季投手資訊
// 勝敗(pitcher-Win, Loss)，防禦率(pitcher-EAR)，三振數(pitcher-SO)、背號「未做」
// TODO 作全隊
// 2-1 背號 ref from http://eng.koreabaseball.com/Teams/PlayerSearch.aspx
// 3. 本季打擊資訊
// team_hit: 得分 R，安打 H，全壘打數 HR，打擊率 AVG，上壘率 OBP，長打率 SLG
// 4. 本季球員資訊「未做」

async function prematch_KBO(req, res) {
  return new Promise(async function(resolve, reject) {
    try {
      const season = await getSeason(configs.league);
      await crawlerTeamBase(season);
      await crawlerTeamBaseForL10(season);
      await crawlerPitcher(season);
      await crawlerPitcherJerseyId(season);
      await crawlerHitting(season);
      return resolve(res.json('ok'));
    } catch (err) {
      return reject(new AppErrors.KBO_CrawlersError(err.stack));
    }
  });
}

function getSeason(league) {
  return new Promise(async function(resolve, reject) {
    try {
      return resolve(await dbEngine.getSeason(leagueUtil.leagueCodebook(league).id));
    } catch (err) {
      return reject(new AppErrors.GetSeasonError(`${err.stack} by TsaiChieh`));
    }
  });
}

function crawlerTeamBase(season) {
  return new Promise(async function(resolve, reject) {
    try {
      // 官網
      // TODO searchDate should be today(default)
      const today = modules.convertTimezoneFormat(Math.floor(Date.now() / 1000), { format: 'YYYY-MM-DD' });
      // const $_officialData = await crawler(`${configs.official_URL}Standings/TeamStandings.aspx?searchDate=2020-07-25`);
      const $_officialData = await crawler(`${configs.official_URL}Standings/TeamStandings.aspx?searchDate=${today}`);
      console.log(today);
      const officialData = await getTeamStandingsFromOfficial($_officialData);
      repackageTeamStandingsFromOfficial(officialData, season);
      return resolve();
    } catch (err) {
      return reject(new AppErrors.KBO_CrawlersError(`${err.stack} by TsaiChieh`));
    }
  });
}

function crawler(URL) {
  return new Promise(async function(resolve, reject) {
    try {
      const { data } = await axios.get(URL);
      const $ = cheerio.load(data); // load in the HTML
      return resolve($);
    } catch (err) {
      return reject(new AppErrors.CrawlersError(`${err.stack} by TsaiChieh`));
    }
  });
}

function getTeamStandingsFromOfficial($) {
  return new Promise(async function(resolve, reject) {
    try {
      const upperTable = []; // team_base
      const lowerTable = [];
      $('td').each(function(i) {
        // upper table
        if (i < configs.officialTeamStandingsUpperTitles.length * configs.teamNumber) {
          upperTable[i] = $(this).text();
        } else { // lower table
          lowerTable.push($(this).text());
        }
      });
      return resolve({ upperTable, lowerTable });
    } catch (err) {
      return reject(new AppErrors.CrawlersError(`${err.stack} by TsaiChieh`));
    }
  });
}

function repackageTeamStandingsFromOfficial(officialData, season) {
  return new Promise(async function(resolve, reject) {
    try {
      const { upperTable, lowerTable } = officialData;
      // 由於官網的本季資訊會隨當天日期而變化，若無比賽或未更新完成，lowerTable 會為空陣列，藉此來判斷本季資訊有無更新再做變動
      if (lowerTable.length !== 0) {
        for (let i = 0; i < upperTable.length; i++) {
          if (i % configs.officialTeamStandingsUpperTitles.length === 0) {
            const teamName = upperTable[i + 1];
            teamStandings[teamName] = [];
            const teamId = teamsMapping.KBO_teamName2id(teamName);
            const G = upperTable[i + 2]; // games
            const Win = upperTable[i + 3]; // W
            const Loss = upperTable[i + 4]; // L
            const Draw = upperTable[i + 5]; // D
            const PCT = upperTable[i + 6]; // 勝率
            const GB = upperTable[i + 7]; // 勝差
            const at_home = upperTable[i + 9];
            const at_away = upperTable[i + 10];
            teamStandings[teamName].push({ G });
            await insertTeamNameToFirestore(teamName, teamId);
            await setDataToFirestore({ G, Win, Loss, Draw, PCT, GB, at_home, at_away }, teamId, season, 'team_base');
          }
        }

        for (let i = 0; i < lowerTable.length; i++) {
          if (i % configs.officialTeamStandingsLowerTitles.length === 0) {
            const teamName = lowerTable[i + 1];
            const teamId = teamsMapping.KBO_teamName2id(teamName);
            const R = lowerTable[i + 4]; // Runs
            const allow_R = lowerTable[i + 5]; // Runs Allowed
            const G = parseInt(teamStandings[teamName][0].G); // games
            const per_R = String((parseInt(R) / G).toFixed(1));
            const per_allow_R = String((parseInt(allow_R) / G).toFixed(1));
            await setDataToFirestore({ R, allow_R, per_R, per_allow_R }, teamId, season, 'team_base');
          }
        }
      }
      return resolve();
    } catch (err) {
      return reject(new AppErrors.RepackageError(`${err.stack} by TsaiChieh`));
    }
  });
}

function insertTeamNameToFirestore(data, teamId) {
  return new Promise(async function(resolve, reject) {
    try {
      await modules.firestore.collection(configs.collectionName).doc(teamId).set({ alias: data }, { merge: true });
      return resolve();
    } catch (err) {
      return reject(new AppErrors.FirebaseCollectError(`${err.stack} by TsaiChieh`));
    }
  });
}

function setDataToFirestore(data, teamId, season, subLayerName) {
  return new Promise(async function(resolve, reject) {
    try {
      const temp = {};
      temp[`season_${season}`] = {};
      temp[`season_${season}`][subLayerName] = data;
      await firestore.collection(configs.collectionName).doc(teamId).set(temp, { merge: true });
      return resolve();
    } catch (err) {
      return reject(new AppErrors.FirebaseCollectError(`${err.stack} by TsaiChieh`));
    }
  });
}

function crawlerTeamBaseForL10(season) {
  return new Promise(async function(resolve, reject) {
    try {
      const $_myKBOData = await crawler(`${configs.myKBO_ULR}`);
      const myKBOData = await getTeamStandingsFromMyKBO($_myKBOData);
      repackageTeamStandingsFromMyKBO(myKBOData, season);
      return resolve();
    } catch (err) {
      return reject(new AppErrors.KBO_CrawlersError(`${err.stack} by TsaiChieh`));
    }
  });
}

function getTeamStandingsFromMyKBO($) {
  return new Promise(async function(resolve, reject) {
    try {
      const myKBOData = [];
      $('td').each(function(i) {
        myKBOData.push($(this).text());
      });
      return resolve(myKBOData);
    } catch (err) {
      return reject(new AppErrors.CrawlersError(`${err.stack} by TsaiChieh`));
    }
  });
}

function repackageTeamStandingsFromMyKBO(myKBOData, season) {
  return new Promise(async function(resolve, reject) {
    try {
      let j = 1;
      for (let i = 0; i < myKBOData.length; i++) {
        if (i % configs.teamStandingsFromMyKBO.length === 0) {
          const teamName = myKBOData[i].replace(`\n${j}\n\n`, '');
          const teamId = teamsMapping.KBO_teamName2id(teamName);
          const { STRK, L10 } = decompose_STRK_and_L10(myKBOData[i + 6]);
          // add create time & update time to debug
          const update_time = modules.firebaseAdmin.firestore.Timestamp.now();
          // await addDataToFirestore({ create_time }, teamId, season, 'team_base');
          await setDataToFirestore({ STRK, L10, update_time }, teamId, season, 'team_base');
          j++;
        }
      }
      return resolve();
    } catch (err) {
      return reject(new AppErrors.RepackageError(`${err.stack} by TsaiChieh`));
    }
  });
}

function decompose_STRK_and_L10(str) {
  const slashIndex = str.indexOf('/');
  const winIndex = str.indexOf('W', slashIndex);
  const lossIndex = str.indexOf('L', slashIndex);

  const STRK = str.substring(0, slashIndex).trim(); // streak 連勝/連輸
  const win = str.substring(slashIndex + 1, winIndex).trim();
  const loss = str.substring(winIndex + 1, lossIndex).trim();
  const draw = str.substring(lossIndex + 1, str.length - 1).trim();
  const L10 = `${win}-${loss}-${draw}`;
  return { STRK, L10 };
}

function crawlerPitcher(season) {
  return new Promise(async function(resolve, reject) {
    try {
      for (let i = 0; i < configs.teamNumber; i++) {
        const teamCode = configs.teamCode[i];
        // page1
        // console.log(`${configs.official_URL}Stats/PitchingByTeams.aspx?codeTeam=${teamCode}`);
        const $_pitchingStatsForPage1 = await crawler(`${configs.official_URL}Stats/PitchingByTeams.aspx?codeTeam=${teamCode}`);
        const pitchingStatsDataForPage1 = await getPitchingStatsFromOfficial($_pitchingStatsForPage1, configs.pitcherByTeamPage1Titles);
        repackagePitcherDataForPage1(pitchingStatsDataForPage1, configs.pitcherByTeamPage1Titles, season);
        // page 2
        const $_pitchingStatsForPage2 = await crawler(`${configs.official_URL}Stats/PitchingByTeams02.aspx?codeTeam=${teamCode}`);
        const pitchingStatsDataForPage2 = await getPitchingStatsFromOfficial($_pitchingStatsForPage2, configs.pitcherByTeamPage2Titles);
        repackagePitcherDataForPage2(pitchingStatsDataForPage2, configs.pitcherByTeamPage2Titles, season);
      }
      return resolve();
    } catch (err) {
      return reject(new AppErrors.KBO_CrawlersError(`${err.stack} by TsaiChieh`));
    }
  });
}

function getPitchingStatsFromOfficial($, titles) {
  return new Promise(async function(resolve, reject) {
    try {
      const pitcherStats = [];
      const pitcherIds = [];
      $('td').each(function(i, ele) {
        if (i % titles.length === 0) {
          const pitcherId = $(ele).find('a').attr('href').replace('/teams/playerinfopitcher/summary.aspx?pcode=', '');
          pitcherIds.push(pitcherId);
        }
        pitcherStats.push($(this).text());
      });
      return resolve({ pitcherStats, pitcherIds });
    } catch (err) {
      return reject(new AppErrors.CrawlersError(`${err.stack} by TsaiChieh`));
    }
  });
}

function repackagePitcherDataForPage1(pitchingStats, titles, season) {
  const { pitcherStats, pitcherIds } = pitchingStats;
  let j = 0;
  const data = {};
  const teamId = teamsMapping.KBO_teamName2id(pitcherStats[1]);
  for (let i = 0; i < pitcherStats.length; i++) {
    if (i % titles.length === 0) {
      const name = pitcherStats[i];
      const pitcherId = pitcherIds[j];
      const ERA = pitcherStats[i + 3];
      const G = pitcherStats[i + 4];
      const CG = pitcherStats[i + 5];
      const SHO = pitcherStats[i + 6];
      const W = pitcherStats[i + 7];
      const SV = pitcherStats[i + 8];
      const HLD = pitcherStats[i + 9];
      const PCT = pitcherStats[i + 10];
      const PA = pitcherStats[i + 11];
      const NP = pitcherStats[i + 12];
      const IP = pitcherStats[i + 13];
      const H = pitcherStats[i + 14];
      const two_B = pitcherStats[i + 15];
      const three_B = pitcherStats[i + 16];
      const one_B = String(Number(H) - Number(two_B) - Number(three_B));
      const HR = pitcherStats[i + 17];
      data[pitcherId] = { name, ERA, G, CG, SHO, W, SV, HLD, PCT, PA, NP, IP, H, one_B, two_B, three_B, HR };
      j++;
    }
  }
  insertPitcherToFirestore(data, teamId, season);
}

function repackagePitcherDataForPage2(pitchingStats, titles, season) {
  return new Promise(async function(resolve, reject) {
    try {
      const { pitcherStats, pitcherIds } = pitchingStats;
      let j = 0;
      const data = {};
      const teamId = teamsMapping.KBO_teamName2id(pitcherStats[1]);
      for (let i = 0; i < pitcherStats.length; i++) {
        if (i % titles.length === 0) {
          const pitcherId = pitcherIds[j];
          const SAC = pitcherStats[i + 2];
          const SF = pitcherStats[i + 3];
          const BB = pitcherStats[i + 4];
          const IBB = pitcherStats[i + 5];
          const HBP = pitcherStats[i + 6];
          const SO = pitcherStats[i + 7];
          const WP = pitcherStats[i + 8];
          const BK = pitcherStats[i + 9];
          const R = pitcherStats[i + 10];
          const ER = pitcherStats[i + 11];
          const BS = pitcherStats[i + 12];
          const WHIP = pitcherStats[i + 13];
          const OAVG = pitcherStats[i + 14];
          const QS = pitcherStats[i + 15];
          const update_time = modules.firebaseAdmin.firestore.Timestamp.now();
          data[pitcherId] = { SAC, SF, BB, IBB, HBP, SO, WP, BK, R, ER, BS, WHIP, OAVG, QS, update_time };
          j++;
        }
      }
      insertPitcherToFirestore(data, teamId, season);
      return resolve();
    } catch (err) {
      return reject(new AppErrors.RepackageError(`${err.stack} by TsaiChieh`));
    }
  });
}

function insertPitcherToFirestore(officialData, teamId, season) {
  return new Promise(async function(resolve, reject) {
    try {
      const data = {};
      data[`season_${season}`] = {};
      data[`season_${season}`].pitchers = officialData;
      await firestore.collection(configs.collectionName).doc(teamId).set(data, { merge: true });
      return resolve();
    } catch (err) {
      return reject(new AppErrors.FirebaseCollectError(`${err.stack} by TsaiChieh`));
    }
  });
}

function crawlerPitcherJerseyId(season) {
  return new Promise(async function(resolve, reject) {
    try {
      // for (let i = 0; i < configs.teamCode.length; i++) {
      // const teamCode = configs.teamCode[i].toLowerCase();
      const $_pitchersData = await crawler(`${configs.official_URL}Teams/PlayerSearch.aspx`);

      const pitchersData = await getPitcherJerseyId($_pitchersData);
      // console.log(`${configs.official_URL}Teams/PlayerSearch.aspx?codeTeam=${teamCode}`, '------');
      await repackagePitchersData(pitchersData, season);
      // }
      return resolve();
    } catch (err) {
      return reject(new AppErrors.KBO_CrawlersError(`${err.stack} by TsaiChieh`));
    }
  });
}

function getPitcherJerseyId($) {
  return new Promise(async function(resolve, reject) {
    try {
      const pitchersData = [];
      const pitcherIds = [];
      $('tr').each(function(i, ele) {
        if (i > 0) { // Escape title
          const pitcherId = $(ele).find('a').attr('href').replace('/Teams/PlayerInfoPitcher/Summary.aspx?pcode=', '');
          pitcherIds.push(pitcherId);
        }
      });
      $('td').each(function(i) {
        pitchersData.push($(this).text());
      });
      return resolve({ pitchersData, pitcherIds });
    } catch (err) {
      return reject(new AppErrors.CrawlersError(`${err.stack} by TsaiChieh`));
    }
  });
}

function repackagePitchersData(data, season) {
  return new Promise(async function(resolve, reject) {
    try {
      const { pitchersData, pitcherIds } = data;
      let j = 0;
      const temp = {};
      for (let i = 0; i < pitchersData.length; i++) {
        if (i % (configs.pitcherSearchTitles.length - 1) === 0) {
          const pitcherId = pitcherIds[j];
          const teamId = '3353';
          const jersey_id = pitchersData[i];
          const born = pitchersData[i + 2];
          const HT_WT = pitchersData[i + 3];
          temp[pitcherId] = { jersey_id, born, HT_WT };
          j++;
          console.log(temp);
          await insertPitcherToFirestore(temp, teamId, season);
        }
      }

      return resolve();
    } catch (err) {
      return reject(new AppErrors.RepackageError(`${err.stack} by TsaiChieh`));
    }
  });
}

function crawlerHitting(season) {
  return new Promise(async function(resolve, reject) {
    try {
      const { teamBattingStatsPage1Titles, teamBattingStatsPage2Titles } = configs;
      const $_teamHittingStats = await crawler(`${configs.official_URL}Stats/TeamStats.aspx`);
      const teamHittingStatsData = await getTeamHittingFromOfficial($_teamHittingStats);
      repackageHittingData(teamHittingStatsData, { teamBattingStatsPage1Titles, teamBattingStatsPage2Titles }, season);
      return resolve();
    } catch (err) {
      return reject(new AppErrors.KBO_CrawlersError(`${err.stack} by TsaiChieh`));
    }
  });
}

function getTeamHittingFromOfficial($) {
  return new Promise(async function(resolve, reject) {
    try {
      const teamByTeamResultsLength = 11 * 12;
      const teamBattingStatsPage1Length = configs.teamBattingStatsPage1Titles.length * configs.teamNumber + teamByTeamResultsLength;
      const teamBattingStatsPage2Length = configs.teamBattingStatsPage2Titles.length * configs.teamNumber + teamBattingStatsPage1Length;
      const teamHittingStatsForPage1 = [];
      const teamHittingStatsForPage2 = [];
      $('td').each(function(i) {
        if (i >= teamByTeamResultsLength && i < teamBattingStatsPage1Length) {
          teamHittingStatsForPage1.push($(this).text());
        } else if (i >= teamBattingStatsPage1Length && i < teamBattingStatsPage2Length) {
          teamHittingStatsForPage2.push($(this).text());
        }
      });
      return resolve({ teamHittingStatsForPage1, teamHittingStatsForPage2 });
    } catch (err) {
      return reject(new AppErrors.CrawlersError(`${err.stack} by TsaiChieh`));
    }
  });
}

function repackageHittingData(hittingStats, titles, season) {
  return new Promise(async function(resolve, reject) {
    try {
      const { teamHittingStatsForPage1, teamHittingStatsForPage2 } = hittingStats;
      const { teamBattingStatsPage1Titles, teamBattingStatsPage2Titles } = titles;
      for (let i = 0; i < teamHittingStatsForPage1.length; i++) {
        if (i % teamBattingStatsPage1Titles.length === 0) {
          const teamId = teamsMapping.KBO_teamName2id(teamHittingStatsForPage1[i]);
          const AVG = teamHittingStatsForPage1[i + 1];
          const G = teamHittingStatsForPage1[i + 2];
          const PA = teamHittingStatsForPage1[i + 3];
          const AB = teamHittingStatsForPage1[i + 4];
          const R = teamHittingStatsForPage1[i + 5];
          const H = teamHittingStatsForPage1[i + 6];
          const two_B = teamHittingStatsForPage1[i + 7];
          const three_B = teamHittingStatsForPage1[i + 8];
          const one_B = String(Number(H) - Number(two_B) - Number(three_B));
          const HR = teamHittingStatsForPage1[i + 9];
          const TB = teamHittingStatsForPage1[i + 10];
          const RBI = teamHittingStatsForPage1[i + 11];
          const SB = teamHittingStatsForPage1[i + 12];
          const CS = teamHittingStatsForPage1[i + 13];
          const SAC = teamHittingStatsForPage1[i + 14];
          const SF = teamHittingStatsForPage1[i + 15];
          await setDataToFirestore({ AVG, G, PA, AB, R, H, one_B, two_B, three_B, HR, TB, RBI, SB, CS, SAC, SF }, teamId, season, 'team_hit');
        }
      }

      for (let i = 0; i < teamHittingStatsForPage2.length; i++) {
        if (i % teamBattingStatsPage2Titles.length === 0) {
          const teamId = teamsMapping.KBO_teamName2id(teamHittingStatsForPage2[i]);
          const BB = teamHittingStatsForPage2[i + 17];
          const IBB = teamHittingStatsForPage2[i + 18];
          const HBP = teamHittingStatsForPage2[i + 19];
          const SO = teamHittingStatsForPage2[i + 20];
          const GIDP = teamHittingStatsForPage2[i + 21];
          const SLG = teamHittingStatsForPage2[i + 22];
          const OBP = teamHittingStatsForPage2[i + 23];
          const E = teamHittingStatsForPage2[i + 24];
          const SBPCT = teamHittingStatsForPage2[i + 25];
          const BB_per_K = teamHittingStatsForPage2[i + 26];
          const XBH_per_H = teamHittingStatsForPage2[i + 27];
          const MH = teamHittingStatsForPage2[i + 28];
          const OPS = teamHittingStatsForPage2[i + 29];
          const RISP = teamHittingStatsForPage2[i + 30];
          const PH = teamHittingStatsForPage2[i + 31];
          const update_time = modules.firebaseAdmin.firestore.Timestamp.now();
          await setDataToFirestore({ BB, IBB, HBP, SO, GIDP, SLG, OBP, E, SBPCT, BB_per_K, XBH_per_H, MH, OPS, RISP, PH, update_time }, teamId, season, 'team_hit');
        }
      }
      resolve();
    } catch (err) {
      return reject(new AppErrors.RepackageError(`${err.stack} by TsaiChieh`));
    }
  });
}

module.exports = prematch_KBO;
