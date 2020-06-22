const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
const AppErrors = require('../../util/AppErrors');
const leagueUniteID = '22000';
const sportID = 1;
const leagueArray = [22614, 22808, 22764, 22537, 22724];
const Match = db.Match;
const MatchTeam = db.Team;
module.exports.eSoccer = {};
module.exports.eSoccer.upcoming = async function (date) {
  return new Promise(async function (resolve, reject) {
    try {
      for (let i = 0; i < leagueArray.length; i++) {
        const leagueID = leagueArray[i];
        const URL = `https://api.betsapi.com/v2/events/upcoming?sport_id=${sportID}&token=${modules.betsToken}&league_id=${leagueID}&day=${date}`;
        const data = await axiosForURL(URL);
        if (data.results) {
          for (let j = 0; j < data.results.length; j++) {
            const ele = data.results[j];
            if (ele.home.name.indexOf('Esports') !== -1) {
              ele.home.name = ele.home.name.replace('Esports', '');
            }
            if (ele.away.name.indexOf('Esports') !== -1) {
              ele.away.name = ele.away.name.replace('Esports', '');
            }
            await write2realtime(ele);
            await write2MysqlOfMatch(ele);
            await write2MysqlOfMatchTeam(ele);
          }
        } else {
          console.log(leagueID + 'has no upcoming event now');
        }
      }
      console.log('esport scheduled success');
      return resolve('ok');
    } catch (err) {
      return reject(
        new AppErrors.PrematchEsoccerError(
          `${err} at prematchFunctions_ESoccer by DY`
        )
      );
    }
  });
};
async function axiosForURL(URL) {
  return new Promise(async function (resolve, reject) {
    try {
      const {data} = await modules.axios(URL);
      return resolve(data);
    } catch (err) {
      return reject(
        new AppErrors.AxiosError(`${err} at prematchFunctions_ESoccer by DY`)
      );
    }
  });
}

async function write2realtime(ele) {
  return new Promise(async function (resolve, reject) {
    try {
      await modules.database
        .ref(`esports/eSoccer/${ele.id}/Summary/status`)
        .set('scheduled');
      return resolve('ok');
    } catch (err) {
      return reject(
        new AppErrors.FirebaseRealtimeError(
          `${err} at prematchFunctions_ESoccer by DY`
        )
      );
    }
  });
}

async function write2MysqlOfMatch(ele) {
  return new Promise(async function (resolve, reject) {
    try {
      const dataEvent = {
        bets_id: ele.id,
        league_id: leagueUniteID,
        ori_league_id: ele.league.id,
        sport_id: ele.sport_id,
        ori_sport_id: ele.sport_id,
        home_id: ele.home.id,
        away_id: ele.away.id,
        scheduled: Number.parseInt(ele.time),
        scheduled_tw: Number.parseInt(ele.time) * 1000,
        flag_prematch: 1,
        status: 2
      };
      await Match.upsert(dataEvent);
      return resolve('ok');
    } catch (err) {
      return reject(
        new AppErrors.MysqlError(`${err} at prematchFunctions_ESoccer by DY`)
      );
    }
  });
}

async function write2MysqlOfMatchTeam(ele) {
  return new Promise(async function (resolve, reject) {
    try {
      const dataHomeTeam = {
        team_id: ele.home.id,
        league_id: leagueUniteID,
        sport_id: ele.sport_id,
        name: ele.home.name.trim(),
        name_ch: translate(ele.home.name.trim()),
        alias: ele.home.name.trim(),
        alias_ch: translate(ele.home.name.trim()),
        image_id: ele.home.image_id
      };
      const dataAwayTeam = {
        team_id: ele.away.id,
        league_id: leagueUniteID,
        sport_id: ele.sport_id,
        name: ele.away.name.trim(),
        name_ch: translate(ele.away.name.trim()),
        alias: ele.away.name.trim(),
        alias_ch: translate(ele.away.name.trim()),
        image_id: ele.away.image_id
      };
      await MatchTeam.upsert(dataHomeTeam);
      await MatchTeam.upsert(dataAwayTeam);
      return resolve('ok');
    } catch (err) {
      return reject(
        new AppErrors.MysqlError(`${err} at prematchFunctions_ESoccer by DY`)
      );
    }
  });
}
function translate(team) {
  let oriText = [
    'Man City',
    'PSG',
    'Liverpool',
    'Arsenal',
    'Man Utd',
    `M'Gladbach`,
    'Tottenham',
    'Real Madrid',
    'Portugal',
    'Spain',
    'Napoli',
    'CSKA Moscow',
    'Dortmund',
    'Barcelona',
    'Valencia',
    'Lokomotiv Moscow',
    'Atalanta',
    'Lazio',
    'Shakhtar Donetsk',
    'Ajax',
    'Belgium',
    'Porto',
    'Dynamo Kyiv',
    'AC Milan',
    'Germany',
    'Bayern',
    'Spartak Moscow',
    'Leverkusen',
    'Inter Milan',
    'Brazil',
    'France'
  ];
  let changeText = [
    '曼徹斯特城',
    '巴黎聖日耳曼',
    '利物浦',
    '阿森納',
    '曼徹斯特聯',
    '門興格拉德巴赫',
    '托特納姆',
    '皇家馬德里',
    '葡萄牙',
    '西班牙',
    '那不勒斯',
    '莫斯科中央陸軍',
    '多蒙特',
    '巴塞隆納',
    '巴倫西亞',
    '莫斯科火車頭',
    '亞特蘭大',
    '拉齊奧',
    '頓內次克礦工',
    '阿賈克斯',
    '比利時',
    '波多',
    '基輔戴拿模',
    'AC 米蘭',
    '德國',
    '拜仁慕尼黑',
    '莫斯科斯巴達克',
    '拜耳樂沃庫森',
    '國際米蘭',
    '巴西',
    '法國'
  ];
  return team;
}
