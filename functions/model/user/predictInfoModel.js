const modules = require('../../util/modules');

function predictInfo(args) {
  // args.token 從 cookie 取得 __session 中 token 需求token.uid
  // args 使用者送出json值

  return new Promise(async function(resolve, reject) {
    // 1. 取得 使用者身份 例：大神、玩家 (users status： 1 normal 玩家  2 god 大神)
    // 2. 取得 使用者 預測資料，預測資料 排序以 bets_id 為主

    const userUid = args.token.uid;
    const league = args.league;

    let predictionsInfoList = [];

    // 1.  
    try{
      const memberInfo = await modules.firestore.collection('users').doc(userUid).get().then(data => {
        return data.data();
      });

      if(memberInfo===undefined) {
        console.error('Error 2. in personal/predictonInfoModell by YuHsien');
        return reject({ code: 500, error: `使用者不存在，請重新登入 ${userUid}` });
      }

      console.log("memberInfo status of statusSwitch: %o", statusSwitch(memberInfo.status));
    } catch (err) {
      console.error('Error 2. in personal/predictonInfoModell by YuHsien', err);
      return reject({ code: 500, error: err.message });
    }
    
    // 2.
    try{
      const predictionsInfoDocs = await modules.firestore.collection(`prediction_${league}`)
        .where('uid', '==', userUid)
        .get();

      if(predictionsInfoDocs.size == 0) {
        console.error('Error 2. in personal/predictonInfoModell by YuHsien');
        return reject({ code: 301, error: `User does not have predictions info.` });
      }
      
      // 一個使用者，一天只會有一筆記錄
      if(predictionsInfoDocs.size > 1) {
        console.error('Error 2. in personal/predictonInfoModell by YuHsien');
        return reject({ code: 302, error: `User cant not own predictions more than one predictions of one day.` });
      }

      // 查詢 matches 賽事相關資料
      let predictonsInfoData= {}; 
      let betsInfo = [];

      predictionsInfoDocs.forEach(function(data){
        predictonsInfoData = data.data();
      });

      for (const [key, value] of Object.entries(predictonsInfoData.matches)) { 
        const betsInfoQuery = modules.firestore.collection(collectionCodebook(league))
          .doc(key)
          .get();
        betsInfo.push(betsInfoQuery);
      }

      // 將取回賽事資料進行整理，給repackage使用，屬於額外資訊
      const betsInfos = await Promise.all(betsInfo).then(function(data) { 
        const temp = {};
        data.forEach(function(ele) {
          temp[ele.data().bets_id] = ele.data(); // ES6 才能使用[variable key]
        });
        return temp;
      });

      for (const [key, value] of Object.entries(predictonsInfoData.matches)) { 
        predictionsInfoList.push( 
          repackage(value, {league: league, betsInfo: betsInfos[key]} ) 
        );
      }
    } catch (err) {
      console.error('Error 2. in personal/predictonInfoModell by YuHsien', err);
      return reject({ code: 500, error: err.message });
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
//console.log(value)
  let data = {
    bets_id: addInfo.betsInfo.bets_id,
    scheduled: addInfo.betsInfo.scheduled,
    league: addInfo.league,
    home: addInfo.betsInfo.home.alias_ch,
    away: addInfo.betsInfo.away.alias_ch,
    spread: {},
    totals: {}
  };

  if( !(value.spread === undefined) && Object.keys(value.spread).length > 0) { // 沒有讓分資料
    data['spread'] = {
      predict: value.spread.predict,
      handicap_id: value.spread.handicap_id,
      handicap: value.spread.handicap,
      percentage: 50, // 目前先固定，將來有決定怎麼產生資料時，再處理
      bets: value.spread.bets
    }
  }

  if( !(value.totals === undefined) && Object.keys(value.totals).length > 00) { // 沒有大小資料
    data['totals'] = {
      predict: value.totals.predict,
      handicap_id: value.totals.handicap_id,
      handicap: value.totals.handicap,
      percentage: 50, // 目前先固定，將來有決定怎麼產生資料時，再處理
      bets: value.totals.bets
    }
  }

  return data;
}

module.exports = predictInfo;
