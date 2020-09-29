const AppErrors = require('./AppErrors');
const MATCH_STATUS = { SCHEDULED: 2, INPLAY: 1, END: 0, ABNORMAL: -1, VALID: 1, POSTPONED: -2, CANCELLED: -3 };
const USER_SELL = { NORMAL: -1, GOD_FREE: 0, GOD_SELL: 1 };
const USER_STATUS = { NORMAL: 1, GOD: 2 };
// database name general setting
const db = {
  basketball_NBA: 'basketball_NBA',
  basketball_SBL: 'basketball_SBL',
  basketball_WNBA: 'basketball_WNBA',
  basketball_NBL: 'basketball_NBL',
  basketball_CBA: 'basketball_CBA',
  basketball_KBL: 'basketball_KBL',
  basketball_BJL: 'basketball_BJL',
  baseball_MLB: 'baseball_MLB',
  baseball_NPB: 'baseball_NPB',
  baseball_CPBL: 'baseball_CPBL',
  baseball_KBO: 'baseball_KBO',
  baseball_ABL: 'baseball_ABL',
  baseball_LMB: 'baseball_LMB',
  icehockey_NHL: 'icehockey_NHL',
  Soccer: 'Soccer',
  eSoccer: 'esport_eSoccer',
  eGame: 'eGame',
  prediction: 'prediction'
};

function league2Sport(league) {
  switch (league) {
    case 'MLB':
    case 'CPBL':
    case 'KBO':
    case 'NPB':
    case 'ABL':
    case 'LMB':
      return {
        sport: 'baseball',
        sport_id: 16
      };
    case 'NBA':
    case 'SBL':
    case 'WNBA':
    case 'NBL':
    case 'KBL':
    case 'CBA':
    case 'BJL':
      return {
        sport: 'basketball',
        sport_id: 18
      };
    case 'NHL':
      return {
        sport: 'icehockey',
        sport_id: 17
      };
    case 'Soccer':
      return {
        sport: 'soccer',
        sport_id: 1
      };
    case 'eSoccer':
      return {
        sport: 'esports',
        sport_id: 22
      };
    default:
      throw new AppErrors.UnknownLeague();
  }
}
function leagueCodebook(league) {
  switch (league) {
    case 'NBA':
      return {
        id: '2274',
        match: db.basketball_NBA,
        name_ch: '美國國家籃球協會',
        // predicts_perDay: 2  // regular season
        predicts_perDay: 1 // post season
      };
    case 'SBL':
      return {
        id: '8251',
        match: db.basketball_SBL,
        name_ch: '超級籃球聯賽',
        predicts_perDay: 0.5
      };
    case 'WNBA':
      return {
        id: '244',
        match: db.basketball_WNBA,
        name_ch: '美國國家女子籃球協會',
        predicts_perDay: 0.8
      };
    case 'NBL':
      return {
        id: '1714',
        match: db.basketball_NBL,
        name_ch: '澳洲職籃',
        predicts_perDay: 2 // regular season
        // predicts_perDay: 0.8 // post season
      };
    case 'CBA':
      return {
        id: '2319',
        match: db.basketball_CBA,
        name_ch: '中國職籃',
        predicts_perDay: 2 // regular season
        // predicts_perDay: 1 // post season
      };
    case 'KBL':
      return {
        id: '2148',
        match: db.basketball_KBL,
        name_ch: '韓國職籃',
        predicts_perDay: 0.8
      };
    case 'BJL':
      return {
        id: '1298',
        match: db.basketball_BJL,
        name_ch: '日本職籃',
        predicts_perDay: 2 // regular season
        // predicts_perDay: 0.8 // post season
      };
    case 'MLB':
      return {
        id: '3939',
        match: db.baseball_MLB,
        name_ch: '美國職棒大聯盟',
        // predicts_perDay: 2  // regular season
        predicts_perDay: 1 // post season
      };
    case 'NPB':
      return {
        id: '347',
        match: db.baseball_NPB,
        name_ch: '日本職棒',
        predicts_perDay: 2 // regular season
        // predicts_perDay: 1 // post season
      };
    case 'CPBL':
      return {
        id: '11235',
        match: db.baseball_CPBL,
        name_ch: '中華職棒',
        predicts_perDay: 0.8
      };
    case 'KBO':
      return {
        id: '349',
        match: db.baseball_KBO,
        name_ch: '韓國職棒',
        predicts_perDay: 0.8
      };
    case 'ABL':
      return {
        id: '2759',
        match: db.baseball_ABL,
        name_ch: '澳洲職棒',
        predicts_perDay: 1.2 // regular season
        // predicts_perDay: 0.8 // post season
      };
    case 'LMB':
      return {
        id: '4412',
        match: db.baseball_LMB,
        name_ch: '墨西哥職棒',
        predicts_perDay: 1.2 // regular season
        // predicts_perDay: 0.8 // post season
      };
    case 'NHL':
      return {
        id: '1926',
        match: db.icehockey_NHL,
        name_ch: '國家冰球聯盟',
        predicts_perDay: 2 // regular season
        // predicts_perDay: 1 // post season
      };
    case 'Soccer':
      return {
        id: '8',
        match: db.Soccer,
        name_ch: '足球',
        predicts_perDay: 2 // regular season
        // predicts_perDay: 1 // post season
      };
    case 'eSoccer':
      return {
        id: '22000',
        match: db.eSoccer,
        name_ch: '足球電競',
        predicts_perDay: 2
      };
    case 'eGame':
      return {
        id: '23000',
        match: db.eGame,
        name_ch: '電競遊戲',
        predicts_perDay: 2
      };
    default:
      throw new AppErrors.UnknownLeague();
  }
}

function leagueDecoder(leagueID) {
  leagueID = Number.parseInt(leagueID);
  switch (leagueID) {
    case 2274:
      return 'NBA';
    case 8251:
      return 'SBL';
    case 244:
      return 'WNBA';
    case 1714:
      return 'NBL';
    case 2319:
      return 'CBA';
    case 2148:
      return 'KBL';
    case 1298:
      return 'BJL';
    case 3939:
      return 'MLB';
    case 347:
      return 'NPB';
    case 11235:
      return 'CPBL';
    case 349:
      return 'KBO';
    case 2759:
      return 'ABL';
    case 4412:
      return 'LMB';
    case 1926:
      return 'NHL';
    case 8:
      return 'Soccer';
    case 22000:
      return 'eSoccer';
    case 23000:
      return 'eGame';
    default:
      throw new AppErrors.UnknownLeague();
  }
}

module.exports = {
  MATCH_STATUS,
  USER_SELL,
  USER_STATUS,
  league2Sport,
  leagueCodebook,
  leagueDecoder,
  db
};
