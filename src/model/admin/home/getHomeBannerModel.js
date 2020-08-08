const db = require('../../../util/dbUtil');
const Op = require('sequelize').Op;
async function model(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const using = await db.sequelize.models.home__banner.findAll({
        where: {
          sort: {
            [Op.ne]: null
          }
        },
        order: ['sort'],
        raw: true
      });
      const unuse = await db.sequelize.models.home__banner.findAll({
        where: {
          sort: null
        },
        raw: true
      });

      resolve({ code: 200, using: using, unuse: unuse });
    } catch (err) {
      console.error(err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = model;
