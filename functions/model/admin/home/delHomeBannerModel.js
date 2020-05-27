/* eslint-disable promise/always-return */
const db = require('../../../util/dbUtil');
function del(id) {
  return new Promise(async function(resolve, reject) {
    try {
      await db.sequelize.models.home__banner.destroy({
        where: {
          id: id
        },
        raw: true
      });
      resolve();
    } catch (error) {
      console.error(error);
      reject('delete failed');
    }
  });
}

async function model(args) {
  return new Promise(async function(resolve, reject) {
    try {
      await del(args.id);
      resolve({ code: 200 });
    } catch (err) {
      console.error(err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = model;
