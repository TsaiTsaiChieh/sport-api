/* eslint-disable promise/always-return */
const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
const log = require('../../util/loggingUtil');
function dbFind(aid) {
  return new Promise(async function (resolve, reject) {
    try {
      const result = await db.sequelize.models.topic__article.findOne({
        where: {
          'id': aid
        }
      })
      const view_count = result.view_count + 1;
      result.update({ view_count: view_count })
      resolve(result)
    } catch (error) {
      log.data(error);
      reject('get topics failed');
      return;
    }
  })
}
async function getArticle(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const article = await dbFind(args)
      if(!article){
        reject({ code: 404, error: 'article not found' });
      }
      resolve({ code: 200, article: article });
    } catch (err) {
      log.err(err);
      reject({ code: 500, error: err });
      return;
    }
  });
}
module.exports = getArticle;