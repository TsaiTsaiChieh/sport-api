const modules = require('../../util/modules');
const errs = require('../../util/errorCode');

function predictInfo(args) {
  // args.token 從 cookie 取得 __session 中 token 需求token.uid
  // args 使用者送出json值

  return new Promise(async function(resolve, reject) {
    // 1. 取得 使用者身份 例：大神、玩家 (users status： 1 normal 玩家  2 god 大神)
    // 2. 取得 使用者 兩天內 預測資料，該比賽必需是賽前，預測資料 排序以 bets_id 為主

    const userUid = args.token.uid;
    const league = args.league;

    let predictionsInfoList = [];
    let response = {};

    // 1.  
    try{
      const memberInfo = await modules.firestore.collection('users').doc(userUid).get().then(data => {
        return data.data();
      });

      if(memberInfo === undefined) {
        // console.error('Error 1. in user/predictonInfoModell by YuHsien');
        return reject(errs.errsMsg('404', '1301')); // ${userUid}
      }

      if(!([1, 2].includes(memberInfo.status))) { // 不是 一般使用者、大神  管理者要操作，要另外建一個帳號
        // console.error('Error 1. in user/predictonInfoModell by YuHsien');
        return reject(errs.errsMsg('404', '1302'));
      }

      console.log("memberInfo status of statusSwitch: %o", statusSwitch(memberInfo.status));
    } catch (err) {
      console.error('Error 1. in user/predictonInfoModell by YuHsien', err);
      return reject(errs.errsMsg('500', '500', err));
    }

    // 2.
    try{
      const now_YYYYMMDD = modules.moment().utcOffset(8).format('YYYYMMDD'); // 今天 年月日
      const tomorrow_YYYYMMDD = modules.moment().add(1, 'days').utcOffset(8).format('YYYYMMDD'); // 今天 年月日
      const now = modules.moment(now_YYYYMMDD).unix() * 1000;
      const tomorrow = modules.moment(now_YYYYMMDD).add(2, 'days').unix() * 1000;

      // 使用者預測資訊
      const predictionsInfoDocs = await modules.firestore.collection(`prediction_${league}_TC`)
        .where('uid', '==', userUid)
        //.where('date_timestamp', '>=', now)
        //.where('date_timestamp', '<', tomorrow) // 兩天內
        .where('date', 'in', [tomorrow_YYYYMMDD, tomorrow_YYYYMMDD, '20200401']) // 兩天內
        .where('scheduled', '>', now) // 賽前 (scheduled 開賽時間 > api呼叫時間)
        .get();

      // 使用者 一開始尚未預測
      if(predictionsInfoDocs.size == 0) {
        // return reject(errs.errsMsg('404', '1303'));
        return resolve(predictionsInfoList); // 回傳 空Array
      }
      
      // 一個使用者，一天只會有一筆記錄
      // if(predictionsInfoDocs.size > 1) {
      //   // console.error('Error 2. in user/predictonInfoModell by YuHsien');
      //   return reject(errs.errsMsg('404', '1304'));
      // }
    
      let predictonsInfoData = []; // 使用者預測資訊
      // let matchInfoDocs = [];

      predictionsInfoDocs.forEach(function(data){
        predictonsInfoData.push(data.data());
      });

      // // 查詢 matches 賽事相關資料
      // predictonsInfoData.forEach(function(data) {
      //   for (const [key, value] of Object.entries(data.matches)) { 
      //     const matchInfoDoc = modules.firestore.collection(collectionCodebook(league))
      //       .where('flag.status', '==', 2) // 賽前
      //       .where('bets_id', '==', key)
      //       .get();
      //     matchInfoDocs.push(matchInfoDoc);
      //   }
      // });

      // // 將取回賽事資料進行整理，給repackage使用，屬於額外資訊
      // const matchesInfos = await Promise.all(matchInfoDocs).then(function(docs) { 
      //   const temp = {};
      //   docs.forEach(function(doc) {
      //     doc.forEach(function(ele){
      //       temp[ele.data().bets_id] = ele.data(); // ES6 才能使用[variable key]
      //     });
      //   });
      //   return temp;
      // });

      // 把賽事資料 重包裝格式
      groupBy(predictonsInfoData, 'league').forEach(function(data) { // 分聯盟陣列
        let league = '';
        data.forEach(function(ele) { // 取出 聯盟陣列中的賽事
          predictionsInfoList.push(
            repackage(ele) 
          );
          league = ele.league;
        });
        response[league] = predictionsInfoList;
        predictionsInfoList = [];
      });

      // predictonsInfoData.forEach(function(data) {
      //   predictionsInfoList.push(repackage(data));
      //   for (const [key, value] of Object.entries(data.matches)) {
      //     if (matchesInfos[key] === undefined) continue // 非賽前 (已開打、結束等) 不用處理打包
      //     predictionsInfoList.push( 
      //       repackage(value, {league: league, matchInfo: matchesInfos[key]} ) 
      //     );
      //   }
      // });
    } catch (err) {
      console.error('Error 2. in user/predictonInfoModell by YuHsien', err);
      return reject(errs.errsMsg('500', '500', err));
    }

    resolve(response);
    return;
  });
}

function statusSwitch(status) {
  switch (status) {
    case 1:
      return 'member';
    case 2:
      return 'god';
    case 9:
      return 'admin';
  }
}

function collectionCodebook(league) {
  switch (league) {
    case 'NBA':
      return modules.db.basketball_NBA;
    case 'MLB':
      return modules.db.baseball_MLB;
  }
}

function groupBy(arr, prop) {
  const map = new Map(Array.from(arr, obj => [obj[prop], []]));
  arr.forEach(obj => map.get(obj[prop]).push(obj));
  return Array.from(map.values());
}

function repackage(ele){
  let data = {
    bets_id: ele.bets_id,
    scheduled: ele.scheduled, // 開賽時間
    league: ele.league,
    home: ele.home.alias,
    home_ch: ele.home.alias_ch,
    away: ele.alias,
    away_ch: ele.alias_ch,
    spread: {},
    totals: {}
  };
  if( !(ele.spread === undefined) && Object.keys(ele.spread).length > 0) { // 有讓分資料
    data['spread'] = {
      predict: ele.spread.predict,
      handicap_id: ele.spread.handicap_id,
      handicap: ele.spread.handicap,
      percentage: Math.floor(Math.random()*50), // 目前先使用隨機數，將來有決定怎麼產生資料時，再處理
      bets: ele.spread.bets
    }
  }

  if( !(ele.totals === undefined) && Object.keys(ele.totals).length > 0) { // 有大小資料
    data['spread'] = {
      predict: ele.totals.predict,
      handicap_id: ele.totals.handicap_id,
      handicap: ele.totals.handicap,
      percentage: Math.floor(Math.random()*50), // 目前先使用隨機數，將來有決定怎麼產生資料時，再處理
      bets: ele.totals.bets
    }
  }

  return data;
}

// function repackage(value, addInfo) {
//   let data = {
//     bets_id: addInfo.matchInfo.bets_id,
//     scheduled: addInfo.matchInfo.scheduled._seconds, // 開賽時間
//     league: addInfo.league,
//     home: addInfo.matchInfo.home.alias_ch,
//     away: addInfo.matchInfo.away.alias_ch,
//     spread: {},
//     totals: {}
//   };

//   if( !(value.spread === undefined) && Object.keys(value.spread).length > 0) { // 有讓分資料
//     data['spread'] = {
//       predict: value.spread.predict,
//       handicap_id: value.spread.handicap_id, // 盤口id
//       handicap: value.spread.handicap,
//       percentage: Math.floor(Math.random()*50), // 目前先使用隨機數，將來有決定怎麼產生資料時，再處理
//       bets: value.spread.bets
//     }
//   }

//   if( !(value.totals === undefined) && Object.keys(value.totals).length > 0) { // 有大小資料
//     data['totals'] = {
//       predict: value.totals.predict,
//       handicap_id: value.totals.handicap_id,
//       handicap: value.totals.handicap,
//       percentage: Math.floor(Math.random()*50), // 目前先使用隨機數，將來有決定怎麼產生資料時，再處理
//       bets: value.totals.bets
//     }
//   }

//   return data;
// }

module.exports = predictInfo;
