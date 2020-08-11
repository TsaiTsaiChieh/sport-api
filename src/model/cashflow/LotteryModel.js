const mission_util = require('../../util/missionUtil');
const cashflow_util = require('../../util/cashflowUtil');
const modules = require('../../modules');
async function LotteryModel(args) {
  return new Promise(async function(resolve, reject) {
    const nowUnix = modules.moment().unix();
    const mission = await mission_util.activityDepositsCheckStatusReturnReward(args.uid, nowUnix);
    const param = {
      type: 0,
      reward_type: 'ingot',
      reward_value: 100,
      uid: 'test',
      type_id: mission.mission_deposit_id
    };
    const cashflow_issue = await cashflow_util.cashflow_issue(param);

    resolve(cashflow_issue);
  });
}

module.exports = LotteryModel;
