/* eslint-disable promise/always-return */
const db = require('../../util/dbUtil');
function dbCreate(insertData) {
  return new Promise(async function(resolve, reject) {
    try {
      // await db.sequelize.models.service__reporttopic.sync({ alter: true }); //有新增欄位時才用
      await db.sequelize.models.service__reporttopic.create(insertData);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}
async function reportTopic(args) {
  return new Promise(async function(resolve, reject) {
    try {
      let uid = args.token.uid;

      const insertData = {
        uid: uid,
        type: 'article', //args.type,
        article_id: args.article_id,
        content: args.content
      };
      await dbCreate(insertData);
      resolve({ code: 200 });
    } catch (err) {
      console.error(err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = reportTopic;
