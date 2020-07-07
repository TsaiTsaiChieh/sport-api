const modules = require('../../util/modules');
const AppErrors = require('../../util/AppErrors');
const CPBL_URL = 'http://www.cpbl.com.tw';

// 1. 取得各隊伍的資訊
async function prematch_CPBL(req, res) {
	const d = await getTeamsStandings();

}

function getTeamsStandings() {
  return new Promise(async function(resolve, reject) {
    try {
			// 球隊的季戰績
      const { data } = await modules.axios.get(`${CPBL_URL}/standing/season.html`);
      const $ = modules.cheerio.load(data); 
      let titles = $('.gap_b20').text();
      titles = titles.replace(/\r/g, '');
      titles = titles.replace(/\n/g, '');
      titles = titles.replace(/\t/g, ' ');

      titles = titles.split(' ');
      let result = [];
      for (let i = 0; i < titles.length; i++) {
        if (titles[i] === '') {
          continue;
        } else {
          result.push(titles[i].trim());
        }
      }

      console.log(result[0]);
			console.log(result[1]);
			console.log(result[2]);
			console.log(result[3]);
			console.log(result[4]);
    } catch (err) {
      console.error(err, '=-----');
      return reject(new AppErrors.CrawlersError(`${err.stack} by DY`));
    }
  });
}
module.exports = prematch_CPBL;
