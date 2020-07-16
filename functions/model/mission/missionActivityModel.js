const {
  missionActivityGod
} = require('../../util/missionUtil');

async function missionActivity(args) {
  const result = { activity: [] };
  result.activity = result.activity.concat(await missionActivityGod(args));

  return result;
}

module.exports = missionActivity;
