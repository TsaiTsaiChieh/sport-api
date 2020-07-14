const db = require('./dbUtil');
const errs = require('./errorCode');
const to = require('await-to-js').default;
const {
  topicCheckByDateBetween, predictMatchCheckByDateBetween
} = require('../model/mission/missionFuncModel');
const { date3UnixInfo } = require('./modules');

//
// 任務
//

// [新增] 使用者任務 的 預設狀態  1: 領取
// 活動觸發 有些任務 新增 使用者任務 的 預設狀態  2: 已完成
// parms: mission_item_id, mission_god_id, mission_deposit_id, status, dateUnix
async function addUserMissionStatus(uid, parms, trans = null) {
  const insideTrans = trans || await db.sequelize.transaction();
  parms = Object.assign({}, { status: 1, dateUnix: null }, parms); // 給預設值

  const whereSql = { uid: uid };
  const defaultSql = { uid: uid, status: parms.status, date_timestamp: parms.dateUnix };

  // 處理 id 可能來源 item or god or deposit
  if (parms.mission_item_id) {
    whereSql.mission_item_id = parms.mission_item_id;
    defaultSql.mission_item_id = parms.mission_item_id;
  }

  if (parms.mission_god_id) {
    whereSql.mission_god_id = parms.mission_god_id;
    defaultSql.mission_god_id = parms.mission_god_id;
  }

  if (parms.mission_deposit_id) {
    whereSql.mission_deposit_id = parms.mission_deposit_id;
    defaultSql.mission_deposit_id = parms.mission_deposit_id;
  }

  if (parms.dateUnix) {
    whereSql.date_timestamp = parms.dateUnix;
    defaultSql.date_timestamp = parms.dateUnix;
  }

  // eslint-disable-next-line no-unused-vars
  let err, r, created;

  try {
    [err, [r, created]] = await to(db.UserMission.findOrCreate({
      where: whereSql,
      defaults: defaultSql,
      transaction: insideTrans
    }));
  } catch (e) {
    console.error('[addUserMissionStatus]', err);
    await insideTrans.rollback();
    throw errs.dbErrsMsg('404', '15110', { addMsg: err.parent.code });
  }

  // if (!created) {
  //   [err, r] = await to(setUserMissionStatus(uid, id, status, dateUnix));
  //   if (err) {console.error(err); throw errs.dbErrsMsg('404', '15016', { addMsg: err.parent.code });}
  // }
  if (!trans) await insideTrans.commit(); // trans 為外面呼叫帶入，不可以 commit
  return created;
}

// [更新] 使用者任務 的 狀態  0: 前往(預設)  1: 領取  2: 已完成
// parms { mission_item_id: ooxx } or { mission_god_id: ooxx } or { mission_deposit_id: ooxx } status, dateUnix
// parms status 部份需要特別注意，一些活動(大神產生、購買獎勵) user__missions 是沒有資料的
async function setUserMissionStatus(uid, parms, updateStatus, trans = null) {
  const insideTrans = trans || await db.sequelize.transaction();
  parms = Object.assign({}, { dateUnix: null }, parms); // 給預設值

  const whereSql = { uid: uid };

  if (parms.mission_item_id) whereSql.mission_item_id = parms.mission_item_id;
  if (parms.mission_god_id) whereSql.mission_god_id = parms.mission_god_id;
  if (parms.mission_deposit_id) whereSql.mission_deposit_id = parms.mission_deposit_id;
  if (!parms.mission_item_id && !parms.mission_god_id && !parms.mission_deposit_id) throw errs.errsMsg('404', '15014');

  if (parms.status) whereSql.status = parms.status;
  if (parms.dateUnix) whereSql.date_timestamp = parms.dateUnix;

  const [err, r] = await to(db.UserMission.update({
    status: updateStatus
  }, {
    where: whereSql,
    transaction: insideTrans
  }));

  if (err) {
    console.error(err);
    await insideTrans.rollback();
    throw errs.dbErrsMsg('404', '15010', { addMsg: err.parent.code });
  }

  // 結果檢查交給呼叫者
  // if (r[0] !== 1) { throw errs.dbErrsMsg('404', '15012');}
  if (!trans) await insideTrans.commit();
  return r;
}

//
// Mission Daily
//
async function missionDaily(args) {
  // 要區分 未登入、已登入
  const userUid = !args.token ? null : args.token.uid; // 需要判斷 有登入的話，有 uesr uid

  const nowInfo = date3UnixInfo(Date.now());
  const todayUnix = nowInfo.dateBeginUnix;

  const result = { daily: [] };

  //
  // 未登入處理
  //
  if (!userUid) {
    const missionLists = await dailyMission(todayUnix);
    if (missionLists.length === 0) return result; // 回傳 空Array

    for (const data of Object.values(missionLists)) {
      data.status = 0;
      data.now_finish_nums = 0;
      result.daily.push(repackageDaily(data));
    }
    return result;
  }

  //
  // 已登入處理
  //
  const missionLists = await dailyMissionLogin(userUid, todayUnix);
  if (missionLists.length === 0) return result; // 回傳 空Array

  for (const data of Object.values(missionLists)) {
    data.now_finish_nums = 0;

    if (data.func_type === 'topicCheckByDateBetween') { // 發文
      const topics = await topicCheckByDateBetween(userUid, todayUnix, todayUnix, [2, 3, 4]);
      data.now_finish_nums = topics[0].count;
    }

    if (data.func_type === 'predictMatchCheckByDateBetween') { // 預測
      const matchs = await predictMatchCheckByDateBetween(userUid, todayUnix, todayUnix);
      data.now_finish_nums = matchs[0].count;
    }

    const ifFinishMission = data.need_finish_nums === data.now_finish_nums;

    // 第一次 滿足條件 的 查詢 時，會寫一筆資料到 user__missions  status = 1 領取
    //   !data.status 為 undefined、null 代表 user_mission 尚未有資料，一但有資料必為 1: 領取  2: 已完成
    //    userUid !== undefined or null 使用者登入
    //   ifFinishMission 任務完成
    // 新增 領取 資料
    if (!data.status && userUid && ifFinishMission) {
      data.status = 1;
      const [err] = await to(addUserMissionStatus(userUid,
        { mission_item_id: data.mission_item_id, dateUnix: todayUnix })); // status: data.status, 如果新增是已完成，這裡需要設定為2
      if (err) {console.error(err); throw errs.dbErrsMsg('404', '15110', { addMsg: err.parent.code });}

      result.daily.push(repackageDaily(data));
      continue;
    }

    result.daily.push(repackageDaily(data));
  };

  return result;
}

function repackageDaily(ele) {
  const data = {
    title: ele.title,
    desc: ele.desc, // 開賽時間
    start_date: !ele.start_date ? '' : ele.start_date,
    end_date: !ele.end_date ? '' : ele.end_date,
    item_id: !ele.mission_item_id ? '' : ele.mission_item_id,
    target: ele.target,
    reward_class: ele.reward_class, // 獎勵類型 0: 單一獎勵  1: 不同角色不同獎勵
    reward_type: ele.reward_type, // 獎勵幣型 ingot: 搞錠  coin: 搞幣  dividend: 紅利
    reward_num: ele.reward_num,
    reward_class_num: ele.reward_class === 1 ? ele.reward_class_num : '',
    status: !ele.status ? 0 : ele.status, // 任務狀態 0: 前往(預設)  1: 領取  2: 已完成
    need_finish_nums: ele.need_finish_nums,
    now_finish_nums: ele.now_finish_nums
  };

  return data;
}

async function dailyMission(todayUnix) {
  const missions = await db.sequelize.query(`
    select missions.title, missions.desc, missions.start_date, missions.end_date,
           missions.need_finish_nums,
           mission_items.mission_item_id, mission_items.func_type, mission_items.target,
           mission_items.reward_class, mission_items.reward_type, 
           mission_items.reward_num, mission_items.reward_class_num
      from missions, mission_items
     where missions.mission_id = mission_items.mission_id
       and missions.type = 0
       and missions.status = 1
       and :todayUnix between start_date and end_date
  `, {
    replacements: {
      todayUnix: todayUnix
    },
    type: db.sequelize.QueryTypes.SELECT
  });

  return missions;
}

async function dailyMissionLogin(uid, todayUnix) {
  const missions = await db.sequelize.query(`
    select mission.*, 
           user__missions.id, user__missions.uid,
           user__missions.mission_god_id, user__missions.mission_deposit_id,
           user__missions.status, user__missions.date_timestamp
      from (
             select missions.title, missions.desc, missions.start_date, missions.end_date,
                    missions.need_finish_nums,
                    mission_items.mission_item_id, mission_items.func_type, mission_items.target,
                    mission_items.reward_class, mission_items.reward_type, 
                    mission_items.reward_num, mission_items.reward_class_num
              from missions, mission_items
             where missions.mission_id = mission_items.mission_id
               and missions.type = 0
               and missions.status = 1
               and :todayUnix between start_date and end_date
           ) mission
      left join user__missions
        on mission.mission_item_id = user__missions.mission_item_id
       and date_timestamp = :todayUnix
       and (isnull(:uid) or user__missions.uid = :uid)
  `, {
    replacements: {
      todayUnix: todayUnix,
      uid: uid
    },
    type: db.sequelize.QueryTypes.SELECT
  });

  return missions;
}

module.exports = {
  addUserMissionStatus,
  setUserMissionStatus,

  missionDaily,
  dailyMission,
  dailyMissionLogin
};
