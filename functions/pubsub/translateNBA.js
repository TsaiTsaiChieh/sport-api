const modules = require('../util/modules');
const string =
  'Pistons lineup change (Sekou Doumbouya, Derrick Rose, Svi Mykhailiuk, Thon Maker, Tony Snell)';
translateNBA(string);
//從summary來後，簡體to繁體
// const temp = modules.simple2Tradition.translate(string);

async function translateNBA(stringOrigin) {
  let keyword1 = [
    'Sekou Doumbouya',
    'Derrick Rose',
    'Svi Mykhailiuk',
    'Thon Maker',
    'Tony Snell'
  ];
  let keywordTrans1 = [
    '杜姆布亚，塞古',
    '德里克 罗斯',
    '斯维亚托斯拉夫 米凯卢克',
    '索恩 马克',
    '托尼 斯内尔'
  ];
  for (let i = 0; i < keywordTrans1.length; i++) {
    keywordTrans1[i] = modules.simple2Tradition.translate(keywordTrans1[i]);
  }

  let keyword2 = [
    'lineup change',
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
    '(',
    ')'
  ];
  let keywordTrans2 = [
    '球員：',
    '巫師',
    '黃蜂',
    '老鷹',
    '熱火',
    '魔術',
    '尼克',
    '76人',
    '籃網',
    '塞爾蒂克',
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
    '( ',
    ' ) '
  ];

  let keyword3 = [];
  let keywordTrans3 = [];
  let keyword4 = [];
  let keywordTrans4 = [];
  let keyword5 = [];
  let keywordTrans5 = [];
  let keywordIndex1 = [];
  let keywordIndex2 = [];
  let keywordIndex3 = [];
  let keywordIndex4 = [];
  let keywordIndex5 = [];
  let slideIndex1 = [];
  let slideIndex2 = [];
  let slideIndex3 = [];
  let slideIndex4 = [];
  let slideIndex5 = [];
  let finalString1 = '';
  let finalString2 = '';
  let finalString3 = '';
  let finalString4 = '';
  let finalString5 = '';
  let finalString = [];
  finalString[0] = stringOrigin;
  for (let step = 1; step < 5; step++) {
    finalString[step] = '';

    for (let i = 0; i < eval('keyword' + step).length; i++) {
      if (finalString[step - 1].indexOf(eval('keyword' + step)[i]) >= 0) {
        eval('keywordIndex' + step).push(i);
        eval('slideIndex' + step).push(
          finalString[step - 1].indexOf(eval('keyword' + step)[i])
        );
      }
    }
    for (let i = 0; i < eval('slideIndex' + step).length; i++) {
      if (eval('slideIndex' + step)[i] > eval('slideIndex' + step)[i + 1]) {
        let temp = eval('keywordIndex' + step)[i];
        eval('keywordIndex' + step)[i] = eval('keywordIndex' + step)[i + 1];
        eval('keywordIndex' + step)[i + 1] = temp;
        temp = eval('slideIndex' + step)[i];
        eval('slideIndex' + step)[i] = eval('slideIndex' + step)[i + 1];
        eval('slideIndex' + step)[i + 1] = temp;
      }
    }

    let startIndex = 0;

    for (let i = 0; i < eval('slideIndex' + step).length; i++) {
      finalString[step] =
        finalString[step] +
        finalString[step - 1].substring(
          startIndex,
          eval('slideIndex' + step)[i]
        ) +
        eval('keywordTrans' + step)[eval('keywordIndex' + step)[i]];
      startIndex =
        eval('slideIndex' + step)[i] +
        eval('keyword' + step)[eval('keywordIndex' + step)[i]].length;
    }

    finalString[step] =
      finalString[step] +
      finalString[step - 1].substring(startIndex, finalString[step - 1].length);
  }
  finalString[4] = finalString[4].substring(0, finalString[4].length - 1);
  console.log(finalString[4]);

  //   stepTrans(finalString[4]);
}
async function transFunction(stringTrans) {
  let stringAfterTrans = await modules.translate(stringTrans, {
    from: 'en',
    to: 'zh-tw'
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
    'Z'
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
    'z'
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
