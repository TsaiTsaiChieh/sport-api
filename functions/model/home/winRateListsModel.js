const modules = require('../../util/modules');
const errs = require('../../util/errorCode');
const redis = require('redis');
const redisClient = redis.createClient(modules.redis.port, modules.redis.ip);//建立redis客戶端

function winRateLists(args) {
  return new Promise(async function(resolve, reject) {
    // 取得 首頁預設值
    const defaultValues = await modules.firestore.collection('doSports_settings').doc('home_win_rate').get()
    .then(function(data){
      return data.data()
    });

    // 將來如果要用 參數 或 後台參數 來鎖定聯盟，只要把格式改對應格式即可
    // let winRateLists = {
    //   NBA: [],
    //   MLB: []
    // }
    let winRateLists = {};
    winRateLists[defaultValues['league']] = []; // 像上面的範例
    
    /*有redis資料就撈，沒有就跑下面程式撈firebase資料*/
    redisClient.on('error', (err) => console.error('ERR:REDIS:', err));

    if(redisClient.connected){
      redisClient.get('win_rate_lists', function(err, result){
        if(result!=null){
          res = JSON.parse(result);
          resolve(res);
        }
      });
    }

    
    try {
      for (const [key, value] of Object.entries(winRateLists)) { // 依 聯盟 進行排序
        const leagueWinRateLists = []; // 儲存 聯盟處理完成資料

        const leagueWinRateListsQuery = await modules.firestore.collection(`users_win_lists_${key}`)
          .orderBy(`this_period_win_rate`, 'desc')
          .limit(5)
          .get();

        leagueWinRateListsQuery.forEach(function (data) { // 這裡有順序性
          leagueWinRateLists.push( repackage(data.data()) );
        });
        //Promise.all(results)

        winRateLists[key] = leagueWinRateLists;
        redisClient.set('win_rate_lists', JSON.stringify(winRateLists));////把資料存入redis
      }
    } catch (err) {
      console.log('Error in  home/godlists by YuHsien:  %o', err);
      return reject(errs.errsMsg('500', '500', err));
    }

    resolve({ win_rate_lists: winRateLists });
    return;
  });
}

function repackage(ele) {
  let data = {
    win_rate: '',
    uid: ele.uid,
    avatar: ele.avatar,
    displayname: ele.displayname,
    rank: ''
  };

  data['win_rate'] = ele[`this_period_win_rate`];
  data['rank'] = ele[`rank`];

  return data;
}

module.exports = winRateLists;
