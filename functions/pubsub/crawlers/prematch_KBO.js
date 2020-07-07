const modules = require('../../util/modules');
const AppErrors = require('../../util/AppErrors');
// const { KBO } = require('../util/prematchFunctions_KBO');
const KBO_URL = 'https://mykbostats.com/';

// 1. 取得各隊伍的資訊
async function prematch_KBO(req, res) {
  const d = await getTeamsStandings();
}

function getTeamsStandings() {
  return new Promise(async function(resolve, reject) {
    try {
      const { data } = await modules.axios.get(KBO_URL);
      const $ = modules.cheerio.load(data); // load in the HTML
      // const teamTable = $('#tbl-teams').children()[0]; // team table unique id
      // const a = $('thread');

      // const a = $().attr('name'); // div[class^="test"]
      console.log(a.children().length);

      // console.log(a.text(), '===');

      // console.log('--', teamTable.get(0).thread.text());
      // console.log(teamTableTitles);
      // console.log(teamTableTitles.text());
      // console.log(teamTableTitles.length);
    } catch (err) {
      console.error(err, '=-----');
      return reject(new AppErrors.CrawlersError(`${err.stack} by TsaiChieh`));
    }
  });
}
module.exports = prematch_KBO;
