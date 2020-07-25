const modules = require('../util/modules');
const axios = require('axios');
const db = require('../util/dbUtil');
const AppErrors = require('../util/AppErrors');
const Token = db.Token;
const client_id = '645';
const secret_key = 'hR8gmhwEhMp671cIMjnIDhpnEbi2vVk19jv'; // 正式合約的 key

async function auth_statscore() {
  return new Promise(async function(resolve, reject) {
    try {
      const URL = `https://api.statscore.com/v2/oauth?client_id=${client_id}&secret_key=${secret_key}`;
      const data = await axiosForURL(URL);
      await Token.upsert({
        name: 'statscore',
        token: data.api.data.token
      });

      return resolve('auth ok');
    } catch (err) {
      return reject('auth_statscore by DY');
    }
  });
}

async function axiosForURL(URL) {
  return new Promise(async function(resolve, reject) {
    try {
      const { data } = await axios(URL);
      return resolve(data);
    } catch (err) {
      return reject(new AppErrors.AxiosError(`${err} at auth_statscore by DY`));
    }
  });
}

module.exports = auth_statscore;
