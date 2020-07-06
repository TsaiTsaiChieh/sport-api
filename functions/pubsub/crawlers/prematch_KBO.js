const modules = require('../../util/modules');
const { KBO } = require('../util/prematchFunctions_KBO');
const KBO_URL = 'https://mykbostats.com/';

// 1. 取得各隊伍的資訊
async function prematch_KBO(req, res) {
  const d = await getTeamsStandings();
}

function getTeamsStandings() {
  return new Promise(async function(resolve, reject) {
    const { data } = await modules.axios.get(KBO_URL);
    const $ = modules.cheerio.load(data);
    console.log($);
  });
}
module.exports = prematch_KBO;
