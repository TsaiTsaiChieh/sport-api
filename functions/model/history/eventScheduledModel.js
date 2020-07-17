const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
const AppErrors = require('../../util/AppErrors');

async function eventScheduled(args) {
  return new Promise(async function(resolve, reject) {
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
  return new Promise(async function(resolve, reject) {
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
          SELECT bets_id AS id, scheduled, scheduled_tw, home.name AS home_name,away.name AS away_name, home.name_ch AS home_name_ch, home.alias_ch AS home_alias_ch,away.name_ch AS away_name_ch,away.alias_ch AS away_alias_ch
            FROM matches AS game ,
                 match__teams AS home,
                 match__teams AS away
           WHERE game.scheduled BETWEEN '${begin}' AND '${end}'
             AND game.league_id = :leagueID
             AND game.home_id = home.team_id
             AND game.away_id = away.team_id
             ORDER BY scheduled
         )`,
        {
          replacements: { leagueID: modules.leagueCodebook(args.league).id },
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
      let dayOfWeek;

      switch (
        modules.convertTimezoneFormat(ele.scheduled, {
          format: 'dddd'
        })
      ) {
        case 'Monday': {
          dayOfWeek = '一';
          break;
        }
        case 'Tuesday': {
          dayOfWeek = '二';
          break;
        }
        case 'Wednesday': {
          dayOfWeek = '三';
          break;
        }
        case 'Thursday': {
          dayOfWeek = '四';
          break;
        }
        case 'Friday': {
          dayOfWeek = '五';
          break;
        }
        case 'Saturday': {
          dayOfWeek = '六';
          break;
        }
        case 'Sunday': {
          dayOfWeek = '日';
          break;
        }
        default: {
          dayOfWeek = '一';
          break;
        }
      }

      const temp = {
        id: ele.id,
        scheduled: ele.scheduled,
        date: modules.convertTimezoneFormat(ele.scheduled, {
          format: 'MM/DD'
        }),
        time: modules.convertTimezoneFormat(ele.scheduled, {
          format: 'h:mmA'
        }),
        day: dayOfWeek,
        home_name: ele.home_name.split('(')[0].trim(),
        away_name: ele.away_name.split('(')[0].trim(),
        home_name_ch: ele.home_alias_ch,
        away_name_ch: ele.away_alias_ch
      };
      data.push(temp);
    }

    return data;
  } catch (err) {
    console.error(`${err.stack} by DY`);
    throw new AppErrors.RepackageError(`${err.stack} by DY`);
  }
}
module.exports = eventScheduled;
