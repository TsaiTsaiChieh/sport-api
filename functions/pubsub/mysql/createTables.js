const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
const data_team_NBA = require('../../json/teams/NBA.json');
const data_league = require('../../json/matches/league.json');
const data_spread_NBA = require('../../json/spread/NBA.json');
const data_totals_NBA = require('../../json/totals/NBA.json');
const data_match_NBA = require('../../json/matches/NBA.json');
async function create(req, res) {
  try {
    // const League = await db.sequelize.models.match__league.sync({
    //   force: true
    // });
    // for (let i = 0; i < data_league.length; i++) {
    //   const ele = data_league[i];
    //   League.create({
    //     league_id: ele.league_id,
    //     radar_id: ele.radar_id,
    //     sport: ele.sport,
    //     name: ele.name,
    //     name_ch: ele.name_ch
    //   });
    // }
    // const Spread = await db.sequelize.models.match__spread.sync({
    //   force: true
    // });
    // for (let i = 0; i < data_spread_NBA.length; i++) {
    //   const ele = data_spread_NBA[i];

    //   const data = {
    //     spread_id: ele.spread_id,
    //     match_id: ele.match_id,
    //     handicap: ele.handicap,
    //     add_time: ele.add_time,
    //     home_odd: ele.home_odd,
    //     away_odd: ele.away_odd,
    //     league_id: ele.league_id
    //   };
    //   if (ele.home_tw) data.home_tw = ele.home_tw;
    //   if (ele.away_tw) data.away_tw = ele.away_tw;
    //   Spread.create(data);
    // }
    // const Totals = await db.sequelize.models.match__total.sync({ force: true });
    // for (let i = 0; i < data_totals_NBA.length; i++) {
    //   const ele = data_totals_NBA[i];
    //   const data = {
    //     totals_id: ele.totals_id,
    //     match_id: ele.match_id,
    //     handicap: ele.handicap,
    //     add_time: ele.add_time,
    //     over_odd: ele.over_odd,
    //     under_odd: ele.under_odd,
    //     league_id: ele.league_id,
    //     over_tw: ele.over_tw
    //   };

    //   Totals.create(data);
    // }

    // const team_NBA = await db.sequelize.models.match__team__NBA.sync({
    //   force: true
    // });
    // for (let i = 0; i < data_team_NBA.length; i++) {
    //   const ele = data_team_NBA[i];
    //   team_NBA.create({
    //     team_id: ele.team_id,
    //     radar_id: ele.radar_id,
    //     image_id: ele.image_id,
    //     alias: ele.alias,
    //     alias_ch: ele.alias_ch,
    //     name: ele.name,
    //     name_ch: ele.name_ch
    //   });
    // }
    const Match = await db.sequelize.models.match__NBA.sync({ force: true });
    for (let i = 0; i < data_match_NBA.length; i++) {
      const ele = data_match_NBA[i];
      const data = {
        bets_id: ele.bets_id,
        radar_id: ele.radar_id,
        home_id: ele.home_id,
        away_id: ele.away_id,
        spread_id: ele.spread_id,
        totals_id: ele.totals_id,
        sr_id: ele.sr_id,
        scheduled: ele.scheduled,
        scheduled_tw: ele.scheduled * 1000,
        flag_prematch: ele.flag_prematch,
        status: ele.status
      };
      if (ele.spread_result) data.spread_result = ele.spread_result;
      if (ele.totals_result) data.totals_result = ele.totals_result;
      if (ele.home_points) data.home_points = ele.home_points;
      if (ele.away_points) data.away_points = ele.away_points;
      Match.create(data);
    }
    res.json('ok');
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
}
module.exports = create;