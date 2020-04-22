const modules = require('../util/modules');
async function translateMLB (
  stringOrigin,
  keywordHomeOrigin,
  keywordAwayOrigin,
  transSimpleHomeOrigin,
  transSimpleAwayOrigin,
  // transCompleteHomeOrigin,
  // transCompleteAwayOrigin,
  totalDescriptionOrEachBall
) {
  let finalString = stringOrigin;
  if (totalDescriptionOrEachBall === 1) {
    const keyword = [
      'aBK',
      'bAB',
      'bB',
      'bDB',
      'bIB',
      'aKLAD1',
      'aKLAD2',
      'aKLAD3',
      'aKLAD4',
      'aKSAD1',
      'aKSAD2',
      'aKSAD3',
      'aKSAD4',
      'oKLT1',
      'oKLT2',
      'oKLT3',
      'oKLT4',
      'oKST1',
      'oKST2',
      'oKST3',
      'oKST4',
      'kFT',
      'kF',
      'kKL',
      'kKS',
      'oBI',
      'aCI',
      'aROE',
      'aROEAD2',
      'aROEAD3',
      'aROEAD4',
      'oROET2',
      'oROET3',
      'oROET4',
      'bPO',
      'rPABC',
      'rPABO'
    ];
    const keywordTrans = [
      `${stringOrigin[0]}發生投手假投犯規`,
      `${stringOrigin[0]}投出壞球`,
      `${stringOrigin[0]}投出壞球`,
      `${stringOrigin[0]}投出壞球`,
      `${stringOrigin[0]}投出壞球`,
      `${stringOrigin[0]}投出好球、${stringOrigin[1]}未揮棒、跑者推進一個壘包`,
      `${stringOrigin[0]}投出好球、${stringOrigin[1]}未揮棒、跑者推進兩個壘包`,
      `${stringOrigin[0]}投出好球、${stringOrigin[1]}未揮棒、跑者推進三個壘包`,
      `${stringOrigin[0]}投出好球、${stringOrigin[1]}未揮棒、跑者回本壘得分`,
      `${stringOrigin[0]}投出好球、${stringOrigin[1]}揮棒落空、跑者推進一個壘包`,
      `${stringOrigin[0]}投出好球、${stringOrigin[1]}揮棒落空、跑者推進兩個壘包`,
      `${stringOrigin[0]}投出好球、${stringOrigin[1]}揮棒落空、跑者推進三個壘包`,
      `${stringOrigin[0]}投出好球、${stringOrigin[1]}揮棒落空、跑者回本壘得分`,
      `${stringOrigin[0]}投出好球、${stringOrigin[1]}未揮棒，跑者出局於一壘`,
      `${stringOrigin[0]}投出好球、${stringOrigin[1]}未揮棒，跑者出局於二壘`,
      `${stringOrigin[0]}投出好球、${stringOrigin[1]}未揮棒，跑者出局於三壘`,
      `${stringOrigin[0]}投出好球、${stringOrigin[1]}未揮棒，跑者出局於本壘`,
      `${stringOrigin[0]}投出好球、${stringOrigin[1]}揮棒落空，跑者出局於一壘`,
      `${stringOrigin[0]}投出好球、${stringOrigin[1]}揮棒落空，跑者出局於二壘`,
      `${stringOrigin[0]}投出好球、${stringOrigin[1]}揮棒落空，跑者出局於三壘`,
      `${stringOrigin[0]}投出好球、${stringOrigin[1]}揮棒落空，跑者出局於本壘`,
      `${stringOrigin[1]}擊出擦棒被捕球`,
      `${stringOrigin[1]}擊出界外球`,
      `${stringOrigin[0]}投出好球、${stringOrigin[1]}未揮棒`,
      `${stringOrigin[0]}投出好球、${stringOrigin[1]}揮棒落空`,
      `${stringOrigin[1]}妨礙守備`,
      '守備妨礙打擊',
      '發生守備失誤',
      '發生守備失誤、使攻方推進兩個壘包',
      '發生守備失誤、使攻方推進三個壘包',
      '發生守備失誤、使攻方回本壘得分',
      '攻擊方發生失誤，出局於二壘',
      '攻擊方發生失誤，出局於三壘',
      '攻擊方發生失誤，出局於本壘',
      '跑者遭牽制出局',
      '經判定，該打席繼續打擊',
      '經判定，該打席結束打擊'
    ];
    let flag = false;

    for (let i = 0; i < keyword.length; i++) {
      if (finalString[2].indexOf(keyword[i]) >= 0) {
        // miss match
        flag = true;
        break;
      }
    }
    if (flag) {
      for (let i = 0; i < keyword.length; i++) {
        finalString[2] = await finalString[2].replace(
          new RegExp(keyword[i], 'g'),
          keywordTrans[i]
        );
      }
    }

    return finalString[2];
  }

  if (totalDescriptionOrEachBall === 0) {
    const keywordHome = keywordHomeOrigin;
    const keywordAway = keywordAwayOrigin;
    const transSimpleHome = transSimpleHomeOrigin;
    const transSimpleAway = transSimpleAwayOrigin;
    // let transCompleteHome = transCompleteHomeOrigin;
    // let transCompleteAway = transCompleteAwayOrigin;
    let keyword = keywordHome.concat(keywordAway);//  須確認
    // keywordTrans = transCompleteHome.concat(transCompleteAway);
    const keywordTransSimple = transSimpleHome.concat(transSimpleAway);
    // keyword = 依最嚴格條件開始替換

    for (let i = 0; i < keyword.length; i++) {
      finalString = await finalString.replace(
        new RegExp(keyword[i], 'g'),
        keywordTransSimple[i]
      );
    }
    const keywordEN = ['á', 'é', 'í', 'ó', 'ú'];
    const keywordTransEN = ['a', 'e', 'i', 'o', 'u'];

    for (let i = 0; i < keyword.length; i++) {
      keyword[i] = await keyword[i].replace(
        new RegExp(keywordEN[i], 'g'),
        keywordTransEN[i]
      );
    }

    keyword = [
      'Angels',
      'Athletics',
      'Mariners',
      'Astros',
      'Rangers',
      'Tigers',
      'Royals',
      'Indians',
      'White Sox',
      'Twins',
      'Orioles',
      'Blue Jays',
      'Yankees',
      'Rays',
      'Red Sox',
      'Dodgers',
      'Giants',
      'Padres',
      'Diamondbacks',
      'Rockies',
      'Cardinals',
      'Pirates',
      'Brewers',
      'Reds',
      'Cubs',
      'Nationals',
      'Braves',
      'Marlins',
      'Mets',
      'Phillies',
      'hit by pitch',
      'switches from',
      ' reaches on a fielder\'s choice to shallow infield',
      ' reaches on a fielder\'s choice to shallow center infield',
      ' reaches on a fielder\'s choice to shallow right infield',
      ' reaches on a fielder\'s choice to shallow left infield',
      ' reaches on a fielder\'s choice to infield',
      ' reaches on a fielder\'s choice to center infield',
      ' reaches on a fielder\'s choice to right infield',
      ' reaches on a fielder\'s choice to left infield',
      ' reaches on a fielder\'s choice to shallow field',
      ' reaches on a fielder\'s choice to shallow center field',
      ' reaches on a fielder\'s choice to shallow right field',
      ' reaches on a fielder\'s choice to shallow right center field',
      ' reaches on a fielder\'s choice to shallow left field',
      ' reaches on a fielder\'s choice to shallow left center field',
      ' reaches on a fielder\'s choice to field',
      ' reaches on a fielder\'s choice to center field',
      ' reaches on a fielder\'s choice to right field',
      ' reaches on a fielder\'s choice to right center field',
      ' reaches on a fielder\'s choice to left field',
      ' reaches on a fielder\'s choice to left center field',
      ' reaches on a fielder\'s choice to deep field',
      ' reaches on a fielder\'s choice to deep center field',
      ' reaches on a fielder\'s choice to deep right field',
      ' reaches on a fielder\'s choice to deep right center field',
      ' reaches on a fielder\'s choice to deep left field',
      ' reaches on a fielder\'s choice to deep left center field',
      ' reaches on error',
      ' Throwing error by',
      ' called out on strikes',
      ' strikes out swinging',
      ' strikes out on a foul tip',
      ' homers to center field',
      ' homers to right field',
      ' homers to right center field',
      ' homers to left field.',
      ' homers to left center field.',
      ' out at first',
      ' out at second',
      ' out at third',
      ' pops out to first base to',
      ' pops out to second base to',
      ' pops out to third base to',
      ' grounds out to first base to',
      ' grounds out to second base to',
      ' grounds out to third base to',
      ' lines out to first base to',
      ' lines out to second base to',
      ' lines out to third base to',
      ' pops out to shallow infield to',
      ' pops out to shallow center infield to',
      ' pops out to shallow right infield to',
      ' pops out to shallow left infield to',
      ' pops out to shortstop to',
      ' grounds out to shallow infield to',
      ' grounds out to shallow center infield to',
      ' grounds out to shallow right infield to',
      ' grounds out to shallow left infield to',
      ' grounds out to shortstop to',
      ' lines out to shallow infield to',
      ' lines out to shallow center infield to',
      ' lines out to shallow right infield to',
      ' lines out to shallow left infield to',
      ' lines out to shortstop to',
      ' pops out to infield to',
      ' pops out to center infield to',
      ' pops out to right infield to',
      ' pops out to left infield to',
      ' grounds out to infield to',
      ' grounds out to center infield to',
      ' grounds out to right infield to',
      ' grounds out to left infield to',
      ' lines out to infield to',
      ' lines out to center infield to',
      ' lines out to right infield to',
      ' lines out to left infield to',
      // 外野出局
      ' grounds out to shallow field to',
      ' grounds out to shallow center field to',
      ' grounds out to shallow right field to',
      ' grounds out to shallow right center field to',
      ' grounds out to shallow left field to',
      ' grounds out to shallow left center field to',
      ' grounds out to field to',
      ' grounds out to center field to',
      ' grounds out to right field to',
      ' grounds out to right center field to',
      ' grounds out to left field to',
      ' grounds out to left center field to',
      ' grounds out to deep field to',
      ' grounds out to deep center field to',
      ' grounds out to deep right field to',
      ' grounds out to deep right center field to',
      ' grounds out to deep left field to',
      ' grounds out to deep left center field to',
      ' lines out to shallow field to',
      ' lines out to shallow center field to',
      ' lines out to shallow right field to',
      ' lines out to shallow right center field to',
      ' lines out to shallow left field to',
      ' lines out to shallow left center field to',
      ' lines out to field to',
      ' lines out to center field to',
      ' lines out to right field to',
      ' lines out to right center field to',
      ' lines out to left field to',
      ' lines out to left center field to',
      ' lines out to deep field to',
      ' lines out to deep center field to',
      ' lines out to deep right field to',
      ' lines out to deep right center field to',
      ' lines out to deep left field to',
      ' lines out to deep left center field to',
      ' flies out to shallow field to',
      ' flies out to shallow center field to',
      ' flies out to shallow right field to',
      ' flies out to shallow right center field to',
      ' flies out to shallow left field to',
      ' flies out to shallow left center field to',
      ' flies out to field to',
      ' flies out to center field to',
      ' flies out to right field to',
      ' flies out to right center field to',
      ' flies out to left field to',
      ' flies out to left center field to',
      ' flies out to deep field to',
      ' flies out to deep center field to',
      ' flies out to deep right field to',
      ' flies out to deep right center field to',
      ' flies out to deep left field to',
      ' flies out to deep left center field to',
      ' pops out to first base',
      ' pops out to second base',
      ' pops out to third base',
      ' grounds out to first base',
      ' grounds out to second base',
      ' grounds out to third base',
      ' lines out to first base',
      ' lines out to second base',
      ' lines out to third base',
      ' pops out to shallow infield',
      ' pops out to shallow center infield',
      ' pops out to shallow right infield',
      ' pops out to shallow left infield',
      ' grounds out to shallow infield',
      ' grounds out to shallow center infield',
      ' grounds out to shallow right infield',
      ' grounds out to shallow left infield',
      ' lines out to shallow infield',
      ' lines out to shallow center infield',
      ' lines out to shallow right infield',
      ' lines out to shallow left infield',
      ' pops out to infield',
      ' pops out to center infield',
      ' pops out to right infield',
      ' pops out to left infield',
      ' grounds out to infield',
      ' grounds out to center infield',
      ' grounds out to right infield',
      ' grounds out to left infield',
      ' lines out to infield',
      ' lines out to center infield',
      ' lines out to right infield',
      ' lines out to left infield',
      // 外野出局
      ' grounds out to shallow field',
      ' grounds out to shallow center field',
      ' grounds out to shallow right field',
      ' grounds out to shallow right center field',
      ' grounds out to shallow left field',
      ' grounds out to shallow left center field',
      ' grounds out to field',
      ' grounds out to center field',
      ' grounds out to right field',
      ' grounds out to right center field',
      ' grounds out to left field',
      ' grounds out to left center field',
      ' grounds out to deep field',
      ' grounds out to deep center field',
      ' grounds out to deep right field',
      ' grounds out to deep right center field',
      ' grounds out to deep left field',
      ' grounds out to deep left center field',
      ' lines out to shallow field',
      ' lines out to shallow center field',
      ' lines out to shallow right field',
      ' lines out to shallow right center field',
      ' lines out to shallow left field',
      ' lines out to shallow left center field',
      ' lines out to field',
      ' lines out to center field',
      ' lines out to right field',
      ' lines out to right center field',
      ' lines out to left field',
      ' lines out to left center field',
      ' lines out to deep field',
      ' lines out to deep center field',
      ' lines out to deep right field',
      ' lines out to deep right center field',
      ' lines out to deep left field',
      ' lines out to deep left center field',
      ' flies out to shallow field',
      ' flies out to shallow center field',
      ' flies out to shallow right field',
      ' flies out to shallow right center field',
      ' flies out to shallow left field',
      ' flies out to shallow left center field',
      ' flies out to field',
      ' flies out to center field',
      ' flies out to right field',
      ' flies out to right center field',
      ' flies out to left field',
      ' flies out to left center field',
      ' flies out to deep field',
      ' flies out to deep center field',
      ' flies out to deep right field',
      ' flies out to deep right center field',
      ' flies out to deep left field',
      ' flies out to deep left center field',
      ' steals first',
      ' steals second',
      ' steals third',
      // 安打類型
      ' singles to shallow infield',
      ' singles to shallow center infield',
      ' singles to shallow right infield',
      ' singles to shallow left infield',
      ' singles to infield',
      ' singles to center infield',
      ' singles to right infield',
      ' singles to left infield',
      ' singles to shallow field',
      ' singles to shallow center field',
      ' singles to shallow right field',
      ' singles to shallow right center field',
      ' singles to shallow left field',
      ' singles to shallow left center field',
      ' singles to field',
      ' singles to center field',
      ' singles to right field',
      ' singles to right center field',
      ' singles to left field',
      ' singles to left center field',
      ' singles to deep field',
      ' singles to deep center field',
      ' singles to deep right field',
      ' singles to deep right center field',
      ' singles to deep left field',
      ' singles to deep left center field',
      ' doubles to shallow field',
      ' doubles to shallow center field',
      ' doubles to shallow right field',
      ' doubles to shallow right center field',
      ' doubles to shallow left field',
      ' doubles to shallow left center field',
      ' doubles to field',
      ' doubles to center field',
      ' doubles to right field',
      ' doubles to right center field',
      ' doubles to left field',
      ' doubles to left center field',
      ' doubles to deep field',
      ' doubles to deep center field',
      ' doubles to deep right field',
      ' doubles to deep right center field',
      ' doubles to deep left field',
      ' doubles to deep left center field',
      ' triples to shallow field',
      ' triples to shallow center field',
      ' triples to shallow right field',
      ' triples to shallow right center field',
      ' triples to shallow left field',
      ' triples to shallow left center field',
      ' triples to field',
      ' triples to center field',
      ' triples to right field',
      ' triples to right center field',
      ' triples to left field',
      ' triples to left center field',
      ' triples to deep field',
      ' triples to deep center field',
      ' triples to deep right field',
      ' triples to deep right center field',
      ' triples to deep left field',
      ' triples to deep left center field',
      ' out on a sacrifice fly to field to',
      ' out on a sacrifice fly to center field to',
      ' out on a sacrifice fly to right field to',
      ' out on a sacrifice fly to right center field to',
      ' out on a sacrifice fly to left field to',
      ' out on a sacrifice fly to left center field to',
      ' scores',
      ' walks',
      ' replaces',
      ' pinch-hitting for',
      ' pinch-running for',
      ' remains in the game',
      ' as IF',
      ' as 1B',
      ' as 2B',
      ' as 3B',
      ' as SS',
      ' as OF',
      ' as LF',
      ' as CF',
      ' as RF',
      ' as RP',
      ' as SP',
      ' as DH',
      ' pops out to shallow infield',
      ' pops out to shallow center infield',
      ' pops out to shallow right infield',
      ' pops out to shallow left infield',
      ' pops out to infield',
      ' pops out to center infield',
      ' pops out to right infield',
      ' pops out to left infield',
      ' grounds out to shallow infield',
      ' grounds out to shallow center infield',
      ' grounds out to shallow right infield',
      ' grounds out to shallow left infield',
      ' grounds out to infield',
      ' grounds out to center infield',
      ' grounds out to right infield',
      ' grounds out to left infield',
      ' lines out to shallow infield',
      ' lines out to shallow center infield',
      ' lines out to shallow right infield',
      ' lines out to shallow left infield',
      ' lines out to infield',
      ' lines out to center infield',
      ' lines out to right infield',
      ' lines out to left infield',
      ' flies out to shallow field',
      ' flies out to shallow center field',
      ' flies out to shallow right field',
      ' flies out to shallow right center field',
      ' flies out to shallow left field',
      ' flies out to shallow left center field',
      ' flies out to field',
      ' flies out to center field',
      ' flies out to right field',
      ' flies out to right center field',
      ' flies out to left field',
      ' flies out to left center field',
      ' flies out to deep field',
      ' flies out to deep center field',
      ' flies out to deep right field',
      ' flies out to deep right center field',
      ' flies out to deep left field',
      ' flies out to deep left center field',
      ' out on a sacrifice fly to field',
      ' out on a sacrifice fly to center field',
      ' out on a sacrifice fly to right field',
      ' out on a sacrifice fly to right center field',
      ' out on a sacrifice fly to left field',
      ' out on a sacrifice fly to left center field',
      ' (C)',
      ' (IF)',
      ' (1B)',
      ' (2B)',
      ' (3B)',
      ' (SS)',
      ' (OF)',
      ' (LF)',
      ' (CF)',
      ' (P)',
      ' (RF)',
      ' (RP)',
      ' (SP)',
      ' (DH)',
      'as C',
      'as P',
      'to IF ',
      'to 1B ',
      'to 2B ',
      'to 3B ',
      'to SS ',
      'to OF ',
      'to LF ',
      'to CF ',
      'to RF ',
      'to RP ',
      'to SP ',
      'to DH ',
      'to IF.',
      'to 1B.',
      'to 2B.',
      'to 3B.',
      'to SS.',
      'to OF.',
      'to LF.',
      'to CF.',
      'to RF.',
      'to RP.',
      'to SP.',
      'to DH.',
      'to first',
      'to second',
      'to third',
      'pops out to',
      'grounds out to',
      'lines out to',
      'flies out to',
      ' IF ',
      ' 1B ',
      ' 2B ',
      ' 3B ',
      ' SS ',
      ' OF ',
      ' LF ',
      ' CF ',
      ' RF ',
      ' RP ',
      ' SP ',
      ' DH ',
      ' IF.',
      ' 1B.',
      ' 2B.',
      ' 3B.',
      ' SS.',
      ' OF.',
      ' LF.',
      ' CF.',
      ' RF.',
      ' RP.',
      ' SP.',
      ' DH.',
      'to C ',
      'to P ',
      'to C.',
      'to P.',
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
      ' as C.',
      ' as P.'
    ];

    const keywordTrans = [
      '天使',
      '運動家',
      '水手',
      '太空人',
      '遊騎兵',
      '老虎',
      '皇家',
      '印地安人',
      '白襪',
      '雙城',
      '金鶯',
      '藍鳥',
      '洋基',
      '光芒',
      '紅襪',
      '道奇',
      '巨人',
      '教士',
      '響尾蛇',
      '落磯',
      '紅雀',
      '海盜',
      '釀酒人',
      '紅人',
      '小熊',
      '國民',
      '勇士',
      '馬林魚',
      '大都會',
      '費城人',
      '遭觸身保送',
      '由',
      '擊出內野安打獲得野手選擇',
      '擊出中內野安打獲得野手選擇',
      '擊出右內野安打獲得野手選擇',
      '擊出左內野安打獲得野手選擇',
      '擊出內野安打獲得野手選擇',
      '擊出中內野安打獲得野手選擇',
      '擊出右內野安打獲得野手選擇',
      '擊出左內野安打獲得野手選擇',
      '擊出外野安打獲得野手選擇',
      '擊出中外野安打獲得野手選擇',
      '擊出右外野安打獲得野手選擇',
      '擊出中右外野間安打獲得野手選擇',
      '擊出左外野安打獲得野手選擇',
      '擊出中左外野間安打獲得野手選擇',
      '擊出外野安打獲得野手選擇',
      '擊出中外野安打獲得野手選擇',
      '擊出右外野安打獲得野手選擇',
      '擊出中右外野間安打獲得野手選擇',
      '擊出左外野安打獲得野手選擇',
      '擊出中左外野間安打獲得野手選擇',
      '擊出深遠外野安打獲得野手選擇',
      '擊出深遠中外野安打獲得野手選擇',
      '擊出深遠右外野安打獲得野手選擇',
      '擊出深遠中右外野間安打獲得野手選擇',
      '擊出深遠左外野安打獲得野手選擇',
      '擊出深遠中左外野間安打獲得野手選擇',
      '發生失誤',
      '丟球失誤(由',
      '被三振出局',
      '揮棒落空三振出局',
      '擊出擦棒被捕球三振出局',
      '擊出中間方向全壘打',
      '擊出右邊方向全壘打',
      '擊出中間偏右方向全壘打',
      '擊出左邊方向全壘打',
      '擊出中間偏左方向全壘打',
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
      '擊出中內野高飛球被接殺（由',
      '擊出右內野高飛球被接殺（由',
      '擊出左內野高飛球被接殺（由',
      '擊出二壘與三壘間高飛球被接殺（由',
      '擊出內野滾地球被刺殺（由',
      '擊出中內野滾地球被刺殺（由',
      '擊出右內野滾地球被刺殺（由',
      '擊出左內野滾地球被刺殺（由',
      '擊出二壘與三壘間滾地球被接殺（由',
      '擊出內野平飛球被接殺（由',
      '擊出中內野平飛球被接殺（由',
      '擊出右內野平飛球被接殺（由',
      '擊出左內野平飛球被接殺（由',
      '擊出二壘與三壘間平飛球被接殺（由',
      '擊出內野高飛球被接殺（由',
      '擊出中內野高飛球被接殺（由',
      '擊出右內野高飛球被接殺（由',
      '擊出左內野高飛球被接殺（由',
      '擊出內野滾地球被刺殺（由',
      '擊出中內野滾地球被刺殺（由',
      '擊出右內野滾地球被刺殺（由',
      '擊出左內野滾地球被刺殺（由',
      '擊出內野平飛球被接殺（由',
      '擊出中內野平飛球被接殺（由',
      '擊出右內野平飛球被接殺（由',
      '擊出左內野平飛球被接殺（由',
      '擊出外野滾地球被接殺（由',
      '擊出中外野滾地球被接殺（由',
      '擊出右外野滾地球被接殺（由',
      '擊出中右外野間滾地球被接殺（由',
      '擊出左外野滾地球被接殺（由',
      '擊出中左外野滾地球被接殺（由',
      '擊出外野滾地球被接殺（由',
      '擊出中外野滾地球被接殺（由',
      '擊出右外野滾地球被接殺（由',
      '擊出中右外野間滾地球被接殺（由',
      '擊出左外野滾地球被接殺（由',
      '擊出中左外野滾地球被接殺（由',
      '擊出深遠外野滾地球被接殺（由',
      '擊出深遠中外野滾地球被接殺（由',
      '擊出深遠右外野滾地球被接殺（由',
      '擊出深遠中右外野間滾地球被接殺（由',
      '擊出深遠左外野滾地球被接殺（由',
      '擊出深遠中左外野滾地球被接殺（由',
      '擊出外野平飛球被接殺（由',
      '擊出中外野平飛球被接殺（由',
      '擊出右外野平飛球被接殺（由',
      '擊出中右外野間平飛球被接殺（由',
      '擊出左外野平飛球被接殺（由',
      '擊出中左外野間平飛球被接殺（由',
      '擊出外野平飛球被接殺（由',
      '擊出中外野平飛球被接殺（由',
      '擊出右外野平飛球被接殺（由',
      '擊出中右外野間平飛球被接殺（由',
      '擊出左外野平飛球被接殺（由',
      '擊出中左外野間平飛球被接殺（由',
      '擊出深遠外野平飛球被接殺（由',
      '擊出深遠中外野平飛球被接殺（由',
      '擊出深遠右外野平飛球被接殺（由',
      '擊出深遠中右外野間平飛球被接殺（由',
      '擊出深遠左外野平飛球被接殺（由',
      '擊出深遠中左外野間平飛球被接殺（由',
      '擊出外野高飛球被接殺（由',
      '擊出中外野高飛球被接殺（由',
      '擊出右外野高飛球被接殺（由',
      '擊出中右外野間高飛球被接殺（由',
      '擊出左外野高飛球被接殺（由',
      '擊出中左外野高飛球被接殺（由',
      '擊出外野高飛球被接殺（由',
      '擊出中外野高飛球被接殺（由',
      '擊出右外野高飛球被接殺（由',
      '擊出中右外野間高飛球被接殺（由',
      '擊出左外野高飛球被接殺（由',
      '擊出中左外野高飛球被接殺（由',
      '擊出深遠外野高飛球被接殺（由',
      '擊出深遠中外野高飛球被接殺（由',
      '擊出深遠右外野高飛球被接殺（由',
      '擊出深遠中右外野間高飛球被接殺（由',
      '擊出深遠左外野高飛球被接殺（由',
      '擊出深遠中左外野高飛球被接殺（由',
      '擊出往一壘高飛球被接殺',
      '擊出往二壘高飛球被接殺',
      '擊出往三壘高飛球被接殺',
      '擊出往一壘滾地球被刺殺',
      '擊出往二壘滾地球被刺殺',
      '擊出往三壘滾地球被刺殺',
      '擊出往一壘平飛球被接殺',
      '擊出往二壘平飛球被接殺',
      '擊出往三壘平飛球被接殺',
      '擊出內野高飛球被接殺',
      '擊出中內野高飛球被接殺',
      '擊出右內野高飛球被接殺',
      '擊出左內野高飛球被接殺',
      '擊出內野滾地球被刺殺',
      '擊出中內野滾地球被刺殺',
      '擊出右內野滾地球被刺殺',
      '擊出左內野滾地球被刺殺',
      '擊出內野平飛球被接殺',
      '擊出中內野平飛球被接殺',
      '擊出右內野平飛球被接殺',
      '擊出左內野平飛球被接殺',
      '擊出內野高飛球被接殺',
      '擊出中內野高飛球被接殺',
      '擊出右內野高飛球被接殺',
      '擊出左內野高飛球被接殺',
      '擊出內野滾地球被刺殺',
      '擊出中內野滾地球被刺殺',
      '擊出右內野滾地球被刺殺',
      '擊出左內野滾地球被刺殺',
      '擊出內野平飛球被接殺',
      '擊出中內野平飛球被接殺',
      '擊出右內野平飛球被接殺',
      '擊出左內野平飛球被接殺',
      '擊出外野滾地球被接殺',
      '擊出中外野滾地球被接殺',
      '擊出右外野滾地球被接殺',
      '擊出中右外野間滾地球被接殺',
      '擊出左外野滾地球被接殺',
      '擊出中左外野滾地球被接殺',
      '擊出外野滾地球被接殺',
      '擊出中外野滾地球被接殺',
      '擊出右外野滾地球被接殺',
      '擊出中右外野間滾地球被接殺',
      '擊出左外野滾地球被接殺',
      '擊出中左外野滾地球被接殺',
      '擊出深遠外野滾地球被接殺',
      '擊出深遠中外野滾地球被接殺',
      '擊出深遠右外野滾地球被接殺',
      '擊出深遠中右外野間滾地球被接殺',
      '擊出深遠左外野滾地球被接殺',
      '擊出深遠中左外野滾地球被接殺',
      '擊出外野平飛球被接殺',
      '擊出中外野平飛球被接殺',
      '擊出右外野平飛球被接殺',
      '擊出中右外野間平飛球被接殺',
      '擊出左外野平飛球被接殺',
      '擊出中左外野間平飛球被接殺',
      '擊出外野平飛球被接殺',
      '擊出中外野平飛球被接殺',
      '擊出右外野平飛球被接殺',
      '擊出中右外野間平飛球被接殺',
      '擊出左外野平飛球被接殺',
      '擊出中左外野間平飛球被接殺',
      '擊出深遠外野平飛球被接殺',
      '擊出深遠中外野平飛球被接殺',
      '擊出深遠右外野平飛球被接殺',
      '擊出深遠中右外野間平飛球被接殺',
      '擊出深遠左外野平飛球被接殺',
      '擊出深遠中左外野間平飛球被接殺',
      '擊出外野高飛球被接殺',
      '擊出中外野高飛球被接殺',
      '擊出右外野高飛球被接殺',
      '擊出中右外野間高飛球被接殺',
      '擊出左外野高飛球被接殺',
      '擊出中左外野高飛球被接殺',
      '擊出外野高飛球被接殺',
      '擊出中外野高飛球被接殺',
      '擊出右外野高飛球被接殺',
      '擊出中右外野間高飛球被接殺',
      '擊出左外野高飛球被接殺',
      '擊出中左外野高飛球被接殺',
      '擊出深遠外野高飛球被接殺',
      '擊出深遠中外野高飛球被接殺',
      '擊出深遠右外野高飛球被接殺',
      '擊出深遠中右外野間高飛球被接殺',
      '擊出深遠左外野高飛球被接殺',
      '擊出深遠中左外野高飛球被接殺',
      '盜上一壘',
      '盜上二壘',
      '盜上三壘',
      '擊出內野一壘安打',
      '擊出中內野一壘安打',
      '擊出右內野一壘安打',
      '擊出左內野一壘安打',
      '擊出內野一壘安打',
      '擊出中內野一壘安打',
      '擊出右內野一壘安打',
      '擊出左內野一壘安打',
      '擊出外野一壘安打',
      '擊出中外野一壘安打',
      '擊出右外野一壘安打',
      '擊出中右外野間一壘安打',
      '擊出左外野一壘安打',
      '擊出中左外野間一壘安打',
      '擊出外野一壘安打',
      '擊出中外野一壘安打',
      '擊出右外野一壘安打',
      '擊出中右外野間一壘安打',
      '擊出左外野一壘安打',
      '擊出中左外野間一壘安打',
      '擊出深遠外野一壘安打',
      '擊出深遠中外野一壘安打',
      '擊出深遠右外野一壘安打',
      '擊出深遠中右外野間一壘安打',
      '擊出深遠左外野一壘安打',
      '擊出深遠中左外野間一壘安打',
      '擊出外野二壘安打',
      '擊出中外野二壘安打',
      '擊出右外野二壘安打',
      '擊出中右外野間二壘安打',
      '擊出左外野二壘安打',
      '擊出左中外野間二壘安打',
      '擊出外野二壘安打',
      '擊出中外野二壘安打',
      '擊出右外野二壘安打',
      '擊出中右外野間二壘安打',
      '擊出左外野二壘安打',
      '擊出左中外野間二壘安打',
      '擊出深遠外野二壘安打',
      '擊出深遠中外野二壘安打',
      '擊出深遠右外野二壘安打',
      '擊出深遠中右外野間二壘安打',
      '擊出深遠左外野二壘安打',
      '擊出深遠左中外野間二壘安打',
      '擊出外野三壘安打',
      '擊出中外野三壘安打',
      '擊出右外野三壘安打',
      '擊出中右外野間三壘安打',
      '擊出左外野三壘安打',
      '擊出中左外野間三壘安打',
      '擊出外野三壘安打',
      '擊出中外野三壘安打',
      '擊出右外野三壘安打',
      '擊出中右外野間三壘安打',
      '擊出左外野三壘安打',
      '擊出中左外野間三壘安打',
      '擊出深遠外野三壘安打',
      '擊出深遠中外野三壘安打',
      '擊出深遠右外野三壘安打',
      '擊出深遠中右外野間三壘安打',
      '擊出深遠左外野三壘安打',
      '擊出深遠中左外野間三壘安打',
      '擊出外野高飛犧牲打被接殺（由',
      '擊出中外野高飛犧牲打被接殺（由',
      '擊出右外野高飛犧牲打被接殺（由',
      '擊出中右外野間高飛犧牲打被接殺（由',
      '擊出左外野高飛犧牲打被接殺（由',
      '擊出中左外野間高飛犧牲打被接殺（由',
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
      '指定打擊',
      '擊出內野高飛球被接殺',
      '擊出中內野高飛球被接殺',
      '擊出右內野高飛球被接殺',
      '擊出左內野高飛球被接殺',
      '擊出內野高飛球被接殺',
      '擊出中內野高飛球被接殺',
      '擊出右內野高飛球被接殺',
      '擊出左內野高飛球被接殺',
      '擊出內野滾地球被刺殺',
      '擊出中內野滾地球被刺殺',
      '擊出右內野滾地球被刺殺',
      '擊出左內野滾地球被刺殺',
      '擊出內野滾地球被刺殺',
      '擊出中內野滾地球被刺殺',
      '擊出右內野滾地球被刺殺',
      '擊出左內野滾地球被刺殺',
      '擊出內野平飛球被接殺',
      '擊出中內野平飛球被接殺',
      '擊出右內野平飛球被接殺',
      '擊出左內野平飛球被接殺',
      '擊出內野平飛球被接殺',
      '擊出中內野平飛球被接殺',
      '擊出右內野平飛球被接殺',
      '擊出左內野平飛球被接殺',
      '擊出外野高飛球被接殺',
      '擊出中外野高飛球被接殺',
      '擊出右外野高飛球被接殺',
      '擊出中右外野間高飛球被接殺',
      '擊出左外野高飛球被接殺',
      '擊出中左外野間高飛球被接殺',
      '擊出外野高飛球被接殺',
      '擊出中外野高飛球被接殺',
      '擊出右外野高飛球被接殺',
      '擊出中右外野間高飛球被接殺',
      '擊出左外野高飛球被接殺',
      '擊出中左外野間高飛球被接殺',
      '擊出深遠外野高飛球被接殺',
      '擊出深遠中外野高飛球被接殺',
      '擊出深遠右外野高飛球被接殺',
      '擊出深遠中右外野間高飛球被接殺',
      '擊出深遠左外野高飛球被接殺',
      '擊出深遠中左外野間高飛球被接殺',
      '擊出外野高飛犧牲打被接殺',
      '擊出中外野高飛犧牲打被接殺',
      '擊出右外野高飛犧牲打被接殺',
      '擊出中右外野間高飛犧牲打被接殺',
      '擊出左外野高飛犧牲打被接殺',
      '擊出中左外野間高飛犧牲打被接殺',
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
      '投手',
      '轉為 內野手 ',
      '轉為 一壘手 ',
      '轉為 二壘手 ',
      '轉為 三壘手 ',
      '轉為 游擊手 ',
      '轉為 外野手 ',
      '轉為 左外野手 ',
      '轉為 中外野手 ',
      '轉為 右外野手 ',
      '轉為 後援投手 ',
      '轉為 先發投手 ',
      '轉為 指定打擊 ',
      '轉為 內野手.',
      '轉為 一壘手.',
      '轉為 二壘手.',
      '轉為 三壘手.',
      '轉為 游擊手.',
      '轉為 外野手.',
      '轉為 左外野手.',
      '轉為 中外野手.',
      '轉為 右外野手.',
      '轉為 後援投手.',
      '轉為 先發投手.',
      '轉為 指定打擊.',
      '上一壘',
      '上二壘',
      '上三壘',
      '擊出高飛球被接殺（由',
      '擊出滾地球被刺殺（由',
      '擊出平飛球被接殺（由',
      '擊出高飛球被接殺（由',
      ' 內野手 ',
      ' 一壘手 ',
      ' 二壘手 ',
      ' 三壘手 ',
      ' 游擊手 ',
      ' 外野手 ',
      ' 左外野手 ',
      ' 中外野手 ',
      ' 右外野手 ',
      ' 後援投手 ',
      ' 先發投手 ',
      ' 指定打擊 ',
      ' 內野手.',
      ' 一壘手.',
      ' 二壘手.',
      ' 三壘手.',
      ' 游擊手.',
      ' 外野手.',
      ' 左外野手.',
      ' 中外野手.',
      ' 右外野手.',
      ' 後援投手.',
      ' 先發投手.',
      ' 指定打擊.',
      '轉為 捕手 ',
      '轉為 投手 ',
      '轉為 捕手.',
      '轉為 投手.',
      ' 傳給 ',
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
      ' 捕手.',
      ' 投手.'
    ];

    for (let i = 0; i < keyword.length; i++) {
      finalString = await finalString.replace(
        new RegExp(keyword[i], 'g'),
        keywordTrans[i]
      );
    }

    return finalString;
  }
}

async function transFunction (stringTrans) {
  const stringAfterTrans = await modules.translate(stringTrans, {
    from: 'en',
    to: 'zh-tw'
  });
  return await stringAfterTrans.text;
}
async function stepTrans (stringTrans) {
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
}
module.exports = { translateMLB };
// another outcome
// keyword = [
//   'aD', //打者擊出二壘安打
//   'aDAD3', // 打者擊出二壘安打、使跑者推進三個壘包
//   'aDAD4', // 打者擊出二壘安打、使跑者回本壘
//   'aFCAD2', // 打者獲得野手選擇、使跑者推進兩個壘包
//   'aFCAD3', // 打者獲得野手選擇、使跑者推進三個壘包
//   'aFCAD4', // 打者獲得野手選擇、使跑者回本壘
//   'aHBP', //打者遭觸身
//   'aHR', //打者擊出全壘打
//   'aIBB', //打者遭保送 //
//   'aROE', // 守備失誤
//   'aROEAD2', // 守備失誤、使跑者推進二個壘包
//   'aROEAD3', // 守備失誤、使跑者推進三個壘包
//   'aROEAD4', // 守備失誤、使跑者回本壘
//   'aS', //打者擊出一壘安打
//   'aSAD2', //打者擊出一壘安打、使跑者推進二個壘包
//   'aSAD3', //打者擊出一壘安打、使跑者推進三個壘包
//   'aSAD4', //打者擊出一壘安打、使跑者回本壘
//   'aSBAD1', // 打者擊出犧牲觸擊、使跑者推進一個壘包
//   'aSBAD2', // 打者擊出犧牲觸擊、使跑者推進兩個壘包
//   'aSBAD3', // 打者擊出犧牲觸擊、使跑者推進三個壘包
//   'aSBAD4', // 打者擊出犧牲觸擊、使跑者回本壘
//   'aSFAD1', // 打者擊出犧牲高飛打、使跑者推進一個壘包
//   'aSFAD2', // 打者擊出犧牲高飛打、使跑者推進兩個壘包
//   'aSFAD3', // 打者擊出犧牲高飛打、使跑者推進三個壘包
//   'aSFAD4', // 打者擊出犧牲高飛打、使跑者回本壘
//   'aT', // 打者擊出三壘安打
//   'aTAD4', // 打者擊出三壘安打、使跑者回本壘
//   'oDT3', // 打者擊出二壘安打，使跑者出局在三壘
//   'oDT4', // 打者擊出二壘安打，使跑者出局在本壘
//   'oFC', // 發生野手選擇
//   'oFCT2', // 發生野手選擇、跑者出局於二壘
//   'oFCT3', // 發生野手選擇、跑者出局於三壘
//   'oFCT4', // 發生野手選擇、跑者出局於本壘
//   'oFO', //打者擊出高飛球被接殺
//   'oGO', //打者擊出滾地球被刺殺
//   'oLO', // 打者擊出平飛球被接殺
//   'oOBB', // 打者出局於打者區
//   'oOP', // 打者遭促請裁決出局
//   'oPO', //打者擊出高飛球被接殺
//   'oSB', // 打者擊出犧牲觸擊
//   'oSBT2', // 打者擊出犧牲觸擊，出局於二壘
//   'oSBT3', // 打者擊出犧牲觸擊，出局於三壘
//   'oSBT4', // 打者擊出犧牲觸擊，出局於本壘
//   'oSF', //打者擊出犧牲高飛打
//   'oSFT2', //打者擊出犧牲高飛打，出局於二壘
//   'oSFT3', //打者擊出犧牲高飛打，出局於三壘
//   'oSFT4', //打者擊出犧牲高飛打，出局於本壘
//   'oST2', //打者擊出一壘安打，出局於二壘
//   'oST3', //打者擊出一壘安打，出局於三壘
//   'oST4', //打者擊出一壘安打，出局於本壘
//   'oTT4', //打者擊出三壘安打，出局於本壘
// ];
// keywordTrans = [
//   '投手犯規',
//   '守備妨礙打擊',
//   '打者擊出二壘安打',
//   '打者擊出二壘安打、使跑者推進三個壘包',
//   '打者擊出二壘安打、使跑者回本壘',
//   '打者獲得野手選擇、使跑者推進兩個壘包',
//   '打者獲得野手選擇、使跑者推進三個壘包',
//   '打者獲得野手選擇、使跑者回本壘',
//   '打者遭觸身',
//   '打者擊出全壘打',
//   '打者遭保送',
//   '好球、打者未揮棒、跑者推進一個壘包',
//   '好球、打者未揮棒、跑者推進兩個壘包',
//   '好球、打者未揮棒、跑者推進三個壘包',
//   '好球、打者未揮棒、跑者回本壘',
//   '好球、打者揮棒落空、跑者推進一個壘包',
//   '好球、打者揮棒落空、跑者推進兩個壘包',
//   '好球、打者揮棒落空、跑者推進三個壘包',
//   '好球、打者揮棒落空、跑者回本壘',
//   '守備失誤',
//   '守備失誤、使跑者推進二個壘包',
//   '守備失誤、使跑者推進三個壘包',
//   '守備失誤、使跑者回本壘',
//   '打者擊出一壘安打',
//   '打者擊出一壘安打、使跑者推進二個壘包D2',
//   '打者擊出一壘安打、使跑者推進三個壘包',
//   '打者擊出一壘安打、使跑者回本壘',
//   '打者擊出犧牲觸擊、使跑者推進一個壘包',
//   '打者擊出犧牲觸擊、使跑者推進兩個壘包',
//   '打者擊出犧牲觸擊、使跑者推進三個壘包',
//   '打者擊出犧牲觸擊、使跑者回本壘',
//   '打者擊出犧牲高飛打、使跑者推進一個壘包',
//   '打者擊出犧牲高飛打、使跑者推進兩個壘包',
//   '打者擊出犧牲高飛打、使跑者推進三個壘包',
//   '打者擊出犧牲高飛打、使跑者回本壘',
//   '打者擊出三壘安打',
//   '打者擊出三壘安打、使跑者回本壘',
//   '投手投出壞球',
//   '投手投出壞球',
//   '投手投出壞球',
//   '投手投出壞球',
//   '跑者遭牽制出局',
//   '打者擊出界外球',
//   '打者擊出擦棒被捕球',
//   '好球、打者未揮棒',
//   '好球、打者揮棒落空',
//   '打者妨礙守備',
//   '打者擊出二壘安打，使跑者出局在三壘',
//   '打者擊出二壘安打，使跑者出局在本壘',
//   '發生野手選擇',
//   '發生野手選擇、跑者出局於二壘',
//   '發生野手選擇、跑者出局於三壘',
//   '發生野手選擇、跑者出局於本壘',
//   '打者擊出高飛球被接殺',
//   '打者擊出滾地球被刺殺',
//   '好球、打者未揮棒，跑者出局於二壘',
//   '好球、打者未揮棒，跑者出局於三壘',
//   '好球、打者未揮棒，跑者出局於本壘',
//   '好球、打者揮棒落空，跑者出局於一壘',
//   '好球、打者揮棒落空，跑者出局於二壘',
//   '好球、打者揮棒落空，跑者出局於三壘',
//   '好球、打者揮棒落空，跑者出局於本壘',
//   '打者擊出平飛球被接殺',
//   '打者出局於打者區',
//   '打者遭促請裁決出局',
//   '打者擊出高飛球被接殺',
//   '攻擊方發生失誤，出局於二壘',
//   '攻擊方發生失誤，出局於三壘',
//   '攻擊方發生失誤，出局於本壘',
//   '打者擊出犧牲觸擊',
//   '打者擊出犧牲觸擊，出局於二壘',
//   '打者擊出犧牲觸擊，出局於三壘',
//   '打者擊出犧牲觸擊，出局於本壘',
//   '打者擊出犧牲高飛打',
//   '打者擊出犧牲高飛打，出局於二壘',
//   '打者擊出犧牲高飛打，出局於三壘',
//   '打者擊出犧牲高飛打，出局於本壘',
//   '打者擊出一壘安打，出局於二壘',
//   '打者擊出一壘安打，出局於三壘',
//   '打者擊出一壘安打，出局於本壘',
//   '打者擊出三壘安打，出局於本壘',
//   '根據判定，打席繼續',
//   '根據判定，打席結束',
// ];
