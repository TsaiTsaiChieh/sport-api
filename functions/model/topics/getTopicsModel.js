/* eslint-disable promise/always-return */
const modules = require('../../util/modules');
const db = require('../../util/dbUtil_ifyu');
const log = require('../../util/loggingUtil');
const countPerPage = 20;
function dbFind(where, page) {
  return new Promise(async function (resolve, reject) {
    try {
      const result = await db.sequelize.models.topic__article.findAndCountAll({
        where: where,
        limit: countPerPage,  //每頁幾個
        offset: countPerPage * page, //跳過幾個 = limit * index
        distinct: true
      })
      resolve(result)
    } catch (error) {
      log.data(error);
      reject('get topics failed');
      return;
    }
  })
}
async function getTopics(req, res) {
  return new Promise(async function(resolve, reject) {
    try {
      let where = {};
      let page = 0;

      if(typeof req.type !== 'undefined'){
        where['type'] = req.type
      }
      if(typeof req.category !== 'undefined'){
        where['category'] = req.category
      }
      if(typeof req.page !== 'undefined'){
        page = req.page
      }

      log.data(where)

      const topics = await dbFind(where, page)
      resolve({ code: 200, topics: topics });
    } catch (err) {
      log.err(err);
      reject({ code: 500, error: err });
      return;
    }
  });
}
module.exports = getTopics;