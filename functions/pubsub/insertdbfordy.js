const modules = require('../util/modules');

inserttest((handicapObj = { handicap: 0 }));
inserttest((handicapObj = { handicap: 0.0 }));
inserttest((handicapObj = { handicap: 0.25 }));
inserttest((handicapObj = { handicap: 0.75 }));
inserttest((handicapObj = { handicap: 1 }));
inserttest((handicapObj = { handicap: 1.0 }));
async function inserttest() {
  if (handicapObj.handicap === 0.0) {
    handicapObj.handicap = 0;
  }
  if (
    handicapObj.handicap % 1 !== 0 &&
    handicapObj.handicap < 0
    // handicapObj.home_odd === handicapObj.away_odd
  ) {
    // 賠率相同
    handicapObj.away_tw = `${Math.abs(Math.ceil(handicapObj.handicap))}輸`;
    handicapObj.home_tw = null;
    // handicapObj.away_tw = `${Math.ceil(Math.abs(handicapObj.handicap))}贏`;
  } else if (
    handicapObj.handicap % 1 !== 0 &&
    handicapObj.handicap >= 0
    // handicapObj.home_odd === handicapObj.away_odd
  ) {
    handicapObj.home_tw = `${Math.floor(handicapObj.handicap)}輸`;
    handicapObj.away_tw = null;
    // handicapObj.home_tw = `${Math.ceil(handicapObj.handicap)}贏`;
  } else if (
    handicapObj.handicap % 1 === 0 &&
    handicapObj.handicap >= 0 &&
    handicapObj.home_odd === handicapObj.away_odd
  ) {
    handicapObj.home_tw = `${handicapObj.handicap}平`;
    handicapObj.away_tw = null;
  } else if (
    handicapObj.handicap % 1 === 0 &&
    handicapObj.handicap < 0 &&
    handicapObj.home_odd === handicapObj.away_odd
  ) {
    handicapObj.away_tw = `${Math.abs(handicapObj.handicap)}平`;
    handicapObj.home_tw = null;
  } else if (
    handicapObj.handicap % 1 === 0 &&
    handicapObj.handicap >= 0 &&
    handicapObj.home_odd !== handicapObj.away_odd
  ) {
    // 盤口為正，代表主讓客，所以主要減
    if (handicapObj.home_odd > handicapObj.away_odd) {
      // handicapObj.home_tw = `-${handicapObj.handicap} +50`;
      handicapObj.away_tw = `+${handicapObj.handicap} -50`;
      handicapObj.home_tw = null;
    } else if (handicapObj.home_odd < handicapObj.away_odd) {
      handicapObj.away_tw = `+${handicapObj.handicap} +50`;
      handicapObj.home_tw = null;
      // handicapObj.home_tw = `-${handicapObj.handicap} -50`;
    }
    // console.log(handicapObj, id);
  } else if (
    // 盤口為負，代表客讓主，所以客要減
    handicapObj.handicap % 1 === 0 &&
    handicapObj.handicap < 0 &&
    handicapObj.home_odd !== handicapObj.away_odd
  ) {
    if (handicapObj.home_odd > handicapObj.away_odd) {
      handicapObj.home_tw = `+${Math.abs(handicapObj.handicap)} +50`;
      handicapObj.away_tw = null;
      // handicapObj.away_tw = `-${Math.abs(handicapObj.handicap)} -50`;
    } else if (handicapObj.home_odd < handicapObj.away_odd) {
      handicapObj.home_tw = `+${Math.abs(handicapObj.handicap)} -50`;
      handicapObj.away_tw = null;
      // handicapObj.away_tw = `-${Math.abs(handicapObj.handicap)} +50`;
    }
  }
  console.log(handicapObj);
}
