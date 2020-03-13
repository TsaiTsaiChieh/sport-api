//let testString = 'Andrew Benintendi called out on strikes.';
// let testString = 'Rafael Devers pops out to shallow infield to Gleyber Torres.';
// let testString = 'DJ LeMahieu singles to shallow center field.';
let testString =
  'Brett Gardner grounds out to shallow infield, José Peraza to Michael Chavis. DJ LeMahieu to third.';

let keyword1 = [
  'called out on strikes',
  'pops out to shallow infield',
  'singles to shallow center field',
  'grounds out to shallow infield'
];
let keywordTrans1 = [
  '被三振',
  '擊出內野高飛球被接殺',
  '擊出中外野安打',
  '擊出內野滾地安打'
];
let keyword2 = ['to first', 'to second', 'to third'];
let keywordTrans2 = ['上一壘', '上二壘', '上三壘'];
let keyword3 = ['to'];
let keywordTrans3 = ['傳給'];
let keywordIndex1 = [];
let keywordIndex2 = [];
let keywordIndex3 = [];
let slideIndex1 = [];
let slideIndex2 = [];
let slideIndex3 = [];
for (let i = 0; i < keyword1.length; i++) {
  if (testString.indexOf(keyword1[i]) >= 0) {
    keywordIndex1.push(i);
    slideIndex1.push(testString.indexOf(keyword1[i]));
  }
}
// slideIndex1.push(testString.length);
let finalString = '';
let startIndex1 = 0;
for (let i = 0; i < slideIndex1.length; i++) {
  finalString =
    finalString +
    testString.substring(startIndex1, slideIndex1[i]) +
    keywordTrans1[keywordIndex1[i]];

  startIndex1 = slideIndex1[i] + 1 + keyword1[keywordIndex1[i]].length;
}
finalString =
  finalString + testString.substring(startIndex1, testString.length);
for (let i = 0; i < keyword2.length; i++) {
  if (testString.indexOf(keyword2[i]) >= 0) {
    keywordIndex2.push(i);
    slideIndex2.push(finalString.indexOf(keyword2[i]));
  }
}

console.log(keywordIndex2);
console.log(slideIndex2);
