const db = require('../util/dbUtil');
const modules = require('../util/modules');

/* 依狀態發放獎勵 */
async function cashflow_issue(param, trans = null) {
  const insideTrans = trans || await db.sequelize.transaction();
  const type = param.type;// 任務類型  0: 每日  1: 進階  2: 活動
  const activity_type = param.activity_type;// 活動類型  god: 大神  deposit: 儲值  predict: 預測
  const mission_id = param.mission_id;
  const reward_type = param.reward_type; // 獎勵類型 ingot coin dividend lottery
  const reward_value = param.reward_value; // 獎勵值
  const uid = param.uid; // 使用者
  const type_id = param.type_id; // 項目id

  /* 給予獎勵預設值 */
  let ingot = 0; // 搞錠預設值為0
  let coin = 0; // 搞幣預設值為0
  let dividend = 0; // 紅利預設值為0
  let lottery = 0; // 摸彩券預設值為0

  let mission_god_id = 0; // 預設大神任務id為NULL
  let mission_deposit_id = 0; // 預設購買搞幣任務id為NULL
  let mission_item_id = 0; // 預設每日任務id為NULL

  const issue_timestamp = modules.moment().unix();
  if (type === 2) {
    if (activity_type === 'god') {
      mission_god_id = type_id;
    } else if (activity_type === 'deposit') {
      mission_deposit_id = type_id;
    }
  } else if (type === 1) {
    mission_item_id = type_id;
  }
  if (reward_type === 'ingot') {
    ingot = reward_value;
  } else if (reward_type === 'coin') {
    coin = reward_value;
  } else if (reward_type === 'dividend') {
    dividend = reward_value;
  } else if (reward_type === 'lottery') {
    lottery = reward_value;
  }

  const cashflow_mission = {
    ingot: ingot,
    coin: coin,
    dividend: dividend,
    lottery: lottery,
    uid: uid,
    mission_id: mission_id,
    mission_god_id: mission_god_id,
    mission_deposit_id: mission_deposit_id,
    mission_item_id: mission_item_id,
    issue_timestamp: issue_timestamp
  };

  try {
    const created = await db.CashflowMission.create(cashflow_mission);
    return created;
  } catch (e) {
    await insideTrans.rollback();
  }

  if (!trans) await insideTrans.commit(); // trans 為外面呼叫帶入，不可以 commit
}

module.exports = {
  cashflow_issue
};
