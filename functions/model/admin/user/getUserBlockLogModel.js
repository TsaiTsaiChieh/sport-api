const db = require('../../../util/dbUtil');
async function model(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const users = await db.sequelize.models.user__blocklog.findAndCountAll({
        where: { uid: args.uid },
        raw: true
      });
      resolve({ code: 200, count: users.count, logs: users.rows });
    } catch (err) {
      console.error(err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = model;
