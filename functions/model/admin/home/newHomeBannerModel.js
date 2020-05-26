/* eslint-disable promise/always-return */
const db = require('../../../util/dbUtil');
function dbCreate(insertData) {
  return new Promise(async function(resolve, reject) {
    try {
      await db.sequelize.models.home__banner.create(insertData);
      resolve();
    } catch (error) {
      console.error(error);
      reject('create new failed');
    }
  });
}

async function model(args) {
  console.log(args);
  return new Promise(async function(resolve, reject) {
    try {
      const insertData = {
        name: args.name,
        imgurl: args.imgurl,
        title: '(請編輯)',
        content: '無內文'
      };
      // console.log(insertData);
      await dbCreate(insertData);
      resolve({ code: 200 });
    } catch (err) {
      console.error(err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = model;
