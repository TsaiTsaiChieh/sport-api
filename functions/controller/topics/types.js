function getType(not_ajv = false) {
  const types = {
    棒球: [
      'MLB',
      '中華職棒',
      '韓國職棒',
      '日本職棒',
      '澳洲職棒',
      '墨西哥職棒'
    ],
    籃球: [
      'NBA',
      'SBL',
      'WNBA',
      '澳洲職籃',
      '韓國職籃',
      '中國職籃',
      '日本職籃'
    ],
    冰球: [
      'NHL冰球'
    ],
    其他: [
      '足球'
    ],
    運動電競: [
      '電競足球'
    ]
    // 遊戲電競: [
    //   'LOL',
    //   'CS:GO',
    //   '王者榮耀'
    // ]
  };

  if (!not_ajv) {
    const array = Object.values(types);
    let ajv = [];
    for (let i = 0; i < array.length; i++) {
      ajv = ajv.concat(array[i]);
    }
    return ajv;
  } else {
    return types;
  }
}
function getCategory() {
  return [
    '賽事分析',
    '球隊討論',
    '投注分享',
    // '公告',
    '其他'
  ];
}
module.exports = { getType, getCategory };
