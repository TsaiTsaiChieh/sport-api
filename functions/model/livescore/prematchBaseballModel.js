const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
const AppErrors = require('../../util/AppErrors');
const limit = 10;

function prematchBaseball(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const teamsDataFromMySQL = await getHomeAndAwayTeamFromMySQL(args);
      const teamsDataFromFirestore = await getPrematchFromFirestore(args, teamsDataFromMySQL);
      const homeEvents = await queryHomeEvents(args);
      const awayEvents = await queryAwayEvents(args);
      const tenFightData = await queryTenFightEvent(args);
      return resolve(repackagePrematch(args, teamsDataFromFirestore, teamsDataFromMySQL, { homeEvents, awayEvents }, tenFightData));
    } catch (err) {
      return reject(err);
    }
  });
}

function getHomeAndAwayTeamFromMySQL(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const result = await db.sequelize.query(
        // index is const, except match__seasons table is ref, taking 170ms
        `SELECT game.bets_id, game.home_id, game.away_id, game.season,
                home.name AS home_name, home.name_ch AS home_name_ch, home.alias AS home_alias, home.alias_ch AS home_alias_ch, 
                away.name AS away_name, away.name_ch AS away_name_ch, away.alias AS away_alias, away.alias_ch AS away_alias_ch
          FROM (
                  SELECT matches.league_id, matches.bets_id, matches.home_id, matches.away_id, matches.scheduled, season.season
                    FROM matches
               LEFT JOIN match__seasons AS season ON season.league_id = matches.league_id
                   WHERE matches.scheduled BETWEEN UNIX_TIMESTAMP(season.start_date) AND UNIX_TIMESTAMP(season.end_date)
               ) 
            AS game
     LEFT JOIN match__teams AS home ON game.home_id = home.team_id
     LEFT JOIN match__teams AS away ON game.away_id = away.team_id
         WHERE game.league_id = :league_id
           AND bets_id = :bets_id`,
        {
          type: db.sequelize.QueryTypes.SELECT,
          replacements: {
            league_id: modules.leagueCodebook(args.league).id,
            bets_id: args.event_id
          }
        });

      !result.length ? reject(new AppErrors.MatchNotFound()) : resolve(result[0]);
    } catch (err) {
      return reject(new AppErrors.MysqlError(`${err.stack} by TsaiChieh`));
    }
  });
}

function getPrematchFromFirestore(args, matchData) {
  return new Promise(async function(resolve, reject) {
    try {
      const { home_id, away_id, season } = matchData;
      const homeData = await modules.getSnapshot(`baseball_${args.league}`, home_id);
      const awayData = await modules.getSnapshot(`baseball_${args.league}`, away_id);
      // error handle when home or away data is not found
      if (!homeData.exists || !awayData.exists) return reject(new AppErrors.TeamInformationNotFound());
      return resolve({ homeData: homeData.data()[`season_${season}`], awayData: awayData.data()[`season_${season}`] });
    } catch (err) {
      return reject(new AppErrors.FirestoreQueryError(`${err.stack} by TsaiChieh`));
    }
  });
}

function queryHomeEvents(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const queries = await db.sequelize.query(
        // take 169 ms
        `(
          SELECT game.home_id AS aim_home_id, game.away_id AS aim_away_id,
                 historygame.bets_id AS id, historygame.scheduled AS scheduled,  historygame.home_id AS history_home_id, historygame.away_id AS history_away_id,
                 historygame.spread_result AS history_spread_result, historygame.totals_result AS history_totals_result, spread.handicap AS spread_handicap, totals.handicap AS totals_handicap
            FROM matches AS game,
                 matches AS historygame,
                 match__seasons AS season,
                 match__spreads AS spread,
                 match__totals AS totals
           WHERE game.bets_id = :event_id
             AND historygame.status = ${modules.MATCH_STATUS.END}
             AND game.league_id = :leagueID
             AND season.league_id = :leagueID
             AND (game.home_id = historygame.home_id OR game.home_id = historygame.away_id) 
             AND game.scheduled BETWEEN UNIX_TIMESTAMP(season.start_date) AND (UNIX_TIMESTAMP(season.end_date)+86400)
             AND historygame.bets_id = spread.match_id
             AND historygame.spread_id = spread.spread_id
             AND historygame.bets_id = totals.match_id
             AND historygame.totals_id = totals.totals_id
        ORDER BY historygame.scheduled      
        LIMIT ${limit}
        )`,
        {
          replacements: {
            leagueID: modules.leagueCodebook(args.league).id,
            event_id: args.event_id
          },
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      return resolve(await queries);
    } catch (err) {
      return reject(`${err.stack} by DY`);
    }
  });
}

function queryAwayEvents(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const queries = await db.sequelize.query(
        // take 169 ms
        `(
        SELECT game.home_id AS aim_home_id, game.away_id AS aim_away_id,
               historygame.bets_id AS id, historygame.scheduled AS scheduled,  historygame.home_id AS history_home_id, historygame.away_id AS history_away_id,
               historygame.spread_result AS history_spread_result, historygame.totals_result AS history_totals_result, spread.handicap AS spread_handicap, totals.handicap AS totals_handicap
          FROM matches AS game,
               matches AS historygame,
               match__seasons AS season,
               match__spreads AS spread,
               match__totals AS totals
         WHERE game.bets_id = :event_id
           AND historygame.status = ${modules.MATCH_STATUS.END}
           AND game.league_id = :leagueID
           AND season.league_id = :leagueID
           AND (game.away_id = historygame.home_id OR game.away_id = historygame.away_id) 
           AND game.scheduled BETWEEN UNIX_TIMESTAMP(season.start_date) AND (UNIX_TIMESTAMP(season.end_date)+86400)
           AND historygame.bets_id = spread.match_id
           AND historygame.spread_id = spread.spread_id
           AND historygame.bets_id = totals.match_id
           AND historygame.totals_id = totals.totals_id
      ORDER BY historygame.scheduled
         LIMIT ${limit}        
        )`,
        {
          replacements: {
            leagueID: modules.leagueCodebook(args.league).id,
            event_id: args.event_id
          },
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      return resolve(await queries);
    } catch (err) {
      return reject(`${err.stack} by DY`);
    }
  });
}

function repackagePrematch(args, teamsFromFirestore, teamsFromMySQL, events, fights) {
  const { homeData, awayData } = teamsFromFirestore;
  const rate = repackagePassRate(events);
  const tenFights = repackageTenFights(args, fights);

  try {
    const data = {
      season: teamsFromMySQL.season,
      home: {
        id: teamsFromMySQL.home_id,
        alias: teamsFromMySQL.home_alias,
        alias_ch: teamsFromMySQL.home_alias_ch,
        name: teamsFromMySQL.home_name,
        name_ch: teamsFromMySQL.home_name_ch,
        team_base: {
          spread_rate: rate.home_spread_rate,
          totals_rate: rate.home_totals_rate,
          L10: homeData.team_base.L10,
          Win: homeData.team_base.Win,
          Loss: homeData.team_base.Loss,
          Draw: homeData.team_base.Draw,
          at_home: homeData.team_base.at_home,
          at_away: homeData.team_base.at_away,
          per_R: homeData.team_base.per_R,
          allow_per_R: homeData.team_base.per_allow_R
        },
        team_hit: {
          R: homeData.team_hit.R,
          H: homeData.team_hit.H,
          HR: homeData.team_hit.HR,
          AVG: homeData.team_hit.AVG,
          OBP: homeData.team_hit.OBP,
          SLG: homeData.team_hit.SLG
        }
      },
      away: {
        id: teamsFromMySQL.away_id,
        alias: teamsFromMySQL.away_alias,
        alias_ch: teamsFromMySQL.away_alias_ch,
        name: teamsFromMySQL.away_name,
        name_ch: teamsFromMySQL.away_name_ch,
        team_base: {
          spread_rate: rate.away_spread_rate,
          totals_rate: rate.away_totals_rate,
          L10: awayData.team_base.L10,
          Win: awayData.team_base.Win,
          Loss: awayData.team_base.Loss,
          Draw: awayData.team_base.Draw,
          at_home: awayData.team_base.at_home,
          at_away: awayData.team_base.at_away,
          per_R: awayData.team_base.per_R,
          allow_per_R: awayData.team_base.allow_per_R
        },
        team_hit: {
          R: awayData.team_hit.R,
          H: awayData.team_hit.H,
          HR: awayData.team_hit.HR,
          AVG: awayData.team_hit.AVG,
          OBP: awayData.team_hit.OBP,
          SLG: awayData.team_hit.SLG
        }
      },
      L10_record: tenFights

    };
    return data;
  } catch (err) {
    console.error(err);
    throw new AppErrors.RepackageError(`${err.stack} by TsaiChieh`);
  }
}

function repackagePassRate(events) {
  const { homeEvents, awayEvents } = events;
  try {
    let homeAtGivePass = 0;
    let homeAtGiveFail = 0;
    let homeAtGiveFair = 0;
    let homeAtBeGivenPass = 0;
    let homeAtBeGivenFail = 0;
    let homeAtBeGivenFair = 0;
    let awayAtGivePass = 0;
    let awayAtGiveFail = 0;
    let awayAtGiveFair = 0;
    let awayAtBeGivenPass = 0;
    let awayAtBeGivenFail = 0;
    let awayAtBeGivenFair = 0;
    let homeAtOverPass = 0;
    let homeAtOverFail = 0;
    let homeAtOverFair = 0;
    let awayAtOverPass = 0;
    let awayAtOverFail = 0;
    let awayAtOverFair = 0;

    for (let i = 0; i < homeEvents.length; i++) {
      const ele = homeEvents[i];
      if (ele.aim_home_id === ele.history_home_id) {
        if (ele.spread_handicap > 0) {
          // 主隊讓分
          if (
            ele.history_spread_result === 'home' ||
            ele.history_spread_result === 'fair|home'
          ) {
            // 主讓分且贏
            homeAtGivePass = homeAtGivePass + 1;
          } else if (
            ele.history_spread_result === 'away' ||
            ele.history_spread_result === 'fair|away'
          ) {
            // 主讓分且輸
            homeAtGiveFail = homeAtGiveFail + 1;
          } else {
            // 主讓分結果為平
            homeAtGiveFair = homeAtGiveFair + 1;
          }
        } else if (ele.spread_handicap < 0) {
          // 主隊被讓分
          if (
            ele.history_spread_result === 'home' ||
            ele.history_spread_result === 'fair|home'
          ) {
            // 主受讓分且贏
            homeAtBeGivenPass = homeAtBeGivenPass + 1;
          } else if (
            ele.history_spread_result === 'away' ||
            ele.history_spread_result === 'fair|away'
          ) {
            // 主受讓分且輸
            homeAtBeGivenFail = homeAtBeGivenFail + 1;
          } else {
            // 主受讓分結果為平
            homeAtBeGivenFair = homeAtBeGivenFair + 1;
          }
        } else {
        }
      }
      if (ele.aim_home_id === ele.history_away_id) {
        if (ele.spread_handicap > 0) {
          // 主受讓
          if (
            ele.history_spread_result === 'home' ||
            ele.history_spread_result === 'fair|home'
          ) {
            homeAtBeGivenFail = homeAtBeGivenFail + 1;
          } else if (
            ele.history_spread_result === 'away' ||
            ele.history_spread_result === 'fair|away'
          ) {
            // 主讓分且輸
            homeAtBeGivenPass = homeAtBeGivenPass + 1;
          } else {
            // 主讓分結果為平
            homeAtBeGivenFair = homeAtBeGivenFair + 1;
          }
        } else if (ele.spread_handicap < 0) {
          // 主讓
          if (
            ele.history_spread_result === 'home' ||
            ele.history_spread_result === 'fair|home'
          ) {
            homeAtGiveFail = homeAtGiveFail + 1;
          } else if (
            ele.history_spread_result === 'away' ||
            ele.history_spread_result === 'fair|away'
          ) {
            homeAtGivePass = homeAtGivePass + 1;
          } else {
            homeAtGiveFair = homeAtGiveFair + 1;
          }
        } else {
        }
      }
      // 主隊大小分
      if (
        ele.history_totals_result === 'over' ||
        ele.history_totals_result === 'fair|over'
      ) {
        homeAtOverPass = homeAtOverPass + 1;
      } else if (
        ele.history_totals_result === 'under' ||
        ele.history_totals_result === 'fair|under'
      ) {
        homeAtOverFail = homeAtOverFail + 1;
      } else {
        homeAtOverFair = homeAtOverFair + 1;
      }
    }
    for (let i = 0; i < awayEvents.length; i++) {
      const ele = awayEvents[i];
      if (ele.aim_away_id === ele.history_home_id) {
        if (ele.spread_handicap > 0) {
          // 客隊讓分
          if (
            ele.history_spread_result === 'home' ||
            ele.history_spread_result === 'fair|home'
          ) {
            // 客讓分且贏
            awayAtGivePass = awayAtGivePass + 1;
          } else if (
            ele.history_spread_result === 'away' ||
            ele.history_spread_result === 'fair|away'
          ) {
            // 客讓分且輸
            awayAtGiveFail = awayAtGiveFail + 1;
          } else {
            // 客讓分結果為平
            awayAtGiveFair = awayAtGiveFair + 1;
          }
        } else if (ele.spread_handicap < 0) {
          // 客隊被讓分
          if (
            ele.history_spread_result === 'home' ||
            ele.history_spread_result === 'fair|home'
          ) {
            // 客隊被讓分且贏
            awayAtBeGivenPass = awayAtBeGivenPass + 1;
          } else if (
            ele.history_spread_result === 'away' ||
            ele.history_spread_result === 'fair|away'
          ) {
            // 客隊被讓分且輸
            awayAtBeGivenFail = awayAtBeGivenFail + 1;
          } else {
            // 客隊被讓分結果為平
            awayAtBeGivenFair = awayAtBeGivenFair + 1;
          }
        } else {
        }
      }
      if (ele.aim_away_id === ele.history_away_id) {
        if (ele.spread_handicap > 0) {
          // 客受讓
          if (
            ele.history_spread_result === 'home' ||
            ele.history_spread_result === 'fair|home'
          ) {
            awayAtBeGivenFail = awayAtBeGivenFail + 1;
          } else if (
            ele.history_spread_result === 'away' ||
            ele.history_spread_result === 'fair|away'
          ) {
            // 主讓分且輸
            awayAtBeGivenPass = awayAtBeGivenPass + 1;
          } else {
            // 主讓分結果為平
            awayAtBeGivenFair = awayAtBeGivenFair + 1;
          }
        } else if (ele.spread_handicap < 0) {
          // 客讓
          if (
            ele.history_spread_result === 'home' ||
            ele.history_spread_result === 'fair|home'
          ) {
            awayAtGiveFail = awayAtGiveFail + 1;
          } else if (
            ele.history_spread_result === 'away' ||
            ele.history_spread_result === 'fair|away'
          ) {
            awayAtGivePass = awayAtGivePass + 1;
          } else {
            awayAtGiveFair = awayAtGiveFair + 1;
          }
        } else {
        }
      }
      if (
        ele.history_totals_result === 'over' ||
        ele.history_totals_result === 'fair|over'
      ) {
        awayAtOverPass = awayAtOverPass + 1;
      } else if (
        ele.history_totals_result === 'under' ||
        ele.history_totals_result === 'fair|under'
      ) {
        awayAtOverFail = awayAtOverFail + 1;
      } else {
        awayAtOverFair = awayAtOverFair + 1;
      }
    }
    return {
      home_spread_rate: homeAtGivePass / 10,
      home_totals_rate: homeAtOverPass / 10,
      away_spread_rate: awayAtGivePass / 10,
      away_totals_rate: awayAtOverPass / 10
    };
  } catch (err) {
    console.error(err);
  }
}

function queryTenFightEvent(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const queries = await db.sequelize.query(
        // take 169 ms
        `(
          SELECT five.bets_id AS id, five.home_points AS home_points, five.away_points AS away_points, five.spread_result AS spread_result, five.totals_result AS totals_result, five.scheduled AS scheduled,
                   home.name AS home_name, home.alias_ch AS home_alias_ch, away.alias AS away_alias, away.alias_ch AS away_alias_ch,
                   spread.home_tw AS spread_home_tw, spread.away_tw AS spread_away_tw, total.over_tw AS totals_over_tw
              FROM matches AS game,
                   matches AS five,
                   match__spreads AS spread,
                   match__totals AS total,
                   match__teams AS home,
                   match__teams AS away
             WHERE game.bets_id = :event_id
               AND five.bets_id != :event_id
               AND five.status = ${modules.MATCH_STATUS.END}
               AND ((game.home_id = five.home_id AND game.away_id = five.away_id) OR (game.home_id = five.away_id AND game.away_id = five.home_id))
               AND five.league_id = :leagueID
               AND five.home_id = home.team_id
               AND five.away_id = away.team_id 
               AND five.spread_id = spread.spread_id
               AND five.totals_id = total.totals_id
					 )
					 UNION(
            SELECT five.bets_id AS id, five.home_points AS home_points, five.away_points AS away_points, five.spread_result AS spread_result, five.totals_result AS totals_result, five.scheduled AS scheduled,
                   home.name AS home_name, home.alias_ch AS home_alias_ch, away.alias AS away_alias, away.alias_ch AS away_alias_ch,
                   NULL AS spread_home_tw, NULL AS spread_away_tw, total.over_tw AS totals_over_tw
              FROM matches AS game,
                   matches AS five,
									 match__teams AS home,
									 match__totals AS total,
                   match__teams AS away
             WHERE game.bets_id = :event_id
               AND five.status = ${modules.MATCH_STATUS.END}
               AND five.bets_id != :event_id
               AND ((game.home_id = five.home_id AND game.away_id = five.away_id) OR (game.home_id = five.away_id AND game.away_id = five.home_id))
               AND five.league_id = :leagueID
               AND five.home_id = home.team_id
               AND five.away_id = away.team_id 
							 AND five.spread_id IS NULL 
							 AND five.totals_id = total.totals_id    
					) 
					UNION(
            SELECT five.bets_id AS id, five.home_points AS home_points, five.away_points AS away_points, five.spread_result AS spread_result, five.totals_result AS totals_result, five.scheduled AS scheduled,
                   home.name AS home_name, home.alias_ch AS home_alias_ch, away.alias AS away_alias, away.alias_ch AS away_alias_ch,
                   spread.home_tw AS spread_home_tw, spread.away_tw AS spread_away_tw, NULL AS totals_over_tw
              FROM matches AS game,
                   matches AS five,
									 match__teams AS home,
									 match__spreads AS spread,
                   match__teams AS away
             WHERE game.bets_id = :event_id
               AND five.status = ${modules.MATCH_STATUS.END}
               AND five.bets_id != :event_id
               AND ((game.home_id = five.home_id AND game.away_id = five.away_id) OR (game.home_id = five.away_id AND game.away_id = five.home_id))
               AND five.league_id = :leagueID
               AND five.home_id = home.team_id
							 AND five.away_id = away.team_id 
							 AND five.spread_id = spread.spread_id
               AND five.totals_id IS NULL  
          ) 
          UNION(
            SELECT five.bets_id AS id, five.home_points AS home_points, five.away_points AS away_points, five.spread_result AS spread_result, five.totals_result AS totals_result, five.scheduled AS scheduled,
                   home.name AS home_name, home.alias_ch AS home_alias_ch, away.alias AS away_alias, away.alias_ch AS away_alias_ch,
                   NULL AS spread_home_tw, NULL AS spread_away_tw, NULL AS totals_over_tw
              FROM matches AS game,
                   matches AS five,
                   match__teams AS home,
                   match__teams AS away
             WHERE game.bets_id = :event_id
               AND five.status = ${modules.MATCH_STATUS.END}
               AND five.bets_id != :event_id
               AND ((game.home_id = five.home_id AND game.away_id = five.away_id) OR (game.home_id = five.away_id AND game.away_id = five.home_id))
               AND five.league_id = :leagueID
               AND five.home_id = home.team_id
               AND five.away_id = away.team_id 
               AND (five.spread_id IS NULL AND five.totals_id IS NULL)       
          ) 
          ORDER BY scheduled   
          LIMIT 10             
          `,
        {
          replacements: {
            leagueID: modules.leagueCodebook(args.league).id,
            event_id: args.event_id
          },
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      return resolve(await queries);
    } catch (err) {
      return reject(new AppErrors.MysqlError(`${err.stack} by DY`));
    }
  });
}

function repackageTenFights(args, events) {
  try {
    const data = [];
    for (let i = 0; i < events.length; i++) {
      const ele = events[i];

      let temp;
      if (ele.spread_result === 'fair|away') {
        ele.spread_result = 'away';
      }
      if (ele.spread_result === 'fair|home') {
        ele.spread_result = 'home';
      }
      if (ele.totals_result === 'fair|over') {
        ele.totals_result = 'over';
      }
      if (ele.totals_result === 'fair|under') {
        ele.totals_result = 'under';
      }
      let result_tw;
      if (ele.spread_home_tw && ele.spread_home_tw !== 'pk') {
        if (ele.spread_result === 'home') {
          result_tw = `讓${ele.spread_home_tw}`;
        } else if (ele.spread_result === 'away') {
          result_tw = `受讓${ele.spread_home_tw}`;
        } else {
        }
      } else if (ele.spread_away_tw && ele.spread_away_tw !== 'pk') {
        if (ele.spread_result === 'home') {
          result_tw = `受讓${ele.spread_away_tw}`;
        } else if (ele.spread_result === 'away') {
          result_tw = `讓${ele.spread_away_tw}`;
        } else {
        }
      } else if (ele.spread_home_tw === 'pk' || ele.spread_away_tw === 'pk') {
        result_tw = 'pk';
      } else {
        result_tw = null;
      }

      if (args.league === 'eSoccer') {
        temp = {
          scheduled: ele.scheduled,
          id: ele.id,
          home_name_ch: ele.home_alias_ch
            ? ele.home_alias_ch.split('(')[0].trim()
            : ele.home_alias.split('(')[0].trim(),

          away_name_ch: ele.away_alias_ch
            ? ele.away_alias_ch.split('(')[0].trim()
            : ele.away_alias.split('(')[0].trim(),

          home_points: ele.home_points,
          away_points: ele.away_points,
          spread_result: ele.spread_result,
          totals_result: ele.totals_result,
          home_tw: ele.spread_home_tw,
          away_tw: ele.spread_away_tw,
          result_tw: result_tw,
          over_tw: ele.totals_over_tw
        };
      } else {
        temp = {
          scheduled: ele.scheduled,
          id: ele.id,
          home_name_ch: ele.home_alias_ch
            ? ele.home_alias_ch
            : ele.home_alias,
          away_name_ch: ele.away_alias_ch
            ? ele.away_alias_ch
            : ele.away_alias,
          home_points: ele.home_points,
          away_points: ele.away_points,
          spread_result: ele.spread_result,
          totals_result: ele.totals_result,
          home_tw: ele.spread_home_tw,
          away_tw: ele.spread_away_tw,
          result_tw: result_tw,
          over_tw: ele.totals_over_tw
        };
      }
      data.push(temp);
    }

    return data;
  } catch (err) {
    console.error(`${err.stack} by DY`);
    throw new AppErrors.RepackageError(`${err.stack} by DY`);
  }
}

module.exports = prematchBaseball;
