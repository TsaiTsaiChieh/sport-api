const mission_util = require('../../util/missionUtil');
const cashflow_util = require('../../util/cashflowUtil');
const modules = require('../../util/modules');
async function LotteryModel(args) {
  return new Promise(async function(resolve, reject) {
    const nowUnix = modules.moment().unix();

    const mission = await mission_util.activityDepositsCheckStatusReturnReward(args.body.uid, nowUnix);

    const param = args.body;
    param.type_id = mission[0].mission_deposit_id;
    param.reward_type = mission[0].reward_type;
    param.reward_value = mission[0].reward_num;
    
    const cashflow_issue = await cashflow_util.cashflow_issue(param);

    resolve(cashflow_issue);
  });
}

module.exports = LotteryModel;
