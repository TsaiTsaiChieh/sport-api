const modules = require('../../../util/modules');
const db = require('../../../util/dbUtil');
const Op = require('sequelize').Op;

// const countPerPage = 50;
async function model(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const end = modules.moment(new Date()).unix();
      const begin = modules.moment(new Date()).subtract(1, 'months').unix();
      const system = await db.sequelize.models.user__new.findAndCountAll({
        where: {
          status: 1,
          active: 1,
          scheduled: {
            [Op.between]: [begin, end]
          }
        },
        raw: true
      });
      resolve({ code: 200, count: system.count, data: system.rows });
    } catch (err) {
      console.error(err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = model;
