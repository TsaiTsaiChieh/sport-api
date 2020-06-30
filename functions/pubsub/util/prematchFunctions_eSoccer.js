const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
const AppErrors = require('../../util/AppErrors');
const leagueUniteID = '22000';
const sportID = 1;
const leagueArray = [22614, 22808, 22764, 22537, 22724];
const league = 'eSoccer';
const sport = 'esports';
const Match = db.Match;
const MatchTeam = db.Team;
module.exports.eSoccer = {};
module.exports.eSoccer.upcoming = async function(date) {
  return new Promise(async function(resolve, reject) {
    try {
      for (let i = 0; i < leagueArray.length; i++) {
        const leagueID = leagueArray[i];
        let URL = `https://api.betsapi.com/v2/events/upcoming?sport_id=${sportID}&token=${modules.betsToken}&league_id=${leagueID}&day=${date}&page=1`;
        let data = await axiosForURL(URL);
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
            await write2MysqlOfMatchTeam(ele, leagueID);
          }
          if (data.pager.total > 50) {
            URL = `https://api.betsapi.com/v2/events/upcoming?sport_id=${sportID}&token=${modules.betsToken}&league_id=${leagueID}&day=${date}&page=2`;
            data = await axiosForURL(URL);
            for (let k = 0; k < data.results.length; k++) {
              const ele = data.results[k];
              if (ele.home.name.indexOf('Esports') !== -1) {
                ele.home.name = ele.home.name.replace('Esports', '');
              }
              if (ele.away.name.indexOf('Esports') !== -1) {
                ele.away.name = ele.away.name.replace('Esports', '');
              }
              await write2realtime(ele);
              await write2MysqlOfMatch(ele);
              await write2MysqlOfMatchTeam(ele, leagueID);
            }
          }
          if (data.pager.total > 100) {
            URL = `https://api.betsapi.com/v2/events/upcoming?sport_id=${sportID}&token=${modules.betsToken}&league_id=${leagueID}&day=${date}&page=3`;
            data = await axiosForURL(URL);
            for (let l = 0; l < data.results.length; l++) {
              const ele = data.results[l];
              if (ele.home.name.indexOf('Esports') !== -1) {
                ele.home.name = ele.home.name.replace('Esports', '');
              }
              if (ele.away.name.indexOf('Esports') !== -1) {
                ele.away.name = ele.away.name.replace('Esports', '');
              }
              await write2realtime(ele);
              await write2MysqlOfMatch(ele);
              await write2MysqlOfMatchTeam(ele, leagueID);
            }
          }
        } else {
          console.log(leagueID + 'has no upcoming event now');
        }
      }
      console.log(`${league} scheduled success`);
      return resolve('ok');
    } catch (err) {
      return reject(
        new AppErrors.PrematchEsoccerError(
          `${err} at prematchFunctions_${league} by DY`
        )
      );
    }
  });
};
async function axiosForURL(URL) {
  return new Promise(async function(resolve, reject) {
    try {
      const { data } = await modules.axios(URL);
      return resolve(data);
    } catch (err) {
      return reject(
        new AppErrors.AxiosError(`${err} at prematchFunctions_${league} by DY`)
      );
    }
  });
}

async function write2realtime(ele) {
  return new Promise(async function(resolve, reject) {
    try {
      await modules.database
        .ref(`${sport}/${league}/${ele.id}/Summary/status`)
        .set('scheduled');
      return resolve('ok');
    } catch (err) {
      return reject(
        new AppErrors.FirebaseRealtimeError(
          `${err} at prematchFunctions_${league} by DY`
        )
      );
    }
  });
}

async function write2MysqlOfMatch(ele) {
  return new Promise(async function(resolve, reject) {
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
        new AppErrors.MysqlError(`${err} at prematchFunctions_${league} by DY`)
      );
    }
  });
}

async function write2MysqlOfMatchTeam(ele, leagueID) {
  return new Promise(async function(resolve, reject) {
    try {
      const dataHomeTeam = {
        team_id: ele.home.id,
        league_id: leagueUniteID,
        sport_id: ele.sport_id,
        name: ele.home.name.trim(),
        name_ch: translate(ele.home.name.trim(), leagueID),
        alias: ele.home.name.trim(),
        alias_ch: translate(ele.home.name.trim(), leagueID),
        image_id: ele.home.image_id
      };
      const dataAwayTeam = {
        team_id: ele.away.id,
        league_id: leagueUniteID,
        sport_id: ele.sport_id,
        name: ele.away.name.trim(),
        name_ch: translate(ele.away.name.trim(), leagueID),
        alias: ele.away.name.trim(),
        alias_ch: translate(ele.away.name.trim(), leagueID),
        image_id: ele.away.image_id
      };
      await MatchTeam.upsert(dataHomeTeam);
      await MatchTeam.upsert(dataAwayTeam);
      return resolve('ok');
    } catch (err) {
      return reject(
        new AppErrors.MysqlError(`${err} at prematchFunctions_${league} by DY`)
      );
    }
  });
}
function translate(team, leagueID) {
  const eSB8ori = [
    'PSG',
    'Man City',
    'Liverpool',
    'Arsenal',
    'Man Utd',
    "M'Gladbach",
    "Borussia M'gladbach",
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
    'France',
    'Netherlands',
    'Italy',
    'Sevilla',
    'Atletico Madrid',
    'RB Leipzig',
    'England'
  ];
  const eSB8tran = [
    '巴黎聖日耳曼',
    '曼徹斯特城',
    '利物浦',
    '阿森納',
    '曼徹斯特聯',
    '門興格拉德巴赫',
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
    '法國',
    '荷蘭',
    '義大利',
    '塞維利亞',
    '馬德里競技',
    'RB萊比錫',
    '英格蘭'
  ];
  const eLiga12ori = [
    'Club America',
    'Pachuca',
    'Juarez FC',
    'Puebla',
    'Leon',
    'Cruz Azul',
    'Toluca',
    'Tijuana',
    'Unam Pumas',
    'Queretaro',
    'Atletico San Luis',
    'Monarcas Morelia',
    'Atlas',
    'Necaxa',
    'Chivas Guadalajara',
    'Santos Laguna',
    'Tigres UANL',
    'Monterrey'
  ];
  const eLiga12tran = [
    '美洲足球',
    '帕丘卡',
    '華瑞茲',
    '普埃布拉',
    '萊昂',
    '藍十字',
    '托盧卡',
    '蒂華納',
    '國立自治大學',
    '克雷塔羅',
    '聖路易斯競技',
    '莫雷利亞君主競技',
    '阿特拉斯',
    '內卡哈',
    '瓜達拉哈拉',
    '桑托斯拉古納',
    '堤格雷斯',
    '蒙特雷'
  ];

  const eFUFV12ori = [
    'Danubio',
    'CA Penarol',
    'Racing',
    'Defensor Sporting',
    'Montevideo Wanderers',
    'Villa Teresa',
    'Kenny Bell FC',
    'Montevideo City Torque',
    'Plaza Colonia',
    'CA River Plate',
    'Garracharrua 19',
    'Progreso',
    'Cronos',
    'Nacional De',
    'Potencia',
    'Albion',
    'Miramar Misiones',
    'Huracan Buceo',
    'Piedras Blancas',
    'La Legion FC',
    'Boston River',
    'Sud America',
    'Los Tablones',
    'Rampla Juniors',
    'El ABC Del Fut',
    'Artigas',
    'Deportivo Maldonado',
    'Juventud De Las Piedras',
    'Cerro Largo',
    'Toli FC',
    'Ocean Kush',
    'Palermo SD',
    'Atenas',
    'Lobos FC',
    'Cerrito',
    'Alto Peru',
    'Juventud',
    'Rocha',
    'Oriental',
    'Pecky Boys FC',
    'Basanez',
    'Villa ESP',
    'CA Taiwan',
    'Nuevo Ellauri',
    'Rosin FC',
    'La Luz',
    'La Favela',
    'Hacha Y Tiza FC',
    'Sportivo Rustico',
    'IASA'
  ];
  const eFUFV12tran = [
    '達奴比奧',
    '佩納羅爾',
    '盧森堡競賽',
    '防衛者體育',
    '蒙得維的亞流浪者',
    '維拉特雷莎',
    '肯尼貝爾',
    '蒙德維的亞城市扭矩',
    '佩萊紮',
    '河床競技',
    '查魯亞利爪',
    '馬德里競技雷索',
    '克羅諾斯',
    '蒙特維多國民',
    '波天西亞',
    '布萊頓',
    '美麗華米西奧內斯',
    '颶風',
    '彼德拉斯布蘭卡斯',
    '西班牙軍團',
    '波士頓河',
    '南亞美利加',
    '洛斯塔博洛尼斯',
    '蘭普拉青年',
    'ABC那托',
    '阿蒂加斯',
    '馬爾多納多',
    '拉斯彼得拉斯青年',
    '塞羅拉爾戈',
    '托利',
    '海洋庫什',
    '巴勒莫',
    '雅典',
    '羅伯士',
    '艾爾賽里托',
    '上祕魯',
    '尤文圖斯',
    '羅恰',
    '東方',
    '佩奇男孩',
    '巴薩內斯',
    'ESP別墅',
    '台灣競技',
    '新埃勞裡',
    '羅辛',
    '魯茲',
    '法米拉',
    '哈查蒂札',
    '魯斯蒂科',
    'IASA'
  ];
  const ePro12ori = [
    'Pele Warriors (PWR)',
    'Shemyakin Onze (PSG)',
    'Kazan (RUB)',
    'Tundra (TES)',
    'Team Ruspro (R11)',
    'Catalonia FC (CFC)',
    'Nyancat FC (NFC)',
    'Vega Squadron (VEG)',
    'Royal Bears (RLB)',
    'Ez1d (EZ1)',
    'Kabush (KAB)',
    'Forze (FRZ)',
    'FC Dimonchello (DNK)',
    'Gambit (GMB)',
    'Inactivetv (INA)',
    'WestCoastUNT (WCU)',
    'Papa Krych (ROB)'
  ];
  const ePro12tran = [
    '佩萊戰士 (PWR)',
    '舍米亞金歐茲 (PSG)',
    '喀山 (RUB)',
    '通達拉 (TES)',
    '魯斯普羅 (R11)',
    '加泰羅尼亞 (CFC)',
    '彩虹貓 (NFC)',
    '維加中隊 (VEG)',
    '皇家熊 (RLB)',
    'EZ1D (EZ1)',
    '卡布什 (KAB)',
    '佛斯 (FRZ)',
    '迪蒙切洛 (DNK)',
    '甘比特 (GMB)',
    '閒置電視 (INA)',
    '西海岸 (WCU)',
    '帕怕克里奇 (ROB)'
  ];
  const ePlayer12ori = [
    'Klinger (R10)',
    'Felipe I5I (SPQR)',
    'Ajax Tore (Ajax)',
    'Felipe Abd (Bundled)',
    'Young (SPQR)',
    'MarcosAB3 (SPQR)',
    'Gabrielpn (R10)',
    'Paulo Neto (Atlanta)',
    'xPHzin (R10)',
    'Resende (Ellevens)',
    'MatheusTan (SPQR)',
    'SLB Zezinho (Benfica)',
    'C4MST3R (MGCF)',
    'Hergesel (RDT)',
    'Robert (SPQR)',
    'Allan Castello (Lima)',
    'Abrucio (R10)',
    'SagraVitor_ ',
    'Dijian (STRM)',
    'STRM Solo (G10)',
    'LucasTabata',
    'MLobaoJr (NSE)',
    'MLongaray7 (Club Brugge)',
    'Felipe (MGCF)',
    'Fifenzo',
    'Brenner (Bundled)',
    'Barrinha97 (R10)',
    'Rafia13 (NSE)',
    'Vini (NSE)',
    'Vpzao',
    'EbinhoB (Wolves)',
    'Janoz (INF)',
    'Digo Araujo (NSE)',
    'Lucasrep98 (NSE)',
    'Patrick',
    'Tike (NSE)',
    'Wendell Lira (SCP)',
    'Guigonzc (Cruzeiro)',
    'Klaiver (FDA)',
    'goEBSoAlvess (EBS)',
    'Spiderkong (Roma)',
    'Derek (MGCF)',
    'Rodrigo12L (NSE)',
    'Tore (Ajax)',
    'Chocooz',
    'Senna (CEC)',
    'Vecchia',
    'AgussGM (SPQR)',
    'AguusGM',
    'Chocooz (SPQR)'
  ];
  const ePlayer12tran = [
    '克林格 (R10)',
    '菲利普 I5I (SPQR)',
    '阿賈克斯·托 (Ajax)',
    '菲利普 Abd (Bundled)',
    '年輕人 (SPQR)',
    'MarcosAB3 (SPQR)',
    '加布里埃爾普 (R10)',
    '保羅·內托 (Atlanta)',
    'xPHzin (R10)',
    '雷森德 (Ellevens)',
    '馬修斯坦 (SPQR)',
    'SLB 澤齊尼奧 (Benfica)',
    'C4MST3R (MGCF)',
    '黑格塞爾 (RDT)',
    '羅伯特 (SPQR)',
    '艾倫·卡斯特洛 (Lima)',
    '阿布魯西奧 (R10)',
    '薩格拉·維特',
    'Dijian (STRM)',
    'STRM Solo (G10)',
    '盧卡斯·塔巴塔',
    'MLobaoJr (NSE)',
    'MLongaray7 (Club Brugge)',
    '費利佩 (MGCF)',
    '菲芬佐',
    '布倫納 (Bundled)',
    'Barrinha97 (R10)',
    'Rafia13 (NSE)',
    '維尼 (NSE)',
    'Vpzao',
    'EbinhoB (Wolves)',
    '亞諾茲 (INF)',
    '迪戈·阿勞霍 (NSE)',
    'Lucasrep98 (NSE)',
    '帕特里克',
    '泰克 (NSE)',
    '溫德爾·里拉 (SCP)',
    '吉貢茲 (Cruzeiro)',
    '克萊弗 (FDA)',
    'goEBSoAlvess (EBS)',
    '蜘蛛港 (Roma)',
    '德里克 (MGCF)',
    'Rodrigo12L (NSE)',
    '托爾 (Ajax)',
    '賈古斯',
    '吸納 (CEC)',
    '韋基亞',
    'AgussGM (SPQR)',
    'AguusGM',
    '賈古斯 (SPQR)'
  ];
  let ori = [];
  let tran = [];
  switch (leagueID) {
    case 22614: {
      ori = eSB8ori;
      tran = eSB8tran;
      break;
    }
    case 22808: {
      ori = eLiga12ori;
      tran = eLiga12tran;
      break;
    }
    case 22764: {
      ori = eFUFV12ori;
      tran = eFUFV12tran;
      break;
    }
    case 22537: {
      ori = ePro12ori;
      tran = ePro12tran;
      break;
    }
    case 22724: {
      ori = ePlayer12ori;
      tran = ePlayer12tran;
      break;
    }
    default: {
      // 未來的例外處理
      break;
    }
  }

  for (let i = 0; i < ori.length; i++) {
    team = team.replace(ori[i], tran[i]);
  }

  return team;
}
