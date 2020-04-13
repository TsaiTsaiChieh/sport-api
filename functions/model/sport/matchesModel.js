const modules = require('../../util/modules');
const db = require('../../util/db');
const AppError = require('../../util/AppErrors');
const scheduledStatus = 2;
const inPlayStatus = 1;
const endStatus = 0;

function getMatches(args) {
  return new Promise(async function (resolve, reject) {
    try {
      const matches = await getMatchesWithDate(args);
      return resolve(repackageMatches(matches, args));
    } catch (err) {
      return reject({ code: err.code, error: err });
    }
  });
}

function getMatchesWithDate(args) {
  return new Promise(async function (resolve, reject) {
    const flag_prematch = 1;
    const begin = modules.moment(args.date).utcOffset(modules.UTF).unix();
    const end =
      modules.moment(args.date).utcOffset(modules.UTF).add(1, 'days').unix() -
      1;
    try {
      const results = await db.sequelize.query(
        `SELECT 
        game.bets_id AS id, game.scheduled, game.status, game.spread_id, game.totals_id,
        home.team_id AS home_id, home.alias_ch AS home_alias_ch, home.alias AS home_alias, home.image_id AS home_image_id,
        away.team_id AS away_id, away.alias_ch AS away_alias_ch, away.alias AS away_alias, away.image_id AS away_image_id,
        spread.spread_id AS spread_id, spread.handicap AS spread_handicap, spread.home_tw AS spread_home_tw, spread.away_tw AS spread_away_tw, spread.add_time AS spread_add_time,
        totals.totals_id AS totals_d, totals.handicap AS totals_handicap, totals.over_tw AS totals_over_tw, totals.add_time AS totals_add_time
        FROM match__${args.league}s AS game, 
        match__team__${args.league}s AS home,
        match__team__${args.league}s AS away,
        match__spreads AS spread,
        match__totals AS totals
        WHERE game.flag_prematch = ${flag_prematch} AND scheduled BETWEEN ${begin} AND ${end}
        AND game.home_id = home.team_id AND game.away_id = away.team_id 
        AND (game.spread_id = spread.spread_id AND game.bets_id = spread.match_id) AND (game.totals_id = totals.totals_id AND game.bets_id = totals.match_id)
        `,
        {
          // replacements: [1, begin, end],
          type: db.sequelize.QueryTypes.SELECT
        }
      );
      resolve(results);
    } catch (error) {
      return reject(new AppError.MysqlError());
    }
  });
}

function repackageMatches(results, args) {
  const data = {
    scheduled: [],
    inplay: [],
    end: []
  };

  for (let i = 0; i < results.length; i++) {
    const ele = results[i];
    const temp = {
      id: ele.id,
      scheduled: ele.scheduled,
      status: ele.status,
      league: args.league,
      home: {
        id: ele.home_id,
        alias: ele.home_alias,
        alias_tw: ele.home_alias_ch,
        image_id: ele.home_image_id
      },
      away: {
        id: ele.away_id,
        alias: ele.away_alias,
        alias_ch: ele.away_alias_ch,
        image_id: ele.away_image_id
      },
      spread: {
        id: ele.spread_id,
        handicap: ele.spread_handicap,
        home_tw: ele.spread_home_tw,
        away_tw: ele.spread_away_tw,
        // add_time: ele.spread_add_time,
        disable: false
      },
      totals: {
        id: ele.totals_id,
        handicap: ele.totals_handicap,
        over_tw: ele.totals_over_tw,
        // add_time: ele.spread_add_time,
        disable: false
      }
    };
    if (ele.status === scheduledStatus) {
      data.scheduled.push(temp);
    } else if (ele.status === inPlayStatus) {
      data.inplay.push(temp);
    } else if (ele.status === endStatus) {
      data.end.push(temp);
    }
  }
  return data;
}
module.exports = getMatches;
