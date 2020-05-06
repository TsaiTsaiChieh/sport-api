const modules = require('../util/modules');
const db = require('../util/dbUtil');
const MatchLeague = db.League;
const MatchTeam = db.Team;
inserttest();

async function inserttest() {
  try {
    const data = {
      league_id: '349',
      radar_id: '2541',
      sport_id: 16,
      name: 'KBO',
      ori_name: 'KBO',
      name_ch: '韓國職棒',
      ori_league_id: '349',
      ori_sport_id: '16'
    };
    await MatchLeague.upsert(data);
    const datateam = [
      {
        team_id: '2408',
        league_id: '349',
        sport_id: '16',
        radar_id: '249971',
        name: 'Lotte Giants',
        name_ch: '樂天巨人隊',
        image_id: '249971',
        alias: 'GIA',
        alias_ch: '樂天巨人隊'
      },
      {
        team_id: '3356',
        league_id: '349',
        sport_id: '16',
        radar_id: '249977',
        name: 'Samsung Lions',
        name_ch: '三星獅隊',
        image_id: '249977',
        alias: 'LIO',
        alias_ch: '三星獅隊'
      },
      {
        team_id: '4202',
        league_id: '349',
        sport_id: '16',
        radar_id: '249965',
        name: 'Kia Tigers',
        name_ch: '起亞虎隊',
        image_id: '249965',
        alias: 'TIG',
        alias_ch: '起亞虎隊'
      },
      {
        team_id: '2406',
        league_id: '349',
        sport_id: '16',
        radar_id: '249961',
        name: 'Doosan Bears',
        name_ch: '斗山熊隊',
        image_id: '249961',
        alias: 'BEA',
        alias_ch: '斗山熊隊'
      },
      {
        team_id: '2405',
        league_id: '349',
        sport_id: '16',
        radar_id: '249963',
        name: 'Hanwha Eagles',
        name_ch: '韓華鷹隊',
        image_id: '249963',
        alias: 'EAG',
        alias_ch: '韓華鷹隊'
      },
      {
        team_id: '8043',
        league_id: '349',
        sport_id: '16',
        radar_id: '249979',
        name: 'SK Wyverns',
        name_ch: 'SK飛龍隊',
        image_id: '249979',
        alias: 'WYV',
        alias_ch: 'SK飛龍隊'
      },
      {
        team_id: '2407',
        league_id: '349',
        sport_id: '16',
        radar_id: '249969',
        name: 'LG Twins',
        name_ch: 'LG雙子隊',
        image_id: '249969',
        alias: 'TWI',
        alias_ch: 'LG雙子隊'
      },
      {
        team_id: '269103',
        league_id: '349',
        sport_id: '16',
        radar_id: '249975',
        name: 'Kiwoom Heroes',
        name_ch: 'Kiwoom英雄隊',
        image_id: '249975',
        alias: 'KIH',
        alias_ch: 'Kiwoom英雄隊'
      },
      {
        team_id: '3353',
        league_id: '349',
        sport_id: '16',
        radar_id: '249973',
        name: 'NC Dinos',
        name_ch: 'NC恐龍隊',
        image_id: '249973',
        alias: 'DIN',
        alias_ch: 'NC恐龍隊'
      },
      {
        team_id: '3354',
        league_id: '349',
        sport_id: '16',
        radar_id: '249967',
        name: 'KT Wiz',
        name_ch: 'KT巫師隊',
        image_id: '249967',
        alias: 'WIZ',
        alias_ch: 'KT巫師隊'
      }
    ];

    for (let i = 0; i < datateam.length; i++) {
      await MatchTeam.upsert(datateam[i]);
    }

    console.log('ok');
  } catch (err) {
    console.log(err);
  }
}
