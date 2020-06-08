const modules = require('../util/modules');
const db = require('../util/dbUtil');
const client_id = '630';
const secret_key = 'Tglq4dTZN9zriJmw2L7xjI1hKZrZ5yrR7xs';

async function auth_statscore() {
  return new Promise(async function(resolve, reject) {
    try {
      const URL = `https://api.statscore.com/v2/oauth?client_id=${client_id}&secret_key=${secret_key}`;
      const data = await axiosForURL(URL);
      modules.fs.writeFile(
        './auth/statscoreToken.json',
        `{
    	"token": "${data.api.data.token}"
    }`,
        function(err) {
          if (err) console.log(`${err} on auth_statscore by DY`);
        }
      );
      return resolve('auth ok');
    } catch (err) {
      return reject('auth_statscore by DY');
    }
  });
}

async function axiosForURL(URL) {
  return new Promise(async function(resolve, reject) {
    try {
      const { data } = await modules.axios(URL);
      return resolve(data);
    } catch (err) {
      return reject(
        new AppErrors.AxiosError(`${err} at prematchFunctions_KBO by DY`)
      );
    }
  });
}

module.exports = auth_statscore;
