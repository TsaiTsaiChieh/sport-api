const db = require('../../../util/dbUtil');
const Op = require('sequelize').Op;
const countPerPage = 50;
async function model(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const where = {};
      if (args.uid) where.uid = args.uid;
      if (args.name) where.name = { [Op.like]: args.name + '%' };
      if (args.displayName) where.display_name = { [Op.like]: args.displayName + '%' };
      if (args.email) where.email = { [Op.like]: '%' + args.email + '%' };
      if (args.phone) where.phone = { [Op.like]: args.phone + '%' };
      const users = await db.sequelize.models.user.findAndCountAll({
        where: where,
        limit: countPerPage, // 每頁幾個
        offset: countPerPage * args.page, // 跳過幾個 = limit * index
        sort: null,
        raw: true
      });
      resolve({ code: 200, count: users.count, users: users.rows });
    } catch (err) {
      console.error(err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = model;
