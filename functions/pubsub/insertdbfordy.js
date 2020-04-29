const modules = require('../util/modules');

inserttest((handicapObj = { handicap: 5 }));

async function inserttest(handicapObj) {
  handicapObj.handicap = handicapObj.handicap.toString();

  if (handicapObj.handicap.indexOf(',') !== -1) {
    //同時有兩個盤口值
    const firstHandicap = parseFloat(handicapObj.handicap.split(',')[0]);
    const secondHandicap = parseFloat(handicapObj.handicap.split(',')[1]);

    if (firstHandicap % 1 !== 0) {
      //第一盤口為小數，則顯示為+
      if (firstHandicap >= 0) {
        //顯示在主隊區
        handicapObj.home_tw = secondHandicap + '+50';
        handicapObj.away_tw = null;
      } else {
        //顯示在客隊區
        handicapObj.home_tw = null;
        handicapObj.away_tw = Math.abs(secondHandicap) + '+50';
      }
    } else {
      //第一盤口為整數，則顯示為-
      if (firstHandicap >= 0) {
        //顯示在主隊區
        handicapObj.home_tw = firstHandicap + '-50';
        handicapObj.away_tw = null;
      } else {
        //顯示在客隊區
        handicapObj.home_tw = null;
        handicapObj.away_tw = Math.abs(firstHandicap) + '-50';
      }
    }
  } else {
    //只有一個盤口值
    handicapObj.handicap = parseFloat(handicapObj.handicap);

    if (handicapObj.handicap === 0) {
      //讓 0 分
      handicapObj.home_tw = 'pk(0+0)';
      handicapObj.away_tw = null;
    } else if (handicapObj.handicap % 1 === 0) {
      // 整數
      if (handicapObj.handicap >= 0) {
        //放在主隊區
        handicapObj.home_tw = handicapObj.handicap + '平';
        handicapObj.away_tw = null;
      } else {
        //放在客隊區
        handicapObj.home_tw = null;
        handicapObj.away_tw = Math.abs(handicapObj.handicap) + '平';
      }
    } else if (handicapObj.handicap % 1 !== 0) {
      // 小數
      if (handicapObj.handicap >= 0) {
        //放在主隊區
        handicapObj.home_tw = Math.floor(Math.abs(handicapObj.handicap)) + '輸';
        handicapObj.away_tw = null;
      } else {
        //放在客隊區
        handicapObj.home_tw = null;
        handicapObj.away_tw = Math.ceil(Math.abs(handicapObj.handicap)) + '輸';
      }
    }
  }
  // if (
  //   handicapObj.handicap % 1 !== 0 &&
  //   handicapObj.handicap < 0
  //   // handicapObj.home_odd === handicapObj.away_odd
  // ) {
  //   // 賠率相同
  //   handicapObj.away_tw = `${Math.abs(Math.ceil(handicapObj.handicap))}輸`;
  //   handicapObj.home_tw = null;
  //   // handicapObj.away_tw = `${Math.ceil(Math.abs(handicapObj.handicap))}贏`;
  // } else if (
  //   handicapObj.handicap % 1 !== 0 &&
  //   handicapObj.handicap >= 0
  //   // handicapObj.home_odd === handicapObj.away_odd
  // ) {
  //   handicapObj.home_tw = `${Math.floor(handicapObj.handicap)}輸`;
  //   handicapObj.away_tw = null;
  //   // handicapObj.home_tw = `${Math.ceil(handicapObj.handicap)}贏`;
  // } else if (
  //   handicapObj.handicap % 1 === 0 &&
  //   handicapObj.handicap >= 0 &&
  //   handicapObj.home_odd === handicapObj.away_odd
  // ) {
  //   handicapObj.home_tw = `${handicapObj.handicap}平`;
  //   handicapObj.away_tw = null;
  // } else if (
  //   handicapObj.handicap % 1 === 0 &&
  //   handicapObj.handicap < 0 &&
  //   handicapObj.home_odd === handicapObj.away_odd
  // ) {
  //   handicapObj.away_tw = `${Math.abs(handicapObj.handicap)}平`;
  //   handicapObj.home_tw = null;
  // } else if (
  //   handicapObj.handicap % 1 === 0 &&
  //   handicapObj.handicap >= 0 &&
  //   handicapObj.home_odd !== handicapObj.away_odd
  // ) {
  //   // 盤口為正，代表主讓客，所以主要減
  //   if (handicapObj.home_odd > handicapObj.away_odd) {
  //     // handicapObj.home_tw = `-${handicapObj.handicap} +50`;
  //     handicapObj.away_tw = `+${handicapObj.handicap} -50`;
  //     handicapObj.home_tw = null;
  //   } else if (handicapObj.home_odd < handicapObj.away_odd) {
  //     handicapObj.away_tw = `+${handicapObj.handicap} +50`;
  //     handicapObj.home_tw = null;
  //     // handicapObj.home_tw = `-${handicapObj.handicap} -50`;
  //   }
  //   // console.log(handicapObj, id);
  // } else if (
  //   // 盤口為負，代表客讓主，所以客要減
  //   handicapObj.handicap % 1 === 0 &&
  //   handicapObj.handicap < 0 &&
  //   handicapObj.home_odd !== handicapObj.away_odd
  // ) {
  //   if (handicapObj.home_odd > handicapObj.away_odd) {
  //     handicapObj.home_tw = `+${Math.abs(handicapObj.handicap)} +50`;
  //     handicapObj.away_tw = null;
  //     // handicapObj.away_tw = `-${Math.abs(handicapObj.handicap)} -50`;
  //   } else if (handicapObj.home_odd < handicapObj.away_odd) {
  //     handicapObj.home_tw = `+${Math.abs(handicapObj.handicap)} -50`;
  //     handicapObj.away_tw = null;
  //     // handicapObj.away_tw = `-${Math.abs(handicapObj.handicap)} +50`;
  //   }
  // }
  // console.log(handicapObj);
}
