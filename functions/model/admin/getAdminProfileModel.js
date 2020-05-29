const db = require('../../util/dbUtil');
async function model(args) {
  return new Promise(async function(resolve, reject) {
    try {
      if (typeof args.token === 'undefined') {
        reject({ code: 403, error: 'token expired' });
        return;
      }
      const uid = args.token.uid;

      const result = await db.sequelize.models.user.findOne({
        where: {
          uid: uid
        },
        attributes: ['uid', 'status', 'avatar', 'display_name', 'name', 'phone', 'email'],
        raw: true
      });
      const roles = [];
      if (result.status === 9) {
        roles.push('admin'); // 後台前端套件管控用
        roles.push('service');
      }

      resolve({ code: 200, token: args.bearer, roles: roles, userInfo: result });
    } catch (err) {
      console.error(err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = model;
