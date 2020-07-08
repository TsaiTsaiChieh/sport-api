/* eslint-disable promise/always-return */
const db = require('../../../util/dbUtil');
function dbClearSort() {
  return new Promise(async function(resolve, reject) {
    try {
      await db.sequelize.query('UPDATE home__banners SET `sort` = NULL');
      resolve();
    } catch (error) {
      console.error(error);
      reject('edit article failed');
    }
  });
}
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
      await dbClearSort();
      for (let i = 0; i < args.length; i++) {
        try {
          const insertData = {
            name: args[i].name,
            sort: args[i].sort,
            imgurl: args[i].imgurl,
            title: args[i].title,
            content: args[i].content

          };
          await dbEdit(args[i].id, insertData);
        } catch (e) {
          // console.log(e);
        }
      }
      resolve({ code: 200 });
    } catch (err) {
      console.error(err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = model;
