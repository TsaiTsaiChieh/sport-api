const modules = require('../../util/modules');

function predictInfo(args) {
  // args.token 從 cookie 取得 __session 中 token 需求token.uid
  // args 使用者送出json值

  return new Promise(async function(resolve, reject) {
    // 1. 取得 使用者身份 例：大神、玩家 (users status： 1 normal 玩家  2 god 大神)
    // 2. 取得 使用者 預測資料，該比賽必需是賽前，預測資料 排序以 bets_id 為主

    const userUid = args.token.uid;
    const league = args.league;

    let predictionsInfoList = [];

    // 1.  
    try{
      const memberInfo = await modules.firestore.collection('users').doc(userUid).get().then(data => {
        return data.data();
      });

      if(memberInfo === undefined) {
        // console.error('Error 1. in user/predictonInfoModell by YuHsien');
        return reject({ code: 404, err: {errcode: '1301', errmsg: `使用者狀態異常`} }); // ${userUid}
      }

      if(!([1, 2].includes(memberInfo.status))) { // 不是 一般使用者、大神  管理者要操作，要另外建一個帳號
        // console.error('Error 1. in user/predictonInfoModell by YuHsien');
        return reject({ code: 404, err: {errcode: '1302', errmsg: `使用者狀態異常`} });
      }

      console.log("memberInfo status of statusSwitch: %o", statusSwitch(memberInfo.status));
    } catch (err) {
      console.error('Error 1. in user/predictonInfoModell by YuHsien', err);
      return reject({ code: 500, err: { errcode: '500', errmsg: err.message } });
    }
    
    // 2.
    try{
      // 使用者預測資訊
      const predictionsInfoDocs = await modules.firestore.collection(`prediction_${league}`)
        .where('uid', '==', userUid)
        .get();

      // 使用者 一開始尚未預測
      if(predictionsInfoDocs.size == 0) {
        // return reject({ code: 404, err: {errcode: '1303', errmsg: `使用者沒有預測單`} });
        return resolve(predictionsInfoList); // 回傳 空Array
      }
      
      // 一個使用者，一天只會有一筆記錄
      if(predictionsInfoDocs.size > 1) {
        // console.error('Error 2. in user/predictonInfoModell by YuHsien');
        return reject({ code: 404, err: {errcode: '1304', errmsg: `使用者一天只能擁有一份預測清單`} });
      }
    
      let predictonsInfoData = {}; // 使用者預測資訊
      let matchInfoDocs = [];

      predictionsInfoDocs.forEach(function(data){
        predictonsInfoData = data.data();
      });

      // 查詢 matches 賽事相關資料
      for (const [key, value] of Object.entries(predictonsInfoData.matches)) { 
        const matchInfoDoc = modules.firestore.collection(collectionCodebook(league))
          .where('flag.status', '==', 2) // 賽前
          .where('bets_id', '==', key)
          .get();
        matchInfoDocs.push(matchInfoDoc);
      }

      // 將取回賽事資料進行整理，給repackage使用，屬於額外資訊
      const matchesInfos = await Promise.all(matchInfoDocs).then(function(docs) { 
        const temp = {};
        docs.forEach(function(doc) {
          doc.forEach(function(ele){
            temp[ele.data().bets_id] = ele.data(); // ES6 才能使用[variable key]
          });
        });
        return temp;
      });

      // 把賽事資料 重包裝格式
      for (const [key, value] of Object.entries(predictonsInfoData.matches)) {
        if (matchesInfos[key] === undefined) continue // 非賽前 (已開打、結束等) 不用處理打包
        predictionsInfoList.push( 
          repackage(value, {league: league, matchInfo: matchesInfos[key]} ) 
        );
      }
    } catch (err) {
      console.error('Error 2. in user/predictonInfoModell by YuHsien', err);
      return reject({ code: 500, err: { errcode: '500', errmsg: err.message } });
    }

    resolve(predictionsInfoList);
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

function repackage(value, addInfo) {
  let data = {
    bets_id: addInfo.matchInfo.bets_id,
    scheduled: addInfo.matchInfo.scheduled._seconds, // 開賽時間
    league: addInfo.league,
    home: addInfo.matchInfo.home.alias_ch,
    away: addInfo.matchInfo.away.alias_ch,
    spread: {},
    totals: {}
  };

  if( !(value.spread === undefined) && Object.keys(value.spread).length > 0) { // 有讓分資料
    data['spread'] = {
      predict: value.spread.predict,
      handicap_id: value.spread.handicap_id, // 盤口id
      handicap: value.spread.handicap,
      percentage: Math.floor(Math.random()*50), // 目前先使用隨機數，將來有決定怎麼產生資料時，再處理
      bets: value.spread.bets
    }
  }

  if( !(value.totals === undefined) && Object.keys(value.totals).length > 00) { // 有大小資料
    data['totals'] = {
      predict: value.totals.predict,
      handicap_id: value.totals.handicap_id,
      handicap: value.totals.handicap,
      percentage: Math.floor(Math.random()*50), // 目前先使用隨機數，將來有決定怎麼產生資料時，再處理
      bets: value.totals.bets
    }
  }

  return data;
}

module.exports = predictInfo;
