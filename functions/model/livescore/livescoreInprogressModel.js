const modules = require('../../util/modules');
const AppErrors = require('../../util/AppErrors');
// 空行不用錢，多空行區分宣告變數和函數
async function livescoreInProgress(args) { // 不要全部都叫 livescore，全域搜尋還要過濾
  return new Promise(async function(resolve, reject) {
    try {
      // const { sport, league, date } = args; // 傳參太多另外取名比較好，看習慣看心情看長度看天氣
      const inplayMathes = queryInplayMatches(args); // function 注意單複數
      // const result = await reResult(sport, league, date);
      const result = await repackage(args, inplayMathes);
      resolve(result);
    } catch (err) {
      // console.error('Error in livescore/livescoreInProgressModel by DY', err); // 不用在 model 印啦通常在 controller 印，因為 model 的錯是會透過 promise 傳回 controller，這邊在印會印兩次
      reject(err);
    }
  });
}

function queryInplayMatches(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const begin = modules.convertTimezone(args.date);
      const end =
      modules.convertTimezone(args.date, {
        op: 'add',
        value: 1,
        unit: 'days'
      }) - 1;

      const queries = await modules.firestore // 變數命名也注意單複數
        .collection(modules.leagueCodebook(args.league).match)
        .where('flag.status', '==', modules.MATCH_STATUS.INPLAY) // 避免魔術數字
        .where('scheduled', '>=', begin)
        .where('scheduled', '<=', end)
        .get();

      const matches = [];
      // query.forEach((doc) => {
      //   eventData.push(doc.data());
      // });
      queries.map(function(doc) { // forEach 好像會改變原來的資料，也比 map 慢；還有要嘛就通通用傳統 function 要嘛就都 arrow function 不要很不一致
        matches.push(doc.data());
      });
      return resolve(await Promise.all(matches));
    } catch (err) {
      return reject(`${err.stack} by DY`);
    }
  });
}
// async function reResult(sport, league, time) { // 這個 function 根本只有呼叫跟 return 而已吧 ... 做的事情也太少，命名也很怪
//   const result = await repackage(sport, league, time);

//   return await Promise.all(result);
// }
// 一個 function 只做一件事，這個 function 做的事情太多了：他去資料庫要資料還要去打包資料，而且還沒有錯誤處理
async function repackage(args, matches) {
  // let leagueName;
  // if (league === 'eSoccer') {
  //   leagueName = `pagetest_${league}`;
  // } else {
  //   leagueName = `${sport}_${league}`;
  // }
  // 上面可以再變成下面這樣
  // const leagueName = league === 'eSoccer' ? `pagetest_${league}` : `${sport}_${league}`;

  // const begin = modules.convertTimezone(date);
  // const end =
  //   modules.convertTimezone(date, {
  //     op: 'add',
  //     value: 1,
  //     unit: 'days'
  //   }) - 1;

  // const query = await modules.firestore
  //   .collection(modules.leagueCodebook(league).match)
  //   .where('flag.status', '==', modules.matchStatus.inplay) // 避免魔術數字
  //   .where('scheduled', '>=', begin)
  //   .where('scheduled', '<=', end)
  //   .get();

  // query.forEach((doc) => {
  //   eventData.push(doc.data());
  // });

  // let scheduled;
  // const inprogressEvent = [];
  try {
    const data = [];
    for (let i = 0; i < matches.length; i++) {
      const ele = matches[i];
      // scheduled = new Date(eventData[i].scheduled * 1000).toLocaleString(
      //   'zh-TW',
      //   { timeZone: 'Asia/Taipei' }
      // );
      // scheduled = scheduled.split(' ')[0]; // 為啥要這麼長
      const temp = {
        id: ele.bets_id,
        status: ele.flag.status, // 好啦我的確可能會放狀態，雖然可能他們用不到
        league: args.league,
        league_ch: ele.league.name_ch,
        scheduled: ele.scheduled._seconds * 1000, // 偷偷告訴你我都叫前端自己乘以 1000
        newest_spread: {
          handicap: ele.newest_spread ? ele.newest_spread.handicap : null, // null 比 no data 好，因為用 ! 就可以反運算
          home_tw: ele.newest_spread ? ele.newest_spread.home_tw : null,
          away_tw: ele.newest_spread ? ele.newest_spread.away_tw : null
        },
        group: args.league === 'eSoccer' ? ele.league.name : null, // 電競足球的子分類叫 league 我覺得不是很合理欸，所以改成 group
        home: {
          team_name: ele.home.team_name,
          player_name: ele.home.player_name,
          name: ele.home.name,
          name_ch: ele.home.name_ch,
          alias: ele.home.alias,
          alias_ch: ele.home.alias_ch,
          image_id: ele.home.image_id
        },
        away: {
          team_name: ele.away.team_name,
          player_name: ele.away.player_name,
          name: ele.away.name,
          name_ch: ele.away.name_ch,
          alias: ele.away.alias,
          alias_ch: ele.away.alias_ch,
          image_id: ele.away.image_id
        }
      };
      // let newestSpread;
      // if (eventData[i].newest_spread) {
      //   newestSpread = eventData[i].newest_spread;
      // } else {
      //   newestSpread = {
      //     handicap: 'no data',
      //     home_tw: 'no data',
      //     away_tw: 'no data'
      //   };
      // }
      // let newestTotal;
      // if (eventData[i].newest_total) {
      //   newestTotal = eventData[i].newest_total;
      // } else {
      //   newestTotal = {
      //     handicap: 'no data',
      //     over_tw: 'no data'
      //   };
      // }
      // if (league === 'eSoccer') {
      //   league = eventData[i].league.name;
      // } // ?????? 看不懂，因為我看資料庫也叫 eSoccer
      // 1 目前當天有幾場比賽進行中

      //   inprogressEvent.push({
      //     sport: sport, // 看起來好像不需要這個回傳值
      //     league: eventData[i].league.name_ch,
      //     ori_league: eventData[i].league.name,
      //     scheduled: eventData[i].scheduled * 1000,
      //     home: {
      //       team_name: eventData[i].home.team_name,
      //       player_name: eventData[i].home.player_name,
      //       name: eventData[i].home.name,
      //       name_ch: eventData[i].home.name_ch,
      //       alias: eventData[i].home.alias,
      //       alias_ch: eventData[i].home.alias_ch,
      //       image_id: eventData[i].home.image_id
      //     },
      //     away: {
      //       team_name: eventData[i].away.team_name,
      //       player_name: eventData[i].away.player_name,
      //       name: eventData[i].away.name,
      //       name_ch: eventData[i].away.name_ch,
      //       alias: eventData[i].away.alias,
      //       alias_ch: eventData[i].away.alias_ch,
      //       image_id: eventData[i].away.image_id
      //     },
      //     newest_spread: {
      //       handicap: newestSpread.handicap,
      //       home_tw: newestSpread.home_tw,
      //       away_tw: newestSpread.away_tw
      //     },
      //     flag: {
      //       status: eventData[i].flag.status // 為什麼要告訴前端狀態，Debug 嗎？
      //     },
      //     bets_id: eventData[i].bets_id
      //   });
      // }
      // 突然內部變數命名有點太認真了起來很不必要，反而是 function 命名很隨便
      // 因為 function 功能切得越簡單，scope 越小，變數可以越少，變數的取名自然就不用太複雜，所以反而是 function 的命名一開始要想好，用 function name 來代替註解最好
      // return inprogressEvent;
      data.push(temp);
    }
    return data;
  } catch (err) {
    console.error(`${err.stack} by DY`);
    throw AppErrors.RepackageError(`${err.stack} by DY`);
  }
}
module.exports = livescoreInProgress;
