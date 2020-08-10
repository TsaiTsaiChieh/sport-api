const db = require('../../../util/dbUtil');
function dbEdit(uid, insertData) {
  return new Promise(async function(resolve, reject) {
    try {
      const record = await db.sequelize.models.user.findOne({
        where: {
          uid: uid
        }
      });
      console.log(insertData);
      record.update(insertData);
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
      await dbEdit(args.uid, {
        name: args.name,
        display_name: args.display_name,
        email: args.email,
        phone: args.phone
      });
      resolve({ code: 200 });
    } catch (err) {
      console.error(err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = model;
