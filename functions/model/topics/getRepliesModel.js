/* eslint-disable no-await-in-loop */
/* eslint-disable promise/always-return */
const modules = require('../../util/modules');
const db = require('../../util/dbUtil_ifyu');
const log = require('../../util/loggingUtil');
const func = require('./topicFunctions');
const countPerPage = 20;
function dbFind(aid, page) {
  return new Promise(async function (resolve, reject) {
    try {
      const result = await db.sequelize.models.topic__reply.findAndCountAll({
        where: {
          aid: aid
        },
        limit: countPerPage,  //每頁幾個
        offset: countPerPage * page, //跳過幾個 = limit * index
        distinct: true,
        raw: true
      })
      resolve(result)
    } catch (error) {
      log.data(error);
      reject('get replies failed');
      return;
    }
  })
}
async function getReplies(args) {
  return new Promise(async function(resolve, reject) {
    try {
      let aid = args.aid;
      let page = args.page;

      const replies = await dbFind(aid, page)
      resolve({ code: 200, replies: replies });
    } catch (err) {
      log.err(err);
      reject({ code: 500, error: err });
      return;
    }
  });
}
module.exports = getReplies;