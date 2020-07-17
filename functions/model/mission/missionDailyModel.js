const { missionDaily } = require('../../util/missionUtil');

async function missionDailyModel(args) {
  return await missionDaily(args);
}

module.exports = missionDailyModel;
