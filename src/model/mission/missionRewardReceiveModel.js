const { date3UnixInfo, getLastPeriod } = require('../../util/modules');
const db = require('../../util/dbUtil');
const errs = require('../../util/errorCode');
const to = require('await-to-js').default;
const { logger } = require('../../util/loggerUtil');

const { activityGodCheckStatusReturnReward, activityDepositsCheckStatusReturnReward, setUserMissionStatus } = require('../../util/missionUtil');
const cashflowUtil = require('../../util/cashflowUtil');

async function missionRewardReceive(args) {
  const userUid = args.token.uid;
  const type = args.query.type;
  const id = args.query.id;
  const nowInfo = date3UnixInfo(Date.now());
  const todayUnix = nowInfo.dateBeginUnix; // 用來判斷是否還在活動期間內
  let check1;

  // 取得 mission type： mission_item(每日、活動-預測)  mission_god(活動-大神)  mission_deposit(活動-儲值)
  // mission_item(每日、活動-預測)

  // 目前 首次大神任務 不在此處理
  if (type === 'mission_god') {
    const nowInfo = date3UnixInfo(Date.now());
    const nowUnix = nowInfo.mdate.unix();

    check1 = await db.sequelize.query(`
        SELECT missions.type, 
               mission_gods.mission_god_id, 
               mission_gods.reward_type, 
               mission_gods.diamond_reward, 
               mission_gods.gold_reward,
               mission_gods.sliver_reward, 
               mission_gods.copper_reward      
          from missions, mission_gods
         where missions.mission_id = mission_gods.mission_id
           and mission_gods.mission_god_id = :id
           and :todayUnix between start_date and end_date
    `, {
      replacements: {
        id: id,
        todayUnix: todayUnix
      },
      type: db.sequelize.QueryTypes.SELECT
    });

    let missionStatusUpdateParms; //, check2, err;
    if (check1[0].type === 2) {
      missionStatusUpdateParms = { status: 1, mission_god_id: id, dateUnix: todayUnix };
    }

    const period = getLastPeriod(Date.now());
    const gods = await db.sequelize.query(`
      select uid, min(rank_id) rank_id
        from titles
       where period = :period
         and uid = :uid
       group by uid
    `, {
      replacements: {
        uid: args.token.uid,
        period: period.period
      },
      type: db.sequelize.QueryTypes.SELECT
    });

    for (const god of Object.values(gods)) {
      const rewardInfo = await activityGodCheckStatusReturnReward(god.uid, nowUnix);

      for (const reward of Object.values(rewardInfo)) { // 獎勵s 有回傳代表有符合首次大神條件
        const trans = await db.sequelize.transaction();

        // 金流新增
        if (rewardInfo.length > 0) { // 代表有獎勵
          // god.rank_id 這期大神 最高 rank

          // reward
          //   mission_god_id
          //   reward_type
          //   diamond_reward
          //   gold_reward
          //   sliver_reward
          //   copper_reward

          let rvalue = 0;
          switch (god.rank_id) {
            case 1:
              rvalue = reward.diamond_reward;
              break;
            case 2:
              rvalue = reward.gold_reward;
              break;
            case 3:
              rvalue = reward.silver_reward;
              break;
            case 4:
              rvalue = reward.copper_reward;
              break;
          }

          /* 發放搞任務獎勵 */
          const issue = {
            type: 2,
            activity_type: 'god',
            uid: god.uid,
            reward_type: reward.reward_type,
            reward_value: rvalue,
            type_id: reward.mission_god_id,
            reward_god_rank: god.rank_id
          };

          /* 存入搞任務-金流-START */
          await cashflowUtil.cashflow_issue(issue, trans);
          /* 存入搞任務-金流-END */

          /* 存入錢包-START */
          const purse_self = await db.User.findOne({
            where: { uid: god.uid },
            attributes: ['ingot', 'coin', 'dividend'],
            raw: true
          });

          await db.User.update({ ingot: purse_self.ingot + issue.reward_value }, { where: { uid: god.uid }, transaction: trans });
          /* 存入錢包-END */

          // 最後新增完成任務
          // const [err] = await to(addUserMissionStatus(god.uid,
          //   { mission_god_id: reward.mission_god_id, status: 2 }, trans));

          const [err] = await to(setUserMissionStatus(god.uid, missionStatusUpdateParms, 2, trans));

          if (err) {
            logger.warn('[Error][god_nextPeriod][addUserMissionStatus] ', err);
            await trans.rollback();
            throw errs.dbErrsMsg('404', '50210', { addMsg: err.parent.code });
          }

          await trans.commit();
        }
      }
    }
    return { status: 'ok' };
  // 目前 首次儲值任務 不在此處理
  } else if (type === 'mission_deposit') {
    // args.token.uid = 'vl2qMYWJTnTLbmO4rtN8rxdodCo2';
    check1 = await db.sequelize.query(`
      select missions.type
        from missions, mission_deposits
       where missions.mission_id = mission_deposits.mission_id
         and mission_deposits.mission_deposit_id = :id
         and :todayUnix between start_date and end_date
    `, {
      replacements: {
        id: id,
        todayUnix: todayUnix
      },
      type: db.sequelize.QueryTypes.SELECT
    });
    let missionStatusUpdateParms; //, check2, err;
    if (check1[0].type === 2) {
      missionStatusUpdateParms = { status: 1, mission_deposit_id: id, dateUnix: todayUnix };
    }
    const users_mission = await db.CashflowDeposit.findOne({
      attributes: [
        'uid',
        'updatedAt'
      ],
      where: {
        uid: args.token.uid
      },
      raw: true
    });

    // Transaction Start

    if (users_mission) {
      var date = users_mission.updatedAt.getDate();
      var month = users_mission.updatedAt.getMonth(); // Be careful! January is 0 not 1
      var year = users_mission.updatedAt.getFullYear();

      var dateString = date + '-' + (month + 1) + '-' + year;

      users_mission.pay_timestamp = Date.parse(dateString) / 1000;
      // users_mission.pay_timestamp = users_mission.updatedAt.getTime();

      const cashflow_mission_list = await activityDepositsCheckStatusReturnReward(users_mission.uid, users_mission.pay_timestamp);

      /* 搞任務給予紀錄(create or update) */
      for (const cashflow_mlist of cashflow_mission_list) {
        const trans = await db.sequelize.transaction();
        if (cashflow_mlist.mission_deposit_id !== undefined) {
          const param = {
            uid: users_mission.uid,
            mission_deposit_id: cashflow_mlist.mission_deposit_id,
            deposit_lottery: 1
          };

          try {
            /* 找不到就寫入資料 */
            await db.CashflowMission.findOrCreate({
              where: param
            });
            /* add user_mission data */
            // await addUserMissionStatus(users_mission.uid,
            //   { mission_deposit_id: 1, status: 2 });
            await to(setUserMissionStatus(users_mission.uid, missionStatusUpdateParms, 2, trans));

            /* 使用者更新抽獎券 */

            // await db.User.update({ deposit_lottery: param.deposit_lottery }, { where: { uid: users_mission.uid, transaction: trans } });
            await db.User.update({
              deposit_lottery: param.deposit_lottery
            }, {
              where: { uid: users_mission.uid },
              transaction: trans
            });
          } catch (e) {
            console.log(e);
          }
        }
        await trans.commit();
      }
    }
    if (check1.length > 1) throw errs.dbErrsMsg('404', '15212'); // 取得多筆不正確
    if (check1.length === 0) throw errs.dbErrsMsg('404', '15217'); // 查不到
    return { status: 'ok' };
  } else if (type === 'mission_item') {
    check1 = await db.sequelize.query(`
      select missions.type, 
             mission_items.mission_item_id, mission_items.reward_type, mission_items.reward_num
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

    if (!check1) throw errs.dbErrsMsg('404', '150152'); // chekc1 無值情況，代表 type 為 mission_god 或 mission_deposit，目前不會有這種情況，需要中斷

    let missionStatusUpdateParms; //, check2, err;

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

    if (!missionStatusUpdateParms) {
      throw errs.dbErrsMsg('404', '150153'); // missionStatusUpdateParms 無值情況，必需要有值才對
    }

    // Transaction Start
    const trans = await db.sequelize.transaction();

    const [err] = await to(setUserMissionStatus(userUid, missionStatusUpdateParms, 2, trans));

    if (err) {
      logger.warn('[Error][missionRewardReciveModel][setUserMissionStatus] ', err);
      await trans.rollback();
      throw errs.dbErrsMsg('404', '150151');
    }

    // 需確認是否有獎勵  結果為 0 代表 沒有獎勵的
    // if (check2[0] === 0) {
    //   await trans.rollback();
    //   throw errs.dbErrsMsg('404', '15015'); // 更新0筆不正確，至少要一筆
    // }

    // 實際發放獎勵，呼叫金流相關操作
    // check1 需要取得
    // reward
    //   mission_item_id
    //   reward_type
    //   reward_num
    /* 發放搞任務獎勵 */
    const issue = {
      type: check1[0].type,
      reward_type: check1[0].reward_type,
      reward_value: check1[0].reward_num,
      uid: userUid,
      type_id: check1[0].mission_item_id
    };
    await cashflowUtil.cashflow_issue(issue, trans);

    const purse_self = await db.User.findOne({
      where: { uid: userUid },
      attributes: ['ingot', 'coin', 'dividend'],
      raw: true
    });

    if (issue.reward_type === 'ingot') {
      await db.User.update({ ingot: purse_self.ingot + issue.reward_value }, { where: { uid: userUid }, transaction: trans });
    } else if (issue.reward_type === 'coin') {
      await db.User.update({ coin: purse_self.coin + issue.reward_value }, { where: { uid: userUid }, transaction: trans });
    } else if (issue.reward_type === 'dividend') {
      await db.User.update({ dividend: purse_self.dividend + issue.reward_value }, { where: { uid: userUid }, transaction: trans });
    }

    await trans.commit();
    return { status: 'ok' };
  }
}

module.exports = missionRewardReceive;
