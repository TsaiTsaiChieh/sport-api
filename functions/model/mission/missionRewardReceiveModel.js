/* eslint-disable prefer-const */
const { date3UnixInfo } = require('../../util/modules');
const db = require('../../util/dbUtil');
const errs = require('../../util/errorCode');
const { setUserMissionStatus } = require('../../util/missionUtil');

async function missionRewardReceive(args) {
  const userUid = args.token.uid;
  const item_id = args.query.item_id;
  const nowInfo = date3UnixInfo(Date.now());
  const todayUnix = nowInfo.dateBeginUnix;

  // 取得 mission type 0: 每日  1: 進階  2: 活動
  const check1 = await db.sequelize.query(`
    select missions.type
      from missions, mission_items
     where missions.mission_id = mission_items.mission_id
       and mission_items.mission_id = :item_id
  `, {
    replacements: {
      item_id: item_id
    },
    type: db.sequelize.QueryTypes.SELECT
  });
  if (check1.length > 1) throw errs.dbErrsMsg('404', '15210'); // 取得多筆不正確
  if (check1.length === 0) throw errs.dbErrsMsg('404', '15013'); // 查不到

  let missionStatusUpdateParms, check2;
  const trans = await db.sequelize.transaction();

  if (check1[0].type === 0) { // 每日 daily
    // daily 要多輸入該天Unix() = todayUnix
    // daily 部份 領取前需要確認 有領取資格(status: 1)
    missionStatusUpdateParms = { status: 1, mission_item_id: item_id, dateUnix: todayUnix };
    check2 = await setUserMissionStatus(userUid, missionStatusUpdateParms, 2, trans);
  }

  // 活動

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
