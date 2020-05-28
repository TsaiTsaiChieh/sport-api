/* eslint-disable promise/always-return */
const db = require('../../../util/dbUtil');
function dbEdit(id, insertData) {
  return new Promise(async function(resolve, reject) {
    try {
      const record = await db.sequelize.models.home__banner.findOne({
        where: {
          id: id
        }
      });
      // console.log(id);
      // console.log(record);
      record.update(insertData);
      resolve();
    } catch (error) {
      console.error(error);
      reject('edit article failed');
    }
  });
}

async function model(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const insertData = {
        title: args.title,
        content: args.content
      };
      await dbEdit(args.id, insertData);
      resolve({ code: 200 });
    } catch (err) {
      console.error(err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = model;
