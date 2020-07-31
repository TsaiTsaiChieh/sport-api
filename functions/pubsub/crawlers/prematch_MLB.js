const AppErrors = require('../../util/AppErrors');
const { getSeason } = require('../../util/databaseEngine');
const { leagueCodebook } = require('../../util/leagueUtil');
const { crawler } = require('../../util/crawlerUtil');
// const https = require('https');

const configs = {
  league: 'MLB',
  official_URL: 'https://www.mlb.com'
};

const options = {
  hostname: 'www.mlb.com',
  path: '/standings/league',
  method: 'GET',
  headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36' }
};
async function prematch_MLB(req, res) {
  return new Promise(async function(resolve, reject) {
    try {
      const season = await getSeason(leagueCodebook(configs.league).id);
      // await crawlerTeamBase(season);
      const str = '';
      // https.get(options, function(res) {
      //   console.log(res.statusCode);
      //   console.log(res.headers);
      //   res.on('data', function(chunk) {
      //     // console.log(chunk);
      //     // str += chunk;
      //     process.stdout.write(chunk);
      //   });
      // });

      return resolve(res.json('MLB'));
    } catch (err) {
      return reject(new AppErrors.MLB_CrawlersError(err.stack));
    }
  });
}

function crawlerTeamBase(season) {
  return new Promise(async function(resolve, reject) {
    try {
      const $_teamBase = await crawler(`${configs.official_URL}standings/league`);
      // const $_teamBase = await crawler('http://eng.koreabaseball.com/Standings/TeamStandings.aspx');
      console.log(`${configs.official_URL}standings/league`);
      // const teamBase = await getTeamBase($_teamBase);
      return resolve();
    } catch (err) {
      return reject(new AppErrors.MLB_CrawlersError(err.stack));
    }
  });
}

// function getTeamBase($) {
//   return new Promise(async function(resolve, reject) {
//     try {
//       $('*').each(function(i) {
//         console.log($(this).text());
//       });
//       return resolve();
//     } catch (err) {
//       return reject(new AppErrors.CrawlersError(err.stack));
//     }
//   });
// }
module.exports = prematch_MLB;
