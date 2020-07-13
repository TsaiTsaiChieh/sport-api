const db = require('./dbUtil');
const errs = require('./errorCode');
const to = require('await-to-js').default;

//
// 任務
//
// 新增 使用者任務 的 預設狀態  1: 領取
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
  if (!trans) await insideTrans.commit();
}

// 更新 使用者任務 的 狀態  0: 前往(預設)  1: 領取  2: 已完成
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

async function dailyMission(todayUnix) {
  const missions = await db.sequelize.query(`
    select missions.title, missions.desc, missions.start_date, missions.end_date,
           missions.need_finish_nums,
           mission_items.mission_item_id, mission_items.target,
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

module.exports = {
  addUserMissionStatus,
  setUserMissionStatus,
  dailyMission
};
