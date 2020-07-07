const modules = require('../util/modules');
const db = require('../util/dbUtil');
const AppErrors = require('../util/AppErrors');

async function forpastevent() {
  return new Promise(async function(resolve, reject) {
    try {
      const unix = Math.floor(Date.now() / 1000);
      const date = modules.convertTimezoneFormat(unix, {
        format: 'YYYY-MM-DD 00:00:00',
        op: 'add',
        value: 0,
        unit: 'days'
      });
      const time = new Date(date);
      const ele = await queryForMatches(
        modules.convertTimezone(time.getTime())
      );

      for (let i = 0; i < ele.length; i++) {
        await db.Match.upsert({
          bets_id: ele[i].bets_id,
          status: 0
        });
      }
    } catch (err) {
      return reject(new AppErrors.AxiosError(`${err} at forpastevent by DY`));
    }
  });
}

async function queryForMatches(date) {
  return new Promise(async function(resolve, reject) {
    try {
      const queries = await db.sequelize.query(
        // take 169 ms
        `(
					SELECT game.bets_id
					  FROM matches AS game
					 WHERE game.scheduled < '${date}'
					   AND status = ${modules.MATCH_STATUS.SCHEDULED}
				)`,
        {
          type: db.sequelize.QueryTypes.SELECT
        }
      );
      return resolve(queries);
    } catch (err) {
      return reject(`${err.stack} by DY`);
    }
  });
}
module.exports = forpastevent;
