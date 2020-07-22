function KBO_teamName2id(name) {
  name = name.toLowerCase().trim();
  switch (name) {
    case 'lotte giants':
    case 'lotte':
      return '2408';
    case 'samsung lions':
    case 'samsung':
      return '3356';
    case 'kia tigers':
    case 'kia':
      return '4202';
    case 'doosan bears':
    case 'doosan':
      return '2406';
    case 'hanwha eagles':
    case 'hanwha':
      return '2405';
    case 'sk wyverns':
    case 'sk':
      return '8043';
    case 'lg twins':
    case 'lg':
      return '2407';
    case 'kiwoom heroes':
    case 'kiwoom':
      return '269103';
    case 'nc':
    case 'nc dinos':
      return '3353';
    case 'kt wiz':
    case 'kt':
      return '3354';
    default:
      return 'Unknown team name in KBO';
  }
}

module.exports = { KBO_teamName2id };
