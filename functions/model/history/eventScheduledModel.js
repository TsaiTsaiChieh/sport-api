const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
const AppErrors = require('../../util/AppErrors');
async function eventScheduled(args) {
  return new Promise(async function (resolve, reject) {
    try {
      const events = await queryTwoDaysEvent(args);
      const result = await repackage(events);
      resolve(result);
    } catch (err) {
      reject(err);
    }
  });
}

function queryTwoDaysEvent(args) {
  return new Promise(async function (resolve, reject) {
    try {
      const begin = modules.convertTimezone(
        modules.moment().utcOffset(8).format('YYYY-MM-DD')
      );
      const end =
        modules.convertTimezone(
          modules.moment().utcOffset(8).format('YYYY-MM-DD'),
          {
            op: 'add',
            value: 2,
            unit: 'days'
          }
        ) - 1;
      const queries = await db.sequelize.query(
        // take 169 ms
        `(
          SELECT bets_id AS id, scheduled, scheduled_tw, home.name AS home_name,away.name AS away_name, home.name_ch AS home_name_ch,away.name_ch AS away_name_ch
            FROM matches AS game ,
                 match__teams AS home,
                 match__teams AS away
           WHERE game.scheduled BETWEEN '${begin}' AND '${end}'
             AND game.league_id = '${modules.leagueCodebook(args.league).id}'
             AND game.home_id = home.team_id
             AND game.away_id = away.team_id
         )`,
        {
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      return resolve(await queries);
    } catch (err) {
      return reject(`${err.stack} by DY`);
    }
  });
}

async function repackage(events) {
  try {
    const data = [];
    for (let i = 0; i < events.length; i++) {
      const ele = events[i];
      const temp = {
        id: ele.id,
        scheduled: ele.scheduled,
        date: modules.timeFormat(ele.scheduled_tw).split(' ')[0],
        time: modules.timeFormat(ele.scheduled_tw).split(' ')[1],
        home_name: ele.home_name,
        away_name: ele.away_name,
        home_name_ch: ele.home_name_ch,
        away_name_ch: ele.away_name_ch
      };
      data.push(temp);
    }

    return data;
  } catch (err) {
    console.error(`${err.stack} by DY`);
    throw AppErrors.RepackageError(`${err.stack} by DY`);
  }
}
module.exports = eventScheduled;
