const modules = require('../util/modules');
const axios = require('axios');
const string = 'Trevor Ariza turnover (out of bounds step)';
translateNBA(string);
//從summary來後，簡體to繁體
// const temp = modules.simple2Tradition.translate(string);

async function translateNBA(stringOrigin) {
  let finalString;

  const nba_api_key = 'y7uxzm4stjju6dmkspnabaav';
  const gameID = '380142e6-95e7-423b-8ba9-4de32862fd06';
  const pbpURL = `http://api.sportradar.us/nba/trial/v7/en/games/${gameID}/pbp.json?api_key=${nba_api_key}`;
  let { data } = await axios(pbpURL);
  let x = 20 * 1;
  for (let xx = x; xx < x + 20; xx++) {
    // finalString = stringOrigin;
    finalString = data.periods[0].events[xx].description;
    let keyword = [
      'Sekou Doumbouya',
      'Derrick Rose',
      'Svi Mykhailiuk',
      'Thon Maker',
      'Tony Snell',
      'Hassan Whiteside',
      'Trevor Ariza',
      'CJ McCollum',
      'Carmelo Anthony',
      'Gary Trent Jr.'
    ];
    let keywordTrans = [
      '杜姆布亚，塞古',
      '德里克 罗斯',
      '斯维亚托斯拉夫 米凯卢克',
      '索恩 马克',
      '托尼 斯内尔',
      '哈桑 怀特赛德',
      '特雷沃 阿里扎',
      'C.J. 麦科勒姆',
      '卡梅罗 安东尼',
      '加里 小特伦特'
    ];

    for (let i = 0; i < keywordTrans.length; i++) {
      keywordTrans[i] = modules.simple2Tradition.translate(keywordTrans[i]);
      keywordTrans[i] = keywordTrans[i].replace(' ', '．');
      keywordTrans[i] = keywordTrans[i].replace('，', '．');
    }

    for (let i = 0; i < keyword.length; i++) {
      finalString = await finalString.replace(
        new RegExp(keyword[i], 'g'),
        keywordTrans[i]
      );
    }

    keyword = [
      'lineup change',
      'vs.',
      'gains possession',
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
      'assists',
      'steals',
      'turnover',
      'bad pass',
      'lost ball',
      'makes two point jump shot',
      'makes two point fadeaway jump shot',
      'makes two point floating jump shot',
      'makes two point reverse layup',
      'makes three point jump shot',
      'misses three point jump shot',
      'misses regular free throw',
      '1 of 1',
      '1 of 2',
      '2 of 2',
      'defensive rebound',
      'Stoppage',
      'out of bounds step',
      'Out of bounds',
      'personal foul',
      'shooting foul',
      'draws the foul',
      'Instant replay',
      'Request: Ruling Upheld'
    ];
    keywordTrans = [
      '球員：',
      '對陣',
      '得到球權',
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
      '助攻',
      '抄截',
      '失誤',
      '傳球失誤',
      '掉球',
      '跳投進兩分',
      '後仰跳投進兩分',
      '急停跳投進兩分',
      '反身上籃進兩分',
      '跳投進三分',
      '三分跳投沒中',
      '罰球沒中',
      '1-1',
      '1-2',
      '2-2',
      '防守籃板',
      '暫停',
      '出界',
      '出界',
      '個人犯規',
      '投籃犯規',
      '製造犯規',
      '即時重播',
      '請求：維持裁決'
    ];

    for (let i = 0; i < keyword.length; i++) {
      finalString = await finalString.replace(
        new RegExp(keyword[i], 'g'),
        keywordTrans[i]
      );
    }

    console.log(finalString);
  }
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
