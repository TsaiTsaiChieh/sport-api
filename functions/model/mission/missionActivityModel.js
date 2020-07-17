const {
  missionActivityGod, missionActivityDeposit, missionActivityPredict
} = require('../../util/missionUtil');

async function missionActivity(args) {
  const result = { activity: [] };

  // 處理三個部份: 活動大神 missionActivityGod, 活動儲值 missionActivityDeposit, 活動預測 missionActivityPredict
  result.activity = await Promise.all(
    [missionActivityGod(args), missionActivityDeposit(args), missionActivityPredict(args)]
  ).then(v => { return v.reduce(function(a, b) { return a.concat(b); }, []);});

  // result.activity = result.activity.concat(await missionActivityGod(args));

  return result;
}

module.exports = missionActivity;
