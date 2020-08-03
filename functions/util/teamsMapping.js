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

function MLB_teamName2id(name) {
  name = name.toLowerCase().trim();
  switch (name) {
    case 'houston astros':
    case 'hou':
      return { statId: '117', id: '1217' };
    case 'oakland athletics':
    case 'oak':
      return { statId: '113', id: '1222' };
    case 'seattle mariners':
    case 'sea':
      return { statId: '136', id: '1202' };
    case 'los angeles angels':
    case 'ana':
    case 'laa':
      return { statId: '108', id: '1090' };
    case 'texas rangers':
    case 'tex':
      return { statId: '140', id: '1311' };
    case 'new york yankees':
    case 'nya':
      return { statId: '147', id: '1121' };
    case 'baltimore orioles':
    case 'bal':
      return { statId: '110', id: '1120' };
    case 'tampa bay rays':
    case 'tba':
      return { statId: '139', id: '1216' };
    case 'toronto blue jays':
    case 'tor':
      return { statId: '141', id: '1089' };
    case 'boston red sox':
    case 'bos':
      return { statId: '111', id: '1479' };
    case 'minnesota twins':
    case 'min':
      return { statId: '142', id: '1088' };
    case 'detroit tigers':
    case 'det':
      return { statId: '116', id: '1091' };
    case 'cleveland indians':
    case 'cle':
      return { statId: '114', id: '1310' };
    case 'chicago white sox':
    case 'cha':
      return { statId: '145', id: '1203' };
    case 'kansas city royals':
    case 'kca':
    case 'kc':
      return { statId: '118', id: '1478' };
    case 'chicago cubs':
    case 'chn':
    case 'chc':
      return { statId: '112', id: '1368' };
    case 'milwaukee brewers':
    case 'mil':
      return { statId: '158', id: '1187' };
    case 'st. louis cardinals':
    case 'sln':
    case 'stl':
      return { statId: '138', id: '1223' };
    case 'cincinnati reds':
    case 'cin':
      return { statId: '113', id: '1364' };
    case 'pittsburgh pirates':
    case 'pit':
      return { statId: '134', id: '1186' };
    case 'colorado rockies':
    case 'col':
      return { statId: '115', id: '1146' };
    case 'los angeles dodgers':
    case 'lan':
      return { statId: '119', id: '1369' };
    case 'san diego padres':
    case 'sdn':
    case 'sd':
      return { statId: '135', id: '1108' };
    case 'san francisco giants':
    case 'sfn':
    case 'sf':
      return { statId: '137', id: '1353' };
    case 'arizona diamondbacks':
    case 'ari':
      return { statId: '109', id: '1365' };
    case 'atlanta braves':
    case 'atl':
      return { statId: '144', id: '1352' };
    case 'miami marlins':
    case 'mia':
    case 'fla':
      return { statId: '146', id: '1109' };
    case 'washington nationals':
    case 'was':
    case 'wah':
      return { statId: '120', id: '1147' };
    case 'philadelphia phillies':
    case 'phi':
      return { statId: '143', id: '1112' };
    case 'new york mets':
    case 'nyn':
    case 'nym':
      return { statId: '121', id: '1113' };
    default:

      return 'Unknown team name in MLB';
  }
}

module.exports = { KBO_teamName2id, MLB_teamName2id };
