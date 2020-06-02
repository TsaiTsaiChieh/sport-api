const db = require('../../../util/dbUtil');
const countPerPage = 50;
async function model(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const where = {};
      if (args.status) where.status = args.status;
      const res = await db.sequelize.models.service__reporttopic.findAndCountAll({
        where: where,
        limit: countPerPage, // 每頁幾個
        offset: countPerPage * args.page, // 跳過幾個 = limit * index
        sort: null,
        raw: true
      });
      /* 讀取一些別的資料 */
      const usersToGet = [];
      const usersInfo = [];
      const articlesToGet = [];
      const articlesInfo = [];
      const repliesToGet = [];
      const repliesInfo = [];
      for (let i = 0; i < res.length; i++) {
        // infosToGet.push(topics[i].article_id);
        // usersToGet.push(topics[i].uid);
      }

      resolve({ code: 200, count: res.count, data: res.rows });
    } catch (err) {
      console.error(err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = model;
