const modules = require('../util/modules');
// const axios = require('axios');

async function translateNBA(
  stringOrigin,
  keywordHomeOrigin,
  keywordAwayOrigin,
  transSimpleHomeOrigin,
  transSimpleAwayOrigin
  // transCompleteHomeOrigin,
  // transCompleteAwayOrigin
) {
  let finalString = stringOrigin;
  const keywordHome = keywordHomeOrigin;
  const keywordAway = keywordAwayOrigin;
  const transSimpleHome = transSimpleHomeOrigin;
  const transSimpleAway = transSimpleAwayOrigin;
  // let transCompleteHome = transCompleteHomeOrigin;
  // let transCompleteAway = transCompleteAwayOrigin;
  let keyword = keywordHome.concat(keywordAway);
  // let keywordTrans = transCompleteHome.concat(transCompleteAway);
  const keywordTransSimple = transSimpleHome.concat(transSimpleAway);
  // pbp : Sekou Doumbouya(#45) 兩分球進

  for (let i = 0; i < keyword.length; i++) {
    finalString = await finalString.replace(
      new RegExp(keyword[i], 'g'),
      keywordTransSimple[i]
    );
  }
  keyword = [
    'Wizards',
    'Hornets',
    'Hawks',
    'Heat',
    'Magic',
    'Knicks',
    '76ers',
    'Nets',
    'Celtics',
    'Raptors',
    'Bulls',
    'Cavaliers',
    'Pacers',
    'Pistons',
    'Bucks',
    'Timberwolves',
    'Jazz',
    'Thunder',
    'Trail Blazers',
    'Nuggets',
    'Grizzlies',
    'Rockets',
    'Pelicans',
    'Spurs',
    'Mavericks',
    'Warriors',
    'Lakers',
    'Clippers',
    'Suns',
    'Kings',
    'End of 1st Quarter.',
    'End of 2nd Quarter.',
    'End of 3rd Quarter.',
    'End of 4th Quarter.',
    'End of 1st Half.',
    'End of 2nd Half.',
    '\'s',
    'second timeout',
    'lineup change',
    'vs.',
    'gains possession',
    'Defensive three second',
    ' assists',
    ' steals',
    ' blocks',
    ' technical',
    ' shooting',
    ' personal',
    ' draws the foul',
    ' foul',
    ' turnover',
    ' bad pass',
    ' lost ball',
    ' fadeaway',
    ' floating',
    ' step back',
    ' turnaround',
    ' hook shot',
    ' jump shot',
    ' reverse',
    ' putback',
    ' driving',
    ' alley-oop',
    ' layup',
    ' putback',
    ' dunk',
    ' makes',
    ' misses',
    ' two point',
    ' three point',
    ' regular free throw',
    ' technical free throw',
    ' free throw',
    ' 1 of 1',
    ' 1 of 2',
    ' 2 of 2',
    ' defensive rebound',
    ' offensive rebound',
    'Stoppage',
    'out of bounds step',
    'Out of bounds',
    'Instant replay',
    'Request: Ruling Upheld'
  ];
  const keywordTrans = [
    '巫師',
    '黃蜂',
    '老鷹',
    '熱火',
    '魔術',
    '尼克',
    '76人',
    '籃網',
    '塞爾提克',
    '暴龍',
    '公牛',
    '騎士',
    '溜馬',
    '活塞',
    '公鹿',
    '灰狼',
    '爵士',
    '雷霆',
    '拓荒者',
    '金塊',
    '灰熊',
    '火箭',
    '鵜鶘',
    '馬刺',
    '獨行俠',
    '勇士',
    '湖人',
    '快艇',
    '太陽',
    '國王',
    '第一節結束',
    '第二節結束',
    '第三節結束',
    '第四節結束',
    '上半場結束',
    '下半場結束',
    '的',
    '秒暫停',
    '球員：',
    '跳球對上',
    '得到球權',
    '防守三秒',
    '助攻',
    '抄截',
    '獲得阻攻(蓋了',
    '技術',
    '射籃',
    '個人',
    '製造犯規',
    '犯規',
    '失誤',
    '傳球失誤',
    '掉球',
    '後仰',
    '急停',
    '後撤步',
    '轉身',
    '勾射',
    '跳投',
    '反身',
    '補',
    '切入',
    '空中接力',
    '上籃',
    '補',
    '灌籃',
    '投進',
    '沒投進',
    '兩分',
    '三分',
    '罰球',
    '罰球',
    '罰球',
    '1-1',
    '1-2',
    '2-2',
    '取得防守籃板',
    '取得進攻籃板',
    '暫停',
    '出界',
    '出界',
    '即時重播',
    '請求：維持裁決'
  ];

  for (let i = 0; i < keyword.length; i++) {
    finalString = await finalString.replace(
      new RegExp(keyword[i], 'g'),
      keywordTrans[i]
    );
  }
  // finalString = finalString.replace(new RegExp(' ', 'g'), '');

  return finalString;
}
async function transFunction(stringTrans) {
  const stringAfterTrans = await modules.translate(stringTrans, {
    from: 'en',
    to: 'zh-tw'
  });
  return await stringAfterTrans.text;
}
// eslint-disable-next-line no-unused-vars
async function stepTrans(stringTrans) {
  const eleBig = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z'
  ];
  const eleSmall = [
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z'
  ];
  const matcharray = [];

  stringTrans = stringTrans.replace(' . ', ' ');
  for (let i = 0; i < eleSmall.length; i++) {
    stringTrans = stringTrans.replace(`${eleSmall[i]}.`, `${eleSmall[i]}`);
  }
  for (let i = 0; i < eleSmall.length; i++) {
    stringTrans = stringTrans.replace(`${eleSmall[i]},`, `${eleSmall[i]} ,`);
  }
  const match = stringTrans.split(' ');

  let flag = 1;
  for (let j = 0; j < match.length; j++) {
    flag = 1;
    for (let i = 0; i < eleBig.length; i++) {
      if (match[j].indexOf(eleBig[i]) >= 0 && flag === 1) {
        flag = 0;
        matcharray.push(j);
      }
    }
  }

  const matcharray2 = [];
  let matchNumber = 0;
  const matchCount = [];
  for (let i = 0; i < matcharray.length; i++) {
    if (matcharray[i] + 1 === matcharray[i + 1]) {
      matcharray2[matchNumber] =
        match[matcharray[i]] + ' ' + match[matcharray[i + 1]];
      matchCount[matchNumber] = i;
      matchNumber = matchNumber + 1;
    }
  }

  const matchMap = [];
  for (let q = 0; q < matchCount.length; q++) {
    matchMap.push(await transFunction(matcharray2[q]));
  }

  let final = '';
  let matchNumber2 = 0;

  for (let x = 0; x < match.length; x++) {
    if (matcharray.indexOf(x) >= 0) {
      final = final + matchMap[matchNumber2];
      matchNumber2 = matchNumber2 + 1;
      x = x + 1;
    } else {
      final = final + match[x];
    }
  }

  console.log(final);
}
module.exports = { translateNBA };
