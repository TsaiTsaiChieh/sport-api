const modules = require('../../util/modules');
const db = require('../../util/db');
const moment = require('moment');

function getMatches(args) {
  return new Promise(async function (resolve, reject) {
    const matches = getMatchesWithDate(args);

    resolve(matches);
  });
}

function getMatchesWithDate(args) {
  return new Promise(async function (resolve, reject) {
    const begin = modules.moment(args.date).utcOffset(modules.UTF).unix();
    const end =
      modules.moment(args.date).utcOffset(modules.UTF).add(1, 'days').unix() -
      1;

    const { Op } = db.Sequelize;
    // const Spreads = await db.sequelize.models.match__spread.sync();
    // console.log(Spread);
    // console.log(db.Spread);
    db.sequelize
      .query(
        'SELECT * FROM `match__NBAs` match, `match__team__NBAs` home,`match__team__NBAs` away where  match.home_id = home.team_id AND match.away_id = away.team_id',
        {
          type: db.sequelize.QueryTypes.SELECT
        }
      )
      .then((a) => {
        // We don't need spread here, since only the results will be returned for select queries
        console.log(a);
      });
    // const matches = await db.sequelize.models.match__NBA.findAll({
    // include: [
    //   {
    //     model: Spreads,
    //     where: { spread_id: '31268570' }
    //   }
    // ],
    //   attributes: [['bets_id', 'id'], 'scheduled'],
    //   where: {
    //     scheduled: {
    //       [Op.between]: [begin, end]
    //     },
    //     [Op.and]: [{ flag_prematch: 1 }]
    //   }
    // });
    resolve(matches);
  });
}
module.exports = getMatches;
