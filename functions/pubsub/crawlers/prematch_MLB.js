const AppErrors = require('../../util/AppErrors');
const { getSeason } = require('../../util/databaseEngine');
const { leagueCodebook } = require('../../util/leagueUtil');
const { getDataByAxios, setDataToFirestore, insertTeamNameToFirestore, insertPlayerToFirestore, debugLogger } = require('../../util/crawlerUtil');
const { MLB_teamName2id } = require('../../util/teamsMapping');
const firebaseAdmin = require('../../util/firebaseUtil');

const configs = {
  league: 'MLB',
  collectionName: 'baseball_MLB',
  // TODO season query params should be dynamic
  teamBaseAPI: 'https://statsapi.mlb.com/api/v1/standings?leagueId=103,104&season=2020&date=2020-09-27&standingsTypes=regularSeason&hydrate=division,conference,sport,league,team(nextSchedule(team,gameType=%5BR,F,D,L,W,C%5D,inclusive=false),previousSchedule(team,gameType=%5BR,F,D,L,W,C%5D,inclusive=true))',
  hitterAPI: 'https://bdfed.stitch.mlbinfra.com/bdfed/stats/player?stitch_env=prod&season=2020&sportId=1&stats=season&group=hitting&gameType=R&limit=1000&offset=0&sortStat=onBasePlusSlugging&order=desc&playerPool=ALL',
  // teamAlias: ['CIN', 'PHI', 'MIA', 'NYY', 'TEX', 'SD', 'CHC', 'CWS', 'HOU', 'COL', 'BAL', 'SF', 'BOS', 'LAD', 'TOR', 'ATL', 'SEA', 'LAA', 'PIT', 'TB', 'WSH', 'KC', 'NYM', 'FLA', 'CLE', 'MIL', 'OAK', 'STL', 'MIN', 'ARI']
  teamAlias:
  ['LAA', 'OAK', 'SEA', 'HOU', 'TEX', // 美國聯盟-西區
    'DET', 'KC', 'CLE', 'CWS', 'MIN', // 美國聯盟-中區
    'BAL', 'TOR', 'NYY', 'TB', 'BOS', // 美國聯盟-東區
    'LAD', 'SF', 'SD', 'ARI', 'COL', // 國家聯盟-西區
    'STL', 'PIT', 'MIL', 'CIN', 'CHC', // 國家聯盟-中區
    'WSH', 'ATL', 'FLA', 'NYM', 'PHI'] // 國家聯盟-東區
};

// MLB ref
// 1. team_base
// 2. hitters: https://www.mlb.com/stats/?playerPool=ALL

async function prematch_MLB(req, res) {
  return new Promise(async function(resolve, reject) {
    try {
      const season = await getSeason(leagueCodebook(configs.league).id);
      await crawler(configs.teamBaseAPI, season, repackageTeamBase);
      await crawler(configs.hitterAPI, season, repackageHitters);
      return resolve(res.json('MLB'));
    } catch (err) {
      return reject(new AppErrors.MLB_CrawlersError(err.stack));
    }
  });
}

function repackageTeamBase(season, data) {
  return new Promise(async function(resolve, reject) {
    try {
      // Go through each region
      for (let i = 0; i < data.records.length; i++) {
        for (let j = 0; j < data.records[i].teamRecords.length; j++) {
          const teamData = data.records[i].teamRecords[j];
          const teamName = teamData.team.name;
          const teamAlias = teamData.team.shortName;
          const teamId = MLB_teamName2id(teamName).id;
          const Win = String(teamData.leagueRecord.wins);
          const Loss = String(teamData.leagueRecord.losses);
          const G = String(Number(Win) + Number(Loss));
          const PCT = String(`0${teamData.leagueRecord.pct}`); // 勝率
          const GB = teamData.gamesBack; // 勝差
          const R = String(teamData.runsScored);
          const per_R = String((Number(R) / Number(G)).toFixed(1));
          const allow_R = String(teamData.runsAllowed);
          const per_allow_R = String((Number(allow_R) / Number(G)).toFixed(1));
          const STRK = teamData.streak.streakCode;
          const at_home = `${teamData.records.splitRecords[0].wins}-${teamData.records.splitRecords[0].losses}`;
          const at_away = `${teamData.records.splitRecords[1].wins}-${teamData.records.splitRecords[1].losses}`;
          // add create time & update time to debug
          const update_time = firebaseAdmin().firestore.Timestamp.now();
          await insertTeamNameToFirestore(teamAlias, { collectionName: configs.collectionName, teamId });
          await setDataToFirestore({ Win, Loss, G, PCT, GB, R, per_R, allow_R, per_allow_R, STRK, at_home, at_away, update_time }, { season, fieldName: 'team_base', collectionName: configs.collectionName, teamId });
          // debugLogger({ league: configs.league, teamId, teamName: teamAlias, fieldName: 'team_base' });
        }
      }
      return resolve();
    } catch (err) {
      return reject(new AppErrors.RepackageError());
    }
  });
}

function crawler(URL, season, callback) {
  return new Promise(async function(resolve, reject) {
    try {
      const data = await getDataByAxios(URL);
      await callback(season, data);
      return resolve();
    } catch (err) {
      return reject(new AppErrors.MLB_CrawlersError(err.stack));
    }
  });
}

function repackageHitters(season, data) {
  return new Promise(async function(resolve, reject) {
    try {
      // initial each team array to save hitter data
      const temp = {};
      for (let i = 0; i < configs.teamAlias.length; i++) {
        const teamName = configs.teamAlias[i];
        const teamId = MLB_teamName2id(teamName).id;
        temp[teamId] = {};
      }

      for (let i = 0; i < data.stats.length; i++) {
        const ele = data.stats[i];
        const teamName = ele.teamAbbrev;
        const teamId = MLB_teamName2id(teamName).id;
        const playerId = String(ele.playerId);
        const ori_name = ele.playerFullName;
        const name = ele.playerInitLastName;
        const first_name = ele.playerFirstName;
        const last_name = ele.playerLastName;
        const jersey_id = String(ele.numberOfPitches);
        const position = ele.positionAbbrev;
        const AVG = String(Number(ele.avg).toFixed(1));
        const G = String(ele.gamesPlayed);
        const PA = String(ele.plateAppearances);
        const AB = String(ele.atBats);
        const R = String(ele.runs);
        const H = String(ele.hits);
        const two_B = String(ele.doubles);
        const three_B = String(ele.triples);
        const one_B = String(Number(H) - Number(two_B) - Number(three_B));
        const HR = String(ele.homeRuns);
        const TB = String(ele.totalBases);
        const RBI = String(ele.rbi);
        const SB = String(ele.stolenBases);
        const CS = String(ele.caughtStealing);
        const SAC = String(ele.sacBunts);
        const SF = String(ele.sacFlies);
        const BB = String(ele.baseOnBalls);
        const IBB = String(ele.intentionalWalks);
        const HBP = String(ele.hitByPitch);
        const SO = String(ele.strikeOuts);
        const GIDP = String(ele.groundIntoDoublePlay);
        const SLG = checkIsNaN(ele.slg);
        const OBP = checkIsNaN(ele.obp);
        const SBPCT = checkIsNaN(ele.stolenBasePercentage); // 盜壘成功率
        const BB_per_K = checkIsNaN(ele.walksPerStrikeout);
        const XBH = String(ele.extraBaseHits);
        const XBH_per_H = Number(H) !== 0 ? String((Number(XBH) / Number(H)).toFixed(3)) : String(0);
        const OPS = checkIsNaN(ele.ops);
        const update_time = firebaseAdmin().firestore.Timestamp.now();
        temp[teamId][playerId] = { ori_name, name, first_name, last_name, jersey_id, position, AVG, G, PA, AB, R, H, one_B, two_B, three_B, HR, TB, RBI, SB, CS, SAC, SF, BB, IBB, HBP, SO, GIDP, SLG, OBP, SBPCT, BB_per_K, XBH, XBH_per_H, OPS, update_time };
      }

      for (let i = 0; i < configs.teamAlias.length; i++) {
        const teamId = MLB_teamName2id(configs.teamAlias[i]).id;
        const data = temp[teamId];
        await insertPlayerToFirestore(data, { playerType: 'hitters', collectionName: configs.collectionName, teamId, season });
      }
      return resolve();
    } catch (err) {
      return reject(new AppErrors.MLB_CrawlersError(err.stack));
    }
  });
}

function checkIsNaN(numberString) {
  return String(isNaN(Number(numberString)) ? '-' : Number(numberString));
}
module.exports = prematch_MLB;
