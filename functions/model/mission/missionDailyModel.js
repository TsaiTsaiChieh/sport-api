/* eslint-disable prefer-const */
const { date3UnixInfo } = require('../../util/modules');
const to = require('await-to-js').default;
const errs = require('../../util/errorCode');
const { addUserMissionStatus, dailyMission, dailyMissionLogin } = require('../../util/missionUtil');

async function missionDaily(args) {
  // 要區分 未登入、已登入
  const userUid = !args.token ? null : args.token.uid; // 需要判斷 有登入的話，有 uesr uid

  const nowInfo = date3UnixInfo(Date.now());
  const todayUnix = nowInfo.dateBeginUnix;

  let result = { daily: [] };

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
    // 第一次 滿足條件 的 查詢 時，會寫一筆資料到 user__missions  status = 1 領取
    //   !data.status 為 undefined、null 代表 user_mission 尚未有資料，一但有資料必為 1: 領取  2: 已完成
    //    userUid !== undefined or null 使用者登入
    //   ifFinishMission 任務完成
    // 新增 領取 資料
    if (!data.status && userUid) {
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

module.exports = missionDaily;
