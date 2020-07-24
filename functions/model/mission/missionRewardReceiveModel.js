/* eslint-disable prefer-const */
const { date3UnixInfo } = require('../../util/modules');
const db = require('../../util/dbUtil');
const errs = require('../../util/errorCode');
const to = require('await-to-js').default;
const { setUserMissionStatus } = require('../../util/missionUtil');

async function missionRewardReceive(args) {
  const userUid = args.token.uid;
  const type = args.query.type;
  const id = args.query.id;
  const nowInfo = date3UnixInfo(Date.now());
  const todayUnix = nowInfo.dateBeginUnix; // 用來判斷是否還在活動期間內
  let check1;

  // 取得 mission type： mission_item(每日、活動-預測)  mission_god(活動-大神)  mission_deposit(活動-儲值)
  // mission_item(每日、活動-預測)
  if (type === 'mission_item') {
    check1 = await db.sequelize.query(`
      select missions.type
        from missions, mission_items
       where missions.mission_id = mission_items.mission_id
         and mission_items.mission_item_id = :id
         and :todayUnix between start_date and end_date
    `, {
      replacements: {
        id: id,
        todayUnix: todayUnix
      },
      type: db.sequelize.QueryTypes.SELECT
    });
    if (check1.length > 1) throw errs.dbErrsMsg('404', '15210'); // 取得多筆不正確
    if (check1.length === 0) throw errs.dbErrsMsg('404', '15215'); // 查不到
  }

  // if (type === 'mission_god') {
  //   check1 = await db.sequelize.query(`
  //     select missions.type
  //       from missions, mission_gods
  //      where missions.mission_id = mission_gods.mission_id
  //        and mission_gods.mission_god_id = :id
  //        and :todayUnix between start_date and end_date
  //   `, {
  //     replacements: {
  //       id: id,
  //       todayUnix: todayUnix
  //     },
  //     type: db.sequelize.QueryTypes.SELECT
  //   });
  //   if (check1.length > 1) throw errs.dbErrsMsg('404', '15211'); // 取得多筆不正確
  //   if (check1.length === 0) throw errs.dbErrsMsg('404', '15216'); // 查不到
  // }

  // if (type === 'mission_deposit') {
  //   check1 = await db.sequelize.query(`
  //     select missions.type
  //       from missions, mission_deposits
  //      where missions.mission_id = mission_deposits.mission_id
  //        and mission_deposits.mission_deposit_id = :id
  //        and :todayUnix between start_date and end_date
  //   `, {
  //     replacements: {
  //       id: id,
  //       todayUnix: todayUnix
  //     },
  //     type: db.sequelize.QueryTypes.SELECT
  //   });
  //   if (check1.length > 1) throw errs.dbErrsMsg('404', '15212'); // 取得多筆不正確
  //   if (check1.length === 0) throw errs.dbErrsMsg('404', '15217'); // 查不到
  // }

  let missionStatusUpdateParms, check2, err;
  const trans = await db.sequelize.transaction();

  // 取得 mission type 0: 每日  1: 進階  2: 活動
  if (check1[0].type === 0) { // 每日 daily
    // daily 要多輸入該天Unix() = todayUnix
    // daily 部份 領取前需要確認 有領取資格(status: 1)
    missionStatusUpdateParms = { status: 1, mission_item_id: id, dateUnix: todayUnix };
  }

  if (check1[0].type === 2) { // 活動 activity 來源有多個
    // 領取前需要確認 有領取資格(status: 1)
    if (type === 'mission_item') missionStatusUpdateParms = { status: 1, mission_item_id: id };
    // if (type === 'mission_god') missionStatusUpdateParms = { status: 1, mission_item_id: id };
    // if (type === 'mission_deposit') missionStatusUpdateParms = { status: 1, mission_item_id: id };
  }

  [err, check2] = await to(setUserMissionStatus(userUid, missionStatusUpdateParms, 2, trans));
  if (err) {
    console.error('[missionRewardReciveModel][setUserMissionStatus] ', err);
    await trans.rollback();
    throw errs.dbErrsMsg('404', '150151');
  }

  // 需確認是否有獎勵  結果為 0 代表 沒有獎勵的
  if (check2[0] === 0) {
    await trans.rollback();
    throw errs.dbErrsMsg('404', '15015'); // 更新0筆不正確，至少要一筆
  }

  // 實際發放獎勵，呼叫金流相關操作

  await trans.commit();
  return { status: 'ok' };
}

module.exports = missionRewardReceive;
