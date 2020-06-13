/* eslint-disable promise/always-return */
const db = require('../../../util/dbUtil');
function dbEdit(type, id, insertData) {
  return new Promise(async function(resolve, reject) {
    try {
      if (type === 'user') {
        const record = await db.sequelize.models.user.findOne({
          where: {
            uid: id
          }
        });
        record.update(insertData);
      } else if (type === 'blog') {
        await db.sequelize.models.user__blocklog.create(insertData);
      }
      resolve();
    } catch (error) {
      console.error(error);
      reject('edit user failed');
    }
  });
}
async function model(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const datenow = new Date().toISOString();
      if (args.unblock) {
        await dbEdit('user', args.uid, {
          block_message: datenow
        });
        await dbEdit('blog', args.uid, {
          uid: args.uid,
          newcount: -1,
          start: datenow,
          end: datenow
        });
      }
      if (args.setCount) {
        await dbEdit('user', args.uid, {
          block_count: Number(args.setCount)
        });
        await dbEdit('blog', args.uid, {
          uid: args.uid,
          newcount: Number(args.setCount),
          start: datenow,
          end: datenow
        });
      }
      resolve({ code: 200 });
    } catch (err) {
      console.error(err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = model;
