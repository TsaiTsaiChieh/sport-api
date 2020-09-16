const db = require('./dbUtil');
const errs = require('./errorCode');
const to = require('await-to-js').default;
const {
  topicCheckByDateBetween, predictHandicapCheckByDateBetween,
  predictCorrectDailyByDateBetween, predictCorrectLeagueDailyByDateBetween
} = require('../model/mission/missionFuncModel');
const { date3UnixInfo, moment } = require('./modules');
const { logger } = require('./loggerUtil');
const { CacheQuery, redis } = require('./redisUtil');

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
    // eslint-disable-next-line no-unused-vars
    [err, [r, created]] = await to(db.UserMission.findOrCreate({
      where: whereSql,
      defaults: defaultSql,
      transaction: insideTrans
    }));
  } catch (e) {
    logger.warn('[addUserMissionStatus]', err);
    await insideTrans.rollback();
    throw errs.dbErrsMsg('404', '15110', { addMsg: err.parent.code });
  }

  // if (!created) {
  //   [err, r] = await to(setUserMissionStatus(uid, id, status, dateUnix));
  //   if (err) {logger.warn(err); throw errs.dbErrsMsg('404', '15016', { addMsg: err.parent.code });}
  // }
  if (!trans) await insideTrans.commit(); // trans 為外面呼叫帶入，不可以 commit
  await redis.specialDel(`*${uid}*Mission*`, 100);
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
  if (!parms.mission_item_id && !parms.mission_god_id && !parms.mission_deposit_id) {
    await insideTrans.rollback();
    throw errs.errsMsg('404', '15014');
  }

  if (parms.status) whereSql.status = parms.status;
  // if (parms.dateUnix) whereSql.date_timestamp = parms.dateUnix;

  const [err, r] = await to(db.UserMission.update({
    status: updateStatus
  }, {
    where: whereSql,
    transaction: insideTrans
  }));

  if (err) {
    logger.warn('[Error][missionUtil][setUserMissionStatus][UserMission] ', err);
    await insideTrans.rollback();
    throw errs.dbErrsMsg('404', '15010', { addMsg: err.parent.code });
  }
  // 結果檢查交給呼叫者
  // if (r[0] !== 1) { throw errs.dbErrsMsg('404', '15012');}
  if (!trans) await insideTrans.commit();
  await redis.specialDel(`*${uid}*Mission*`, 100);
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
  const today = moment(nowInfo.mdate).format("YYYY-MM-DD");

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
      const topics = await topicCheckByDateBetween(userUid, todayUnix, todayUnix, [3, 4, 5]);
      data.now_finish_nums = topics.length > 0 ? topics[0].count : 0;
    }

    if (data.func_type === 'predictHandicapCheckByDateBetween') { // 預測
      const matchs = await predictHandicapCheckByDateBetween(userUid, today);
      data.now_finish_nums = matchs.length > 0 ? matchs[0].count : 0;
    }

    const ifFinishMission = data.now_finish_nums >= data.need_finish_nums; // 現在完成任務數 > 需要完成任務數 => 任務完成
    if (ifFinishMission) data.now_finish_nums = data.need_finish_nums; // 有可能任務數 現在完成 > 需要完成，看起來很怪

    // 第一次 滿足條件 的 查詢 時，會寫一筆資料到 user__missions  um_status = 1 領取
    //   !data.status 為 undefined、null 代表 user_mission 尚未有資料，一但有資料必為 1: 領取  2: 已完成
    //    userUid !== undefined or null 使用者登入 (上面有判斷了，理論上是多餘的)
    //   ifFinishMission 任務完成
    // 新增 領取 資料
    if (!data.um_status && userUid && ifFinishMission) {
      data.um_status = 1;
      const [err] = await to(addUserMissionStatus(userUid,
        { mission_item_id: data.mission_item_id, dateUnix: todayUnix })); // status: data.status, 如果新增是已完成，這裡需要設定為2
      if (err) {
        logger.warn('[Error][missionUtil][missionDaily][addUserMissionStatus] ', err);
        throw errs.dbErrsMsg('404', '15110', { addMsg: err.parent.code });
      }

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
    id: !ele.mission_item_id ? '' : ele.mission_item_id,
    type: !ele.mission_item_id ? '' : 'mission_item',
    target: ele.target,
    reward_class: ele.reward_class, // 獎勵類型 0: 單一獎勵  1: 不同角色不同獎勵
    reward_type: ele.reward_type, // 獎勵幣型 ingot: 搞錠  coin: 搞幣  dividend: 紅利
    reward_num: ele.reward_num,
    reward_class_num: ele.reward_class === 1 ? ele.reward_class_num : '',
    status: !ele.um_status ? 0 : ele.um_status, // 任務狀態 0: 前往(預設)  1: 領取  2: 已完成
    need_finish_nums: ele.need_finish_nums,
    now_finish_nums: ele.now_finish_nums
  };

  return data;
}

async function dailyMission(todayUnix) {
  const redisKey = ['daily', 'Mission', todayUnix].join(':');
  const missions = await CacheQuery(db.sequelize, `
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
  }, redisKey);

  return missions;
}

async function dailyMissionLogin(uid, todayUnix) {
  const missions = await db.sequelize.query(`
    select mission.*, 
           user__missions.id, user__missions.uid,
           user__missions.mission_item_id um_mission_item_id, 
           user__missions.mission_god_id um_mission_god_id, 
           user__missions.mission_deposit_id um_mission_deposit_id,
           user__missions.status um_status, user__missions.date_timestamp
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

//
// Mission Activity God
//
async function missionActivityGod(args) {
  // 要區分 未登入、已登入
  const userUid = !args.token ? null : args.token.uid; // 需要判斷 有登入的話，有 uesr uid

  const nowInfo = date3UnixInfo(Date.now());
  const todayUnix = nowInfo.dateBeginUnix;

  const result = [];

  //
  // 未登入處理
  //
  if (!userUid) {
    // 活動 大神
    const activityGodLists = await activityGodMission(todayUnix);
    if (activityGodLists.length > 0) {
      for (const data of Object.values(activityGodLists)) {
        data.status = 0;
        data.now_finish_nums = 0;
        result.push(repackageActivityGod(data));
      }
    }
    return result;
  }

  //
  // 已登入處理
  //
  // 任務 大神
  const activityGodLists = await activityGodMissionLogin(userUid, todayUnix);

  if (activityGodLists.length > 0) {
    for (const data of Object.values(activityGodLists)) {
      data.now_finish_nums = (data.um_status === 1 || data.um_status === 2) ? 1 : 0; // 已完成的情況下，現在完成任務量要為 1
      result.push(repackageActivityGod(data));
    };
  }

  return result;
}

function repackageActivityGod(ele) {
  const data = {
    title: ele.title,
    desc: ele.desc, // 開賽時間
    start_date: !ele.start_date ? '' : ele.start_date,
    end_date: !ele.end_date ? '' : ele.end_date,
    id: !ele.mission_god_id ? '' : ele.mission_god_id,
    type: !ele.mission_god_id ? '' : 'mission_god',
    target: ele.target,
    reward_class: 1, // ele.reward_class, // 虛擬欄位 獎勵類型 0: 單一獎勵  1: 不同角色不同獎勵
    reward_type: ele.reward_type, // 獎勵幣型 ingot: 搞錠  coin: 搞幣  dividend: 紅利
    reward_num: ele.diamond_reward, // ele.reward_num,
    reward_class_num: ele.copper_reward, // ele.reward_class === 1 ? ele.reward_class_num : ''
    status: !ele.um_status ? 0 : ele.um_status, // 任務狀態 0: 前往(預設)  1: 領取  2: 已完成
    need_finish_nums: ele.need_finish_nums,
    now_finish_nums: ele.now_finish_nums
  };

  return data;
}

async function activityGodMission(todayUnix) {
  const redisKey = ['activity', 'God', 'Mission', todayUnix].join(':');
  const missions = await CacheQuery(db.sequelize, `
    select missions.title, missions.desc, missions.start_date, missions.end_date,
           missions.need_finish_nums,
           mission_gods.mission_god_id, mission_gods.target, mission_gods.reward_type, 
           mission_gods.diamond_reward, mission_gods.gold_reward,
           mission_gods.sliver_reward, mission_gods.copper_reward
      from missions, mission_gods
     where missions.mission_id = mission_gods.mission_id
       and missions.type = 2
       and missions.activity_type = 'god'
       and missions.status = 1
       and :todayUnix between start_date and end_date
  `, {
    replacements: {
      todayUnix: todayUnix
    },
    type: db.sequelize.QueryTypes.SELECT
  }, redisKey);

  return missions;
}

async function activityGodMissionLogin(uid, todayUnix) {
  const missions = await db.sequelize.query(`
    select mission_god.*,
           user__missions.id um_id, user__missions.uid um_uid,
           user__missions.mission_item_id um_mission_item_id, 
           user__missions.mission_god_id um_mission_god_id, 
           user__missions.mission_deposit_id um_mission_deposit_id,
           user__missions.status um_status, user__missions.date_timestamp um_date_timestamp
      from (
             select missions.title, missions.desc, missions.start_date, missions.end_date,
                    missions.need_finish_nums,
                    mission_gods.mission_god_id, mission_gods.target, mission_gods.reward_type, 
                    mission_gods.diamond_reward, mission_gods.gold_reward,
                    mission_gods.sliver_reward, mission_gods.copper_reward
               from missions, mission_gods
              where missions.mission_id = mission_gods.mission_id
                and missions.type = 2
                and missions.activity_type = 'god'
                and missions.status = 1
               
           ) mission_god
      left join user__missions
        on mission_god.mission_god_id = user__missions.mission_god_id
       and user__missions.uid = :uid
  `, {
    replacements: {
      todayUnix: todayUnix,
      uid: uid
    },
    type: db.sequelize.QueryTypes.SELECT
  });

  return missions;
}

// "大神產生完" 後，判斷是否有活動 且 首次為大神 回傳對應應該給予的獎勵
async function activityGodCheckStatusReturnReward(uid, todayUnix) {
  const mission = await activityGodMissionLogin(uid, todayUnix);
  const result = [];

  for (const data of Object.values(mission)) { // um 為 user_missions table
    if (data.length <= 0) continue; // 無活動, 無效 或 已領(有資料)

    // 是否首次大神
    // const titlesCount = await db.sequelize.query(`
    //   select count(*) as count from titles where uid=:uid
    // `, {
    //   replacements: {
    //     uid: uid
    //   },
    //   raw: true,
    //   type: db.sequelize.QueryTypes.SELECT
    // });

    // true: 有活動, 有效
    if (data.um_mission_god_id !== undefined) { // 必需是 沒有領取過 且 首次為大神 才會出現
      result.push({
        mission_god_id: data.mission_god_id,
        reward_type: data.reward_type,
        diamond_reward: data.diamond_reward ? data.diamond_reward : 0,
        gold_reward: data.gold_reward ? data.gold_reward : 0,
        sliver_reward: data.sliver_reward ? data.sliver_reward : 0,
        copper_reward: data.copper_reward ? data.copper_reward : 0
      });
      console.log(result);
    }
  };

  return result;
}

//
// Mission Activity Deposit
//
async function missionActivityDeposit(args) {
  // 要區分 未登入、已登入
  const userUid = !args.token ? null : args.token.uid; // 需要判斷 有登入的話，有 uesr uid

  const nowInfo = date3UnixInfo(Date.now());
  const todayUnix = nowInfo.dateBeginUnix;

  const result = [];

  //
  // 未登入處理
  //
  if (!userUid) {
    const activityDepositLists = await activityDepositMission(todayUnix);
    if (activityDepositLists.length > 0) {
      for (const data of Object.values(activityDepositLists)) {
        data.status = 0;
        data.now_finish_nums = 0;
        result.push(repackageActivityDeposit(data));
      }
    }
    return result;
  }

  //
  // 已登入處理
  //
  // 任務 儲值
  const activityDepositLists = await activityDepositMissionLogin(userUid, todayUnix);
  if (activityDepositLists.length > 0) {
    for (const data of Object.values(activityDepositLists)) {
      data.now_finish_nums = (data.um_status === 2) ? 1 : 0; // 已完成的情況下，現在完成任務量要為 1
      result.push(repackageActivityDeposit(data));
    };
  }

  return result;
}

function repackageActivityDeposit(ele) {
  const data = {
    title: ele.title,
    desc: ele.desc, // 開賽時間
    start_date: !ele.start_date ? '' : ele.start_date,
    end_date: !ele.end_date ? '' : ele.end_date,
    id: !ele.mission_deposit_id ? '' : ele.mission_deposit_id,
    type: !ele.mission_deposit_id ? '' : 'mission_deposit',
    target: ele.target,
    reward_class: 0, // ele.reward_class, // 虛擬欄位 獎勵類型 0: 單一獎勵  1: 不同角色不同獎勵
    reward_type: ele.reward_type, // 獎勵幣型 ingot: 搞錠  coin: 搞幣  dividend: 紅利  lottery: 彩卷
    reward_num: ele.reward_num,
    reward_class_num: ele.reward_class === 1 ? ele.reward_class_num : '',
    status: !ele.um_status ? 0 : ele.um_status, // 任務狀態 0: 前往(預設)  1: 領取  2: 已完成
    need_finish_nums: ele.need_finish_nums,
    now_finish_nums: ele.now_finish_nums
  };

  return data;
}

async function activityDepositMission(todayUnix) {
  const redisKey = ['activity', 'Deposit', 'Mission', todayUnix].join(':');
  const missions = await CacheQuery(db.sequelize, `
    select missions.title, missions.desc, missions.start_date, missions.end_date,
           missions.need_finish_nums,
           mission_deposits.mission_deposit_id, mission_deposits.target,
           mission_deposits.reward_type, mission_deposits.reward_num
      from missions, mission_deposits
     where missions.mission_id = mission_deposits.mission_id
       and missions.type = 2
       and missions.activity_type = 'deposit'
       and missions.status = 1
       and :todayUnix between start_date and end_date
  `, {
    replacements: {
      todayUnix: todayUnix
    },
    type: db.sequelize.QueryTypes.SELECT
  }, redisKey);

  return missions;
}

async function activityDepositMissionLogin(uid, todayUnix) {
  const missions = await db.sequelize.query(`
    select mission_deposit.*,
           user__missions.id um_id, user__missions.uid um_uid,
           user__missions.mission_item_id um_mission_item_id, 
           user__missions.mission_god_id um_mission_god_id, 
           user__missions.mission_deposit_id um_mission_deposit_id,
           user__missions.status um_status, user__missions.date_timestamp um_date_timestamp
      from (
             select missions.title, missions.desc, missions.start_date, missions.end_date,
                    missions.need_finish_nums,
                    mission_deposits.mission_deposit_id, mission_deposits.target,
                    mission_deposits.reward_type, mission_deposits.reward_num
               from missions, mission_deposits
              where missions.mission_id = mission_deposits.mission_id
                and missions.type = 2
                and missions.activity_type = 'deposit'
                and missions.status = 1
                
           ) mission_deposit
      left join user__missions
        on mission_deposit.mission_deposit_id = user__missions.mission_deposit_id
       and user__missions.uid = :uid
  `, {
    replacements: {
      todayUnix: todayUnix,
      uid: uid
    },
    type: db.sequelize.QueryTypes.SELECT
  });

  return missions;
}

// "使用者儲值" 後，判斷是否有活動 且 首次儲值 回傳對應應該給予的獎勵
async function activityDepositsCheckStatusReturnReward(uid, todayUnix) {
  const mission = await activityDepositMissionLogin(uid, todayUnix);
  const result = [];

  for (const data of Object.values(mission)) { // um 為 user_missions table
    console.log(data, data.length, mission, mission.length, data.um_uid);
    if (data.length <= 0) continue; // 無活動, 無效 或 已領(有資料)

    // 是否首次儲值
    const depositCount = await db.CashflowDeposit.count({
      where: {
        uid: uid,
        order_status: 1
      }
    });
    console.log(depositCount);
    // true: 有活動, 有效
    if (data.um_mission_deposit_id !== undefined && depositCount === 1) { // 必需是 沒有領取過 且 首次儲值 才會出現
      result.push({
        mission_deposit_id: data.mission_deposit_id,
        reward_type: data.reward_type,
        reward_num: data.reward_num ? data.reward_num : 0
      });
    }
    console.log(result);
  };
  return result;
}

//
// Mission Activity Predict
//
async function missionActivityPredict(args) {
  // 要區分 未登入、已登入
  const userUid = !args.token ? null : args.token.uid; // 需要判斷 有登入的話，有 uesr uid

  const nowInfo = date3UnixInfo(Date.now());
  const todayUnix = nowInfo.dateBeginUnix;

  const result = [];

  //
  // 未登入處理
  //
  if (!userUid) {
    const missionLists = await activityPredictMission(todayUnix);
    if (missionLists.length === 0) return result; // 回傳 空Array

    for (const data of Object.values(missionLists)) {
      data.status = 0;
      data.now_finish_nums = 0;
      result.push(repackageDaily(data));
    }
    return result;
  }

  //
  // 已登入處理
  //
  const missionLists = await activityPredictMissionLogin(userUid, todayUnix);
  if (missionLists.length === 0) return result; // 回傳 空Array

  for (const data of Object.values(missionLists)) {
    data.now_finish_nums = 0;

    // predicts 任務期間內 日期-聯盟 正確盤數  old_correct_count 多筆時記錄最大正確盤數
    let predictsInfo, old_correct_count;

    if (data.func_type === 'predictCorrectLeagueDailyByDateBetween') { // 預測 同聯盟 正確盤數 correct_count
      predictsInfo = await predictCorrectLeagueDailyByDateBetween(userUid, data.start_date, data.end_date);
    }

    if (data.func_type === 'predictCorrectDailyByDateBetween') { // 預測 不同聯盟 正確盤數 correct_count
      predictsInfo = await predictCorrectDailyByDateBetween(userUid, data.start_date, data.end_date);
    }

    if (!predictsInfo) continue; // null or undefined 情況，略過底下不處理

    // 處理 需要完成任務盤數 和 現在完成任務盤數 並 記錄目前完成最大正確盤數
    for (const ele of Object.values(predictsInfo)) {
      if (ele.correct_count >= data.need_finish_nums) { // 完成任務
        data.now_finish_nums = data.need_finish_nums;
        break;
      }

      old_correct_count = !old_correct_count ? ele.correct_count
        : ele.correct_count > old_correct_count ? ele.correct_count : old_correct_count;
      data.now_finish_nums = +old_correct_count;
    };

    const ifFinishMission = data.now_finish_nums >= data.need_finish_nums; // 現在完成任務數 > 需要完成任務數 => 任務完成
    if (ifFinishMission) data.now_finish_nums = data.need_finish_nums; // 有可能任務數 現在完成 > 需要完成，看起來很怪

    // 第一次 滿足條件 的 查詢 時，會寫一筆資料到 user__missions  um_status = 1 領取
    //   !data.status 為 undefined、null 代表 user_mission 尚未有資料，一但有資料必為 1: 領取  2: 已完成
    //    userUid !== undefined or null 使用者登入 (上面有判斷了，理論上是多餘的)
    //   ifFinishMission 任務完成
    // 新增 領取 資料
    if (!data.um_status && userUid && ifFinishMission) {
      data.um_status = 1;
      const [err] = await to(addUserMissionStatus(userUid, { mission_item_id: data.mission_item_id }));
      if (err) {
        logger.warn('[Error][missionUtil][missionActivityPredict][addUserMissionStatus] ', err);
        throw errs.dbErrsMsg('404', '15110', { addMsg: err.parent.code });
      }

      result.push(repackageActivePredict(data));
      continue;
    }

    result.push(repackageActivePredict(data));
  };

  return result;
}

function repackageActivePredict(ele) {
  const data = {
    title: ele.title,
    desc: ele.desc, // 開賽時間
    start_date: !ele.start_date ? '' : ele.start_date,
    end_date: !ele.end_date ? '' : ele.end_date,
    id: !ele.mission_item_id ? '' : ele.mission_item_id,
    type: !ele.mission_item_id ? '' : 'mission_item',
    target: ele.target,
    reward_class: ele.reward_class, // 獎勵類型 0: 單一獎勵  1: 不同角色不同獎勵
    reward_type: ele.reward_type, // 獎勵幣型 ingot: 搞錠  coin: 搞幣  dividend: 紅利
    reward_num: ele.reward_num,
    reward_class_num: ele.reward_class === 1 ? ele.reward_class_num : '',
    status: !ele.um_status ? 0 : ele.um_status, // 任務狀態 0: 前往(預設)  1: 領取  2: 已完成
    need_finish_nums: ele.need_finish_nums,
    now_finish_nums: ele.now_finish_nums
  };

  return data;
}

async function activityPredictMission(todayUnix) {
  const redisKey = ['activity', 'Predict', 'Mission', todayUnix].join(':');
  const missions = await CacheQuery(db.sequelize, `
    select missions.title, missions.desc, missions.start_date, missions.end_date,
           missions.need_finish_nums,
           mission_items.mission_item_id, mission_items.func_type, mission_items.target,
           mission_items.reward_class, mission_items.reward_type, 
           mission_items.reward_num, mission_items.reward_class_num
      from missions, mission_items
     where missions.mission_id = mission_items.mission_id
       and missions.type = 2
       and missions.activity_type = 'predict'
       and missions.status = 1
       and :todayUnix between start_date and end_date
  `, {
    replacements: {
      todayUnix: todayUnix
    },
    type: db.sequelize.QueryTypes.SELECT
  }, redisKey);

  return missions;
}

async function activityPredictMissionLogin(uid, todayUnix) {
  const missions = await db.sequelize.query(`
    select mission.*, 
            user__missions.id um_id, user__missions.uid um_uid,
            user__missions.mission_item_id um_mission_item_id, 
            user__missions.mission_god_id um_mission_god_id, 
            user__missions.mission_deposit_id um_mission_deposit_id,
            user__missions.status um_status, user__missions.date_timestamp um_date_timestamp
      from (
             select missions.title, missions.desc, missions.start_date, missions.end_date,
                    missions.need_finish_nums,
                    mission_items.mission_item_id, mission_items.func_type, mission_items.target,
                    mission_items.reward_class, mission_items.reward_type, 
                    mission_items.reward_num, mission_items.reward_class_num
               from missions, mission_items
              where missions.mission_id = mission_items.mission_id
                and missions.type = 2
                and missions.activity_type = 'predict'
                and missions.status = 1
                and :todayUnix between start_date and end_date
           ) mission
      left join user__missions
        on mission.mission_item_id = user__missions.mission_item_id
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
  dailyMissionLogin,

  missionActivityGod,
  activityGodMission,
  activityGodMissionLogin,
  activityGodCheckStatusReturnReward,

  missionActivityDeposit,
  activityDepositMission,
  activityDepositMissionLogin,
  activityDepositsCheckStatusReturnReward,

  missionActivityPredict,
  activityPredictMission,
  activityPredictMissionLogin
};
