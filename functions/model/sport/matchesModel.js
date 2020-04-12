const modules = require('../../util/modules');
const db = require('../../util/db');
const moment = require('moment');

function getMatches(args) {
  return new Promise(async function (resolve, reject) {
    const begin = modules.moment(args.date).utcOffset(modules.UTF).unix();
    const end =
      modules.moment(args.date).utcOffset(modules.UTF).add(1, 'days').unix() -
      1;

    const { Op } = db.Sequelize;

    const matches = await db.sequelize.models.match__NBA.findAll({
      // attributes: ['scheduled'],
      where: {
        scheduled: {
          [Op.between]: [begin, end]
        }
      }
    });
    resolve(matches);
  });
}
module.exports = getMatches;
