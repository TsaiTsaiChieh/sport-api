/* eslint-disable promise/always-return */
const db = require('../../../util/dbUtil');
function dbEdit(id, insertData) {
  return new Promise(async function(resolve, reject) {
    try {
      const record = await db.sequelize.models.topic__article.findOne({
        where: {
          article_id: id
        }
      });
      record.update(insertData);
      resolve();
    } catch (error) {
      console.error(error);
      reject('edit view count failed');
    }
  });
}
async function model(args) {
  console.log(args);
  return new Promise(async function(resolve, reject) {
    try {
      await dbEdit(args.article_id, { view_count: args.count });
      resolve({ code: 200 });
    } catch (err) {
      console.error(err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = model;
