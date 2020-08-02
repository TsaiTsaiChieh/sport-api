const axios = require('axios');
const cheerio = require('cheerio');
const AppErrors = require('./AppErrors');

function crawler(URL) {
  return new Promise(async function(resolve, reject) {
    try {
      const { data } = await axios.get(URL);
      const $ = cheerio.load(data); // load in the HTML
      return resolve($);
    } catch (err) {
      return reject(new AppErrors.CrawlersError(err.stack));
    }
  });
}

function getDataByAxios(URL) {
  return new Promise(async function(resolve, reject) {
    try {
      const { data } = await axios.get(URL);
      return resolve(data);
    } catch (err) {
      return reject(new AppErrors.AxiosError(err.stack));
    }
  });
}

module.exports = { crawler, getDataByAxios };
