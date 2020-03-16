// let testString = 'Andrew Benintendi called out on strikes.';
// let testString = 'Rafael Devers pops out to shallow infield to Gleyber Torres.';
// let testString = 'DJ LeMahieu singles to shallow center field.';
// let testString =
//   'Brett Gardner grounds out to shallow infield, José Peraza to Michael Chavis. DJ LeMahieu to third.';
// let testString =
//   'Luke Voit singles to shallow right field. Gary Sánchez to second.';
// let testString =
//   'Mike Tauchman out on a sacrifice fly to center field to Tzu-Wei Lin. Gary Sánchez scores.';
// let testString =
//   'Gio Urshela walks. Miguel Andújar to second. Luke Voit to third.';
// let testString = 'Hunter Haworth (P) replaces Martín Pérez (P).';
// let testString = 'José Peraza strikes out swinging.';
// let testString = 'Cole Sturgeon pinch-hitting for Tzu-Wei Lin.';
// let testString = 'Cole Sturgeon remains in the game as CF.';
// let testString = 'Gleyber Torres pops out to second base to José Peraza.';
// let testString = 'Luke Voit lines out to shallow infield to C.J. Chatham.';
// let testString =
//   'C.J. Chatham grounds out to shallow infield, Gleyber Torres to Luke Voit.';
// let testString =
//   'John Andreoli reaches on error. Throwing error by Gio Urshela.';
// let testString =
//   'John Andreoli reaches on error. Throwing error by Gio Urshela.';
// let testString = 'Gio Urshela homers to center field.';
// let testString = 'Gleyber Torres doubles to deep left center field.';
// let testString =
//   'Luke Voit flies out to shallow center field to Cole Sturgeon.';
// let testString = 'C.J. Chatham out at second.';
// let testString = 'Jett Bandy (C) replaces Jonathan Lucroy (C), batting 4th.';
// let testString = 'Trey Amburgey pinch-running for Clint Frazier.';
// let testString = 'Evan White steals second.';
// let testString = 'Jarred Kelenic switches from LF to RF.';
// let testString =
//   'Andrés Blanco flies out to left center field to Collin Cowgill.';
// let testString = 'David Fry hit by pitch.';
let testString = 'Luis Castro homers to center field.';
//keyword = 依最嚴格條件開始替換
let keyword1 = [
  // 觸身
  'hit by pitch',
  //交換位置
  'switches from',
  //野手選擇
  `reaches on a fielder's choice to shallow infield`,
  `reaches on a fielder's choice to shallow center field`,
  `reaches on a fielder's choice to shallow right field`,
  `reaches on a fielder's choice to shallow left field`,
  `reaches on a fielder's choice to deep center field`,
  `reaches on a fielder's choice to deep right field`,
  `reaches on a fielder's choice to deep right center field`,
  `reaches on a fielder's choice to deep left field`,
  `reaches on a fielder's choice to deep left center field`,
  //失誤
  'reaches on error',
  'Throwing error by',
  //三振
  'called out on strikes',
  'strikes out swinging',
  'strikes out on a foul tip',
  //全壘打
  'homers to center field',
  'homers to right field',
  'homers to left field.',
  //在壘包上出局
  'out at first',
  'out at second',
  'out at third',
  //飛向壘包的出局
  'pops out to first base to',
  'pops out to second base to',
  'pops out to third base to',
  'grounds out to first base to',
  'grounds out to second base to',
  'grounds out to third base to',
  'lines out to first base to',
  'lines out to second base to',
  'lines out to third base to',
  //內野出局
  'pops out to shallow infield to',
  'grounds out to shallow infield to',
  'lines out to shallow infield to',
  //外野出局
  'grounds out to shallow center field to',
  'grounds out to shallow right field to',
  'grounds out to shallow left field to',
  'grounds out to center field to',
  'grounds out to right field to',
  'grounds out to right center field to',
  'grounds out to left field to',
  'grounds out to left center field to',
  'lines out to shallow center field to',
  'lines out to shallow right field to',
  'lines out to shallow left field to',
  'lines out to center field to',
  'lines out to right field to',
  'lines out to right center field to',
  'lines out to left field to',
  'lines out to left center field to',
  'flies out to shallow center field to',
  'flies out to shallow right field to',
  'flies out to shallow left field to',
  'flies out to center field to',
  'flies out to right field to',
  'flies out to right center field to',
  'flies out to left field to',
  'flies out to left center field to',
  'steals first',
  'steals second',
  'steals third',
  'singles to shallow center field',
  'singles to shallow right field',
  'singles to shallow left field',
  'singles to center field',
  'singles to right field',
  'singles to left field',
  'singles to deep center field',
  'singles to deep right field',
  'singles to deep right center field',
  'singles to deep left field',
  'singles to deep left center field',
  'doubles to shallow center field',
  'doubles to shallow right field',
  'doubles to shallow left field',
  'doubles to center field',
  'doubles to right field',
  'doubles to left field',
  'doubles to deep center field',
  'doubles to deep right field',
  'doubles to deep right center field.',
  'doubles to deep left field',
  'doubles to deep left center field.',
  'triples to shallow center field',
  'triples to shallow right field',
  'triples to shallow left field',
  'triples to center field',
  'triples to right field',
  'triples to left field',
  'triples to deep center field',
  'triples to deep right field',
  'triples to deep right center field',
  'triples to deep left field',
  'triples to deep left center field',
  'out on a sacrifice fly to center field to',
  'out on a sacrifice fly to right field to',
  'out on a sacrifice fly to left field to',
  'scores',
  'walks',
  'replaces',
  'pinch-hitting for',
  'pinch-running for',
  'remains in the game',
  'as IF',
  'as 1B',
  'as 2B',
  'as 3B',
  'as SS',
  'as OF',
  'as LF',
  'as CF',
  'as RF',
  'as RP',
  'as SP',
  'as DH'
];

let keywordTrans1 = [
  '遭觸身保送',
  '由',
  '擊出內野安打獲得野手選擇',
  '擊出中外野安打獲得野手選擇',
  '擊出右外野安打獲得野手選擇',
  '擊出左外野安打獲得野手選擇',
  '擊出深遠中外野安打獲得野手選擇',
  '擊出深遠右外野安打獲得野手選擇',
  '擊出深遠中右外野間安打獲得野手選擇',
  '擊出深遠左外野安打獲得野手選擇',
  '擊出深遠左中外野間安打獲得野手選擇',
  '發生失誤',
  '丟球失誤(由',
  '被三振出局',
  '揮棒落空三振出局',
  '擊出擦棒被捕球三振出局',
  '擊出中間方向全壘打',
  '擊出右邊方向全壘打',
  '擊出左邊方向全壘打',
  '在一壘出局',
  '在二壘出局',
  '在三壘出局',
  '擊出往一壘高飛球被接殺（由',
  '擊出往二壘高飛球被接殺（由',
  '擊出往三壘高飛球被接殺（由',
  '擊出往一壘滾地球被刺殺（由',
  '擊出往二壘滾地球被刺殺（由',
  '擊出往三壘滾地球被刺殺（由',
  '擊出往一壘平飛球被接殺（由',
  '擊出往二壘平飛球被接殺（由',
  '擊出往三壘平飛球被接殺（由',
  '擊出內野高飛球被接殺（由',
  '擊出內野滾地球被刺殺（由',
  '擊出內野平飛球被接殺（由',
  '擊出中外野滾地球被接殺（由',
  '擊出右外野滾地球被接殺（由',
  '擊出左外野滾地球被接殺（由',
  '擊出中外野滾地球被接殺（由',
  '擊出右外野滾地球被接殺（由',
  '擊出中右外野間滾地球被接殺（由',
  '擊出左外野滾地球被接殺（由',
  '擊出中左外野間滾地球被接殺（由',
  '擊出中外野平飛球被接殺（由',
  '擊出右外野平飛球被接殺（由',
  '擊出左外野平飛球被接殺（由',
  '擊出中外野平飛球被接殺（由',
  '擊出右外野平飛球被接殺（由',
  '擊出中右外野間平飛球被接殺（由',
  '擊出左外野平飛球被接殺（由',
  '擊出中左外野間平飛球被接殺（由',
  '擊出中外野高飛球被接殺（由',
  '擊出右外野高飛球被接殺（由',
  '擊出左外野高飛球被接殺（由',
  '擊出中外野高飛球被接殺（由',
  '擊出右外野高飛球被接殺（由',
  '擊出中右外野間高飛球被接殺（由',
  '擊出左外野高飛球被接殺（由',
  '擊出中左外野間高飛球被接殺（由',
  '盜上一壘',
  '盜上二壘',
  '盜上三壘',
  '擊出中外野一壘安打',
  '擊出右外野一壘安打',
  '擊出左外野一壘安打',
  '擊出中外野一壘安打',
  '擊出右外野一壘安打',
  '擊出左外野一壘安打',
  '擊出深遠中外野一壘安打',
  '擊出深遠右外野一壘安打',
  '擊出深遠中右外野間一壘安打',
  '擊出深遠左外野一壘安打',
  '擊出深遠中左外野間一壘安打',
  '擊出中外野二壘安打',
  '擊出右外野二壘安打',
  '擊出左外野二壘安打',
  '擊出中外野二壘安打',
  '擊出右外野二壘安打',
  '擊出左外野二壘安打',
  '擊出深遠中外野二壘安打',
  '擊出深遠右外野二壘安打',
  '擊出深遠中右外野間二壘安打',
  '擊出深遠左外野二壘安打',
  '擊出深遠中左外野間二壘安打',
  '擊出中外野三壘安打',
  '擊出右外野三壘安打',
  '擊出左外野三壘安打',
  '擊出中外野三壘安打',
  '擊出右外野三壘安打',
  '擊出左外野三壘安打',
  '擊出深遠中外野三壘安打',
  '擊出深遠右外野三壘安打',
  '擊出深遠中右外野間三壘安打',
  '擊出深遠左外野三壘安打',
  '擊出深遠中左外野間三壘安打',
  '擊出中外野高飛犧牲打被接殺（由',
  '擊出右外野高飛犧牲打被接殺（由',
  '擊出左外野高飛犧牲打被接殺（由',
  '得分',
  '被保送',
  '替補',
  '取代打擊（替換',
  '取代跑壘（替換',
  '擔任',
  '內野手',
  '一壘手',
  '二壘手',
  '三壘手',
  '游擊手',
  '外野手',
  '左外野手',
  '中外野手',
  '右外野手',
  '後援投手',
  '先發投手',
  '指定打擊'
];
let keyword2 = [
  'pops out to shallow infield',
  'grounds out to shallow infield',
  'lines out to shallow infield',
  'flies out to shallow center field',
  'flies out to shallow right field',
  'flies out to shallow left field',
  'out on a sacrifice fly to center field',
  'out on a sacrifice fly to right field',
  'out on a sacrifice fly to left field',
  '(C)',
  '(IF)',
  '(1B)',
  '(2B)',
  '(3B)',
  '(SS)',
  '(OF)',
  '(LF)',
  '(CF)',
  '(P)',
  '(RF)',
  '(RP)',
  '(SP)',
  '(DH)',
  'as C',
  'as P'
];
let keywordTrans2 = [
  '擊出內野高飛球被接殺',
  '擊出內野滾地球被刺殺',
  '擊出內野平飛球被接殺',
  '擊出中外野高飛球被接殺',
  '擊出右外野高飛球被接殺',
  '擊出左外野高飛球被接殺',
  '擊出中外野高飛犧牲打被接殺',
  '擊出右外野高飛犧牲打被接殺',
  '擊出左外野高飛犧牲打被接殺',
  '（捕手）',
  '（內野手）',
  '（一壘手）',
  '（二壘手）',
  '（三壘手）',
  '（游擊手）',
  '（外野手）',
  '（左外野手）',
  '（中外野手）',
  '（投手）',
  '（右外野手）',
  '（後援投手）',
  '（先發投手）',
  '（指定打擊）',
  '捕手',
  '投手'
];
let keyword3 = [
  'to first',
  'to second',
  'to third',
  '(C)',
  '(IF)',
  '(1B)',
  '(2B)',
  '(3B)',
  '(SS)',
  '(OF)',
  '(LF)',
  '(CF)',
  '(P)',
  '(RF)',
  '(RP)',
  '(SP)',
  '(DH)',
  'pops out to',
  'grounds out to',
  'lines out to',
  'flies out to'
];
let keywordTrans3 = [
  '上一壘',
  '上二壘',
  '上三壘',
  '（捕手）',
  '（內野手）',
  '（一壘手）',
  '（二壘手）',
  '（三壘手）',
  '（游擊手）',
  '（外野手）',
  '（左外野手）',
  '（中外野手）',
  '（投手）',
  '（右外野手）',
  '（後援投手）',
  '（先發投手）',
  '（指定打擊）',
  '擊出高飛球被接殺（由',
  '擊出滾地球被刺殺（由',
  '擊出平飛球被接殺（由',
  '擊出高飛球被接殺（由'
];

let keyword4 = [
  ' to ',
  'batting 1st.',
  'batting 2nd.',
  'batting 3rd.',
  'batting 4th.',
  'batting 5th.',
  'batting 6th.',
  'batting 7th.',
  'batting 8th.',
  'batting 9th.',
  'singles',
  'doubles',
  'thirds',
  ' C ',
  ' IF ',
  ' 1B ',
  ' 2B ',
  ' 3B ',
  ' SS ',
  ' OF ',
  ' LF ',
  ' CF ',
  ' P ',
  ' RF ',
  ' RP ',
  ' SP ',
  ' DH ',
  ' C.',
  ' IF.',
  ' 1B.',
  ' 2B.',
  ' 3B.',
  ' SS.',
  ' OF.',
  ' LF.',
  ' CF.',
  ' P.',
  ' RF.',
  ' RP.',
  ' SP.',
  ' DH.'
];
let keywordTrans4 = [
  ' 到 ',
  '第一棒打擊',
  '第二棒打擊',
  '第三棒打擊',
  '第四棒打擊',
  '第五棒打擊',
  '第六棒打擊',
  '第七棒打擊',
  '第八棒打擊',
  '第九棒打擊',
  '一壘安打',
  '二壘安打',
  '三壘安打',
  ' 捕手 ',
  ' 內野手 ',
  ' 一壘手 ',
  ' 二壘手 ',
  ' 三壘手 ',
  ' 游擊手 ',
  ' 外野手 ',
  ' 左外野手 ',
  ' 中外野手 ',
  ' 投手 ',
  ' 右外野手 ',
  ' 後援投手 ',
  ' 先發投手 ',
  ' 指定打擊 ',
  ' 捕手.',
  ' 內野手.',
  ' 一壘手.',
  ' 二壘手.',
  ' 三壘手.',
  ' 游擊手.',
  ' 外野手.',
  ' 左外野手.',
  ' 中外野手.',
  ' 投手.',
  ' 右外野手.',
  ' 後援投手.',
  ' 先發投手.',
  ' 指定打擊.'
];

let keywordIndex1 = [];
let keywordIndex2 = [];
let keywordIndex3 = [];
let keywordIndex4 = [];

let slideIndex1 = [];
let slideIndex2 = [];
let slideIndex3 = [];
let slideIndex4 = [];

for (let i = 0; i < keyword1.length; i++) {
  if (testString.indexOf(keyword1[i]) >= 0) {
    keywordIndex1.push(i);
    slideIndex1.push(testString.indexOf(keyword1[i]));
  }
}
for (let i = 0; i < slideIndex1.length; i++) {
  if (slideIndex1[i] > slideIndex1[i + 1]) {
    let temp = keywordIndex1[i];
    keywordIndex1[i] = keywordIndex1[i + 1];
    keywordIndex1[i + 1] = temp;
    temp = slideIndex1[i];
    slideIndex1[i] = slideIndex1[i + 1];
    slideIndex1[i + 1] = temp;
  }
}
let finalString = '';
let startIndex = 0;

for (let i = 0; i < slideIndex1.length; i++) {
  finalString =
    finalString +
    testString.substring(startIndex, slideIndex1[i]) +
    keywordTrans1[keywordIndex1[i]];

  startIndex = slideIndex1[i] + keyword1[keywordIndex1[i]].length;
}

finalString = finalString + testString.substring(startIndex, testString.length);
// console.log(finalString);

// 第二階段翻譯;
startIndex = 0;
let finalString2 = '';
for (let i = 0; i < keyword2.length; i++) {
  if (finalString.indexOf(keyword2[i]) >= 0) {
    keywordIndex2.push(i);
    slideIndex2.push(finalString.indexOf(keyword2[i]));
  }
}
for (let i = 0; i < slideIndex2.length; i++) {
  if (slideIndex2[i] > slideIndex2[i + 1]) {
    let temp = keywordIndex2[i];
    keywordIndex2[i] = keywordIndex2[i + 1];
    keywordIndex2[i + 1] = temp;
    temp = slideIndex2[i];
    slideIndex2[i] = slideIndex2[i + 1];
    slideIndex2[i + 1] = temp;
  }
}
for (let i = 0; i < slideIndex2.length; i++) {
  finalString2 =
    finalString2 +
    finalString.substring(startIndex, slideIndex2[i]) +
    keywordTrans2[keywordIndex2[i]];

  startIndex = slideIndex2[i] + keyword2[keywordIndex2[i]].length;
}

finalString2 =
  finalString2 + finalString.substring(startIndex, finalString.length);
// console.log(finalString2);

startIndex = 0;
let finalString3 = '';
for (let i = 0; i < keyword3.length; i++) {
  if (finalString2.indexOf(keyword3[i]) >= 0) {
    keywordIndex3.push(i);
    slideIndex3.push(finalString2.indexOf(keyword3[i]));
  }
}
for (let i = 0; i < slideIndex3.length; i++) {
  if (slideIndex3[i] > slideIndex3[i + 1]) {
    let temp = keywordIndex3[i];
    keywordIndex3[i] = keywordIndex3[i + 1];
    keywordIndex3[i + 1] = temp;
    temp = slideIndex4[i];
    slideIndex3[i] = slideIndex3[i + 1];
    slideIndex3[i + 1] = temp;
  }
}
for (let i = 0; i < slideIndex3.length; i++) {
  finalString3 =
    finalString3 +
    finalString2.substring(startIndex, slideIndex3[i]) +
    keywordTrans3[keywordIndex3[i]];

  startIndex = slideIndex3[i] + keyword3[keywordIndex3[i]].length;
}
finalString3 =
  finalString3 + finalString2.substring(startIndex, finalString2.length);

startIndex = 0;
let finalString4 = '';
for (let i = 0; i < keyword4.length; i++) {
  if (finalString3.indexOf(keyword4[i]) >= 0) {
    keywordIndex4.push(i);
    slideIndex4.push(finalString3.indexOf(keyword4[i]));
  }
}

for (let i = 0; i < slideIndex4.length; i++) {
  if (slideIndex4[i] > slideIndex4[i + 1]) {
    let temp = keywordIndex4[i];
    keywordIndex4[i] = keywordIndex4[i + 1];
    keywordIndex4[i + 1] = temp;
    temp = slideIndex4[i];
    slideIndex4[i] = slideIndex4[i + 1];
    slideIndex4[i + 1] = temp;
  }
}

for (let i = 0; i < slideIndex4.length; i++) {
  finalString4 =
    finalString4 +
    finalString3.substring(startIndex, slideIndex4[i]) +
    keywordTrans4[keywordIndex4[i]];

  startIndex = slideIndex4[i] + keyword4[keywordIndex4[i]].length;
}
finalString4 =
  finalString4 + finalString3.substring(startIndex, finalString3.length);

console.log('transResult : ' + finalString4);
