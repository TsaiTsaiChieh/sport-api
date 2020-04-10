const modules = require('../util/modules');
const axios = require('axios');

async function translateNBA(
  stringOrigin,
  keywordHomeOrigin,
  keywordAwayOrigin,
  transSimpleHomeOrigin,
  transSimpleAwayOrigin,
  transCompleteHomeOrigin,
  transCompleteAwayOrigin
) {
  let finalString = stringOrigin;
  let keywordHome = keywordHomeOrigin;
  let keywordAway = keywordAwayOrigin;
  let transSimpleHome = transSimpleHomeOrigin;
  let transSimpleAway = transSimpleAwayOrigin;
  let transCompleteHome = transCompleteHomeOrigin;
  let transCompleteAway = transCompleteAwayOrigin;
  let keyword = keywordHome.concat(keywordAway);
  let keywordTrans = transCompleteHome.concat(transCompleteAway);
  let keywordTransSimple = transSimpleHome.concat(transSimpleAway);
  // let keyword = [
  //   'Sekou Doumbouya',
  //   'Derrick Rose',
  //   'Svi Mykhailiuk',
  //   'Thon Maker',
  //   'Tony Snell',
  //   'Hassan Whiteside',
  //   'Trevor Ariza',
  //   'CJ McCollum',
  //   'Carmelo Anthony',
  //   'Gary Trent Jr.',
  //   'Bruce Brown',
  //   'Langston Galloway',
  //   'Brandon Knight',
  //   'John Henson',
  //   'Christian Wood',
  //   'Anfernee Simons',
  //   'Nassir Little',
  //   'Wenyen Gabriel',
  //   'Mario Hezonja',
  // ];
  // let keywordTrans = [
  //   '[Pistons]杜姆布亚，塞古(Sekou Doumbouya#45)',
  //   '[Pistons]德里克 罗斯(Derrick Rose#25)',
  //   '[Pistons]斯维亚托斯拉夫 米凯卢克(Svi Mykhailiuk#19)',
  //   '[Pistons]索恩 马克(Thon Maker#7)',
  //   '[Pistons]托尼 斯内尔(Tony Snell#17)',
  //   '[Trail Blazers]哈桑 怀特赛德(Hassan Whiteside#21)',
  //   '[Trail Blazers]特雷沃 阿里扎(Trevor Ariza#8)',
  //   '[Trail Blazers]C.J. 麦科勒姆(CJ McCollum#3)',
  //   '[Trail Blazers]卡梅罗 安东尼(Carmelo Anthony#00)',
  //   '[Trail Blazers]加里 小特伦特(Gary Trent Jr.#2)',
  //   '布鲁斯 小布朗',
  //   '兰斯顿 加洛韦',
  //   '布兰登 奈特',
  //   '约翰 汉森',
  //   '克里斯蒂安 伍德',
  //   '安弗尼 西蒙斯',
  //   '利特尔，纳西尔',
  //   '韦尼恩 加布里艾尔',
  //   '[Trail Blazers]马里奥 赫佐尼亚(Mario Hezonja#44)',
  // ];
  // let keywordTransSimple = [
  //   '杜姆布亚，塞古(Sekou Doumbouya#45)',
  //   '德里克 罗斯(Derrick Rose#25)',
  //   '斯维亚托斯拉夫 米凯卢克(Svi Mykhailiuk#19)',
  //   '索恩 马克(Thon Maker#7)',
  //   '托尼 斯内尔(Tony Snell#17)',
  //   '哈桑 怀特赛德(Hassan Whiteside#21)',
  //   '特雷沃 阿里扎(Trevor Ariza#8)',
  //   'C.J. 麦科勒姆(CJ McCollum#3)',
  //   '卡梅罗 安东尼(Carmelo Anthony#00)',
  //   '加里 小特伦特(Gary Trent Jr.#2)',
  //   '布鲁斯 小布朗',
  //   '兰斯顿 加洛韦',
  //   '布兰登 奈特',
  //   '约翰 汉森',
  //   '克里斯蒂安 伍德',
  //   '安弗尼 西蒙斯',
  //   '利特尔，纳西尔',
  //   '韦尼恩 加布里艾尔',
  //   '马里奥 赫佐尼亚(Mario Hezonja#44)',
  // ];
  if (finalString.indexOf('lineup change') < 0) {
    for (let i = 0; i < keywordTrans.length; i++) {
      keywordTrans[i] = modules.simple2Tradition.translate(keywordTrans[i]);
      keywordTrans[i] = keywordTrans[i].replace('，', '．');
    }
    for (let i = 0; i < keyword.length; i++) {
      finalString = await finalString.replace(
        new RegExp(keyword[i], 'g'),
        keywordTrans[i]
      );
    }
  } else {
    for (let i = 0; i < keywordTransSimple.length; i++) {
      keywordTransSimple[i] = modules.simple2Tradition.translate(
        keywordTransSimple[i]
      );
      keywordTransSimple[i] = keywordTransSimple[i].replace('，', '．');
    }
    for (let i = 0; i < keyword.length; i++) {
      finalString = await finalString.replace(
        new RegExp(keyword[i], 'g'),
        keywordTransSimple[i]
      );
    }
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
    `'s`,
    'second timeout',
    'lineup change',
    'vs.',
    'gains possession',
    'Defensive three second',
    'assists',
    'steals',
    'blocks',
    'technical',
    'shooting',
    'personal',
    'draws the foul',
    'foul',
    'turnover',
    'bad pass',
    'lost ball',
    'fadeaway',
    'floating',
    'step back',
    'turnaround',
    'hook shot',
    'jump shot',
    'reverse',
    'putback',
    'driving',
    'alley-oop',
    'layup',
    'putback',
    'dunk',
    'makes',
    'misses',
    'two point',
    'three point',
    'regular free throw',
    'technical free throw',
    'free throw',
    '1 of 1',
    '1 of 2',
    '2 of 2',
    'defensive rebound',
    'offensive rebound',
    'Stoppage',
    'out of bounds step',
    'Out of bounds',
    'Instant replay',
    'Request: Ruling Upheld',
  ];
  keywordTrans = [
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
    '對陣',
    '得到球權',
    '防守三秒',
    '助攻',
    '抄截',
    '獲得阻攻（',
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
    '防守籃板',
    '進攻籃板',
    '暫停',
    '出界',
    '出界',
    '即時重播',
    '請求：維持裁決',
  ];

  for (let i = 0; i < keyword.length; i++) {
    finalString = await finalString.replace(
      new RegExp(keyword[i], 'g'),
      keywordTrans[i]
    );
  }
  // finalString = finalString.replace(new RegExp(' ', 'g'), '');
  console.log(finalString);

  //   finalString[0] = stringOrigin;
  //   for (let step = 1; step < 5; step++) {
  //     finalString[step] = '';

  //     for (let i = 0; i < eval('keyword' + step).length; i++) {
  //       if (finalString[step - 1].indexOf(eval('keyword' + step)[i]) >= 0) {
  //         eval('keywordIndex' + step).push(i);
  //         eval('slideIndex' + step).push(
  //           finalString[step - 1].indexOf(eval('keyword' + step)[i])
  //         );
  //       }
  //     }
  //     for (let i = 0; i < eval('slideIndex' + step).length; i++) {
  //       if (eval('slideIndex' + step)[i] > eval('slideIndex' + step)[i + 1]) {
  //         let temp = eval('keywordIndex' + step)[i];
  //         eval('keywordIndex' + step)[i] = eval('keywordIndex' + step)[i + 1];
  //         eval('keywordIndex' + step)[i + 1] = temp;
  //         temp = eval('slideIndex' + step)[i];
  //         eval('slideIndex' + step)[i] = eval('slideIndex' + step)[i + 1];
  //         eval('slideIndex' + step)[i + 1] = temp;
  //       }
  //     }

  //     let startIndex = 0;

  //     for (let i = 0; i < eval('slideIndex' + step).length; i++) {
  //       finalString[step] =
  //         finalString[step] +
  //         finalString[step - 1].substring(
  //           startIndex,
  //           eval('slideIndex' + step)[i]
  //         ) +
  //         eval('keywordTrans' + step)[eval('keywordIndex' + step)[i]];
  //       startIndex =
  //         eval('slideIndex' + step)[i] +
  //         eval('keyword' + step)[eval('keywordIndex' + step)[i]].length;
  //     }

  //     finalString[step] =
  //       finalString[step] +
  //       finalString[step - 1].substring(startIndex, finalString[step - 1].length);
  //   }
  //   finalString[4] = finalString[4].substring(0, finalString[4].length - 1);
  //   console.log(finalString[4]);

  //   stepTrans(finalString[4]);
}
async function transFunction(stringTrans) {
  let stringAfterTrans = await modules.translate(stringTrans, {
    from: 'en',
    to: 'zh-tw',
  });
  return await stringAfterTrans.text;
}
async function stepTrans(stringTrans) {
  let eleBig = [
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
    'Z',
  ];
  let eleSmall = [
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
    'z',
  ];
  let matcharray = [];

  stringTrans = stringTrans.replace(' . ', ' ');
  for (let i = 0; i < eleSmall.length; i++) {
    stringTrans = stringTrans.replace(`${eleSmall[i]}.`, `${eleSmall[i]}`);
  }
  for (let i = 0; i < eleSmall.length; i++) {
    stringTrans = stringTrans.replace(`${eleSmall[i]},`, `${eleSmall[i]} ,`);
  }
  let match = stringTrans.split(' ');

  let flag = 1;
  for (let j = 0; j < match.length; j++) {
    flag = 1;
    for (let i = 0; i < eleBig.length; i++) {
      if (match[j].indexOf(eleBig[i]) >= 0 && flag == 1) {
        flag = 0;
        matcharray.push(j);
      }
    }
  }

  let matcharray2 = [];
  let matchNumber = 0;
  let matchCount = [];
  for (let i = 0; i < matcharray.length; i++) {
    if (matcharray[i] + 1 === matcharray[i + 1]) {
      matcharray2[matchNumber] =
        match[matcharray[i]] + ' ' + match[matcharray[i + 1]];
      matchCount[matchNumber] = i;
      matchNumber = matchNumber + 1;
    }
  }

  let matchMap = [];
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
module.exports = translateNBA;
