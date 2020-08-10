/*
getTopics
createTopic
editArticle
user/favoriteGodModel

-- db --

user__favoritegod
topic__article
*/
function getLeague(not_ajv = false) {
  const leagues = {
    棒球: {
      MLB: ['MLB', 'MLB'],
      CPBL: ['中華職棒', '中職'],
      KBO: ['韓國職棒', '韓棒'],
      NPB: ['日本職棒', '日棒'],
      ABL: ['澳洲職棒', '澳棒'],
      LMB: ['墨西哥職棒', '墨棒']
    },
    籃球: {
      NBA: ['NBA', 'NBA'],
      SBL: ['SBL', 'SBL'],
      WNBA: ['WNBA', 'WNBA'],
      NBL: ['澳洲職籃', '澳籃'],
      KBL: ['韓國職籃', '韓籃'],
      CBA: ['中國職籃', '中籃'],
      JBL: ['日本職籃', '日籃']
    },
    冰球: {
      NHL: ['NHL冰球', 'NHL']
    },
    其他: {
      Soccer: ['足球', '']
    },
    運動電競: {
      eSoccer: ['電競足球', '']
    }
    // 遊戲電競: { //eGame
    //   '': 'LOL',
    //   '': 'CS:GO',
    //   '': '王者榮耀'
    // }
  };

  if (!not_ajv) {
    return ['MLB', 'CPBL', 'KBO', 'NPB', 'ABL', 'LMB', 'NBA', 'SBL', 'WNBA', 'NBL', 'KBL', 'CBA', 'JBL', 'NHL', 'Soccer', 'eSoccer'];
    // return acceptLeague;
  } else {
    return leagues;
  }
}
function getCategory(not_ajv = false) {
  const category = {
    // 1: '公告',
    2: '其他',
    3: '賽事分析',
    4: '球隊討論',
    5: '投注分享'
  };
  if (!not_ajv) {
    return Object.keys(category).map(i => Number(i));
  } else {
    return category;
  }
}
module.exports = { getLeague, getCategory };
