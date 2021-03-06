const leagueUtil = require('../../util/leagueUtil');
const firebaseAdmin = require('../../util/firebaseUtil');
const firestore = firebaseAdmin().firestore();
const db = require('../../util/dbUtil');
const AppErrors = require('../../util/AppErrors');
const { logger } = require('firebase-functions');
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
        // index is const, except match__seasons, match__spreads, match__totals table is ref, taking 170ms
        `SELECT game.bets_id, game.league_id, game.home_id, game.away_id, game.season, game.status, game.scheduled, game.home_player, game.away_player, 
                home.name AS home_name, home.name_ch AS home_name_ch, home.alias AS home_alias, home.alias_ch AS home_alias_ch, home.image_id AS home_image_id, 
                away.name AS away_name, away.name_ch AS away_name_ch, away.alias AS away_alias, away.alias_ch AS away_alias_ch, away.image_id AS away_image_id,
                spread.spread_id, spread.handicap AS spread_handicap, spread.home_tw, spread.away_tw, spread.rate AS spread_rate, 
                totals.totals_id, totals.handicap AS totals_handicap, totals.over_tw, totals.rate AS totals_rate
          FROM (
                  SELECT matches.bets_id, matches.league_id, matches.spread_id, matches.totals_id, matches.home_id, matches.away_id, matches.status, matches.scheduled, matches.home_player, matches.away_player, season.season
                    FROM matches
               LEFT JOIN match__seasons AS season ON season.league_id = matches.league_id
                   WHERE matches.scheduled BETWEEN UNIX_TIMESTAMP(season.start_date) AND UNIX_TIMESTAMP(season.end_date)
               ) 
            AS game
     LEFT JOIN match__teams AS home ON game.home_id = home.team_id
     LEFT JOIN match__teams AS away ON game.away_id = away.team_id
     LEFT JOIN match__spreads AS spread ON game.spread_id = spread.spread_id
     LEFT JOIN match__totals AS totals ON game.totals_id = totals.totals_id
         WHERE game.league_id = :league_id
           AND bets_id = :bets_id`,
        {
          type: db.sequelize.QueryTypes.SELECT,
          replacements: {
            league_id: leagueUtil.leagueCodebook(args.league).id,
            bets_id: args.event_id
          }
        });

      !result.length ? reject(new AppErrors.MatchNotFound()) : resolve(result[0]);
    } catch (err) {
      return reject(new AppErrors.MysqlError(err.stack));
    }
  });
}

function getPrematchFromFirestore(args, matchData) {
  return new Promise(async function(resolve, reject) {
    try {
      const { home_id, away_id, season } = matchData;
      const homeData = await firestore.collection(`baseball_${args.league}`).doc(home_id).get();
      const awayData = await firestore.collection(`baseball_${args.league}`).doc(away_id).get();
      // error handle when home or away data is not found
      if (!homeData.exists || !awayData.exists || JSON.stringify(homeData.data()) === '{}' || JSON.stringify(awayData.data()) === '{}') {
        // return reject(new AppErrors.TeamInformationNotFound());
        return resolve({ homeData: {}, awayData: {} });
      } else {
        return resolve({ homeData: homeData.data()[`season_${season}`], awayData: awayData.data()[`season_${season}`] });
      }
    } catch (err) {
      return reject(new AppErrors.FirestoreQueryError(err.stack));
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
                 historygame.bets_id AS id, historygame.scheduled AS scheduled, historygame.home_id AS history_home_id, historygame.away_id AS history_away_id,
                 historygame.spread_result AS history_spread_result, historygame.totals_result AS history_totals_result, spread.handicap AS spread_handicap, totals.handicap AS totals_handicap
            FROM matches AS game,
                 matches AS historygame,
                 match__spreads AS spread,
                 match__totals AS totals
           WHERE game.bets_id = :event_id
             AND historygame.status = ${leagueUtil.MATCH_STATUS.END}
             AND game.league_id = :leagueID
             AND (game.home_id = historygame.home_id OR game.home_id = historygame.away_id) 
             AND historygame.bets_id = spread.match_id
             AND historygame.spread_id = spread.spread_id
             AND historygame.bets_id = totals.match_id
             AND historygame.totals_id = totals.totals_id
        ORDER BY historygame.scheduled DESC     
        LIMIT ${limit}
        )`,
        {
          replacements: {
            leagueID: leagueUtil.leagueCodebook(args.league).id,
            event_id: args.event_id
          },
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      return resolve(queries);
    } catch (err) {
      return reject(new AppErrors.MysqlError(err.stack));
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
               match__spreads AS spread,
               match__totals AS totals
         WHERE game.bets_id = :event_id
           AND historygame.status = ${leagueUtil.MATCH_STATUS.END}
           AND game.league_id = :leagueID
           AND (game.away_id = historygame.home_id OR game.away_id = historygame.away_id) 
           AND historygame.bets_id = spread.match_id
           AND historygame.spread_id = spread.spread_id
           AND historygame.bets_id = totals.match_id
           AND historygame.totals_id = totals.totals_id
      ORDER BY historygame.scheduled DESC
         LIMIT ${limit}        
        )`,
        {
          replacements: {
            leagueID: leagueUtil.leagueCodebook(args.league).id,
            event_id: args.event_id
          },
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      return resolve(queries);
    } catch (err) {
      return reject(new AppErrors.MysqlError(err.stack));
    }
  });
}

function repackagePrematch(args, teamsFromFirestore, teamsFromMySQL, events, fights) {
  const { homeData, awayData } = teamsFromFirestore;
  const rate = repackagePassRate(events);
  const tenFights = repackageTenFights(args, fights);
  const { homePlayer, awayPlayer, homePlayerIsNull, awayPlayerIsNull } = checkPlayer(teamsFromMySQL);
  try {
    const data = {
      season: teamsFromMySQL.season,
      status: teamsFromMySQL.status,
      sport: leagueUtil.league2Sport(args.league).sport,
      league: args.league,
      league_id: teamsFromMySQL.league_id,
      ori_league: leagueUtil.leagueCodebook(args.league).name_ch,
      scheduled: teamsFromMySQL.scheduled,
      spread: {
        id: teamsFromMySQL.spread_id,
        handicap: teamsFromMySQL.spread_handicap,
        rate: teamsFromMySQL.spread_rate > 0 ? `+${teamsFromMySQL.spread_rate}` : String(teamsFromMySQL.spread_rate),
        home_tw: teamsFromMySQL.home_tw,
        away_tw: teamsFromMySQL.away_tw
      },
      totals: {
        id: teamsFromMySQL.totals_id,
        handicap: teamsFromMySQL.totals_handicap,
        rate: teamsFromMySQL.totals_rate > 0 ? `+${teamsFromMySQL.totals_rate}` : String(teamsFromMySQL.totals_rate),
        over_tw: teamsFromMySQL.over_tw
      },
      home: {
        team_id: teamsFromMySQL.home_id,
        team_name: teamsFromMySQL.home_alias_ch,
        name: teamsFromMySQL.home_name,
        alias: teamsFromMySQL.home_alias,
        alias_ch: teamsFromMySQL.home_alias_ch,
        name_ch: teamsFromMySQL.home_name_ch,
        image_id: teamsFromMySQL.home_image_id,
        team_base: {
          spread_rate: Number((rate.home_spread_rate).toFixed(2)),
          totals_rate: Number((rate.home_totals_rate).toFixed(2)),
          L10: homeData.team_base ? homeData.team_base.L10 : null,
          STRK: homeData.team_base ? homeData.team_base.STRK : null,
          Win: homeData.team_base ? homeData.team_base.Win : null,
          Loss: homeData.team_base ? homeData.team_base.Loss : null,
          Draw: homeData.team_base ? homeData.team_base.Draw : null,
          at_home: homeData.team_base ? homeData.team_base.at_home : null,
          at_away: homeData.team_base ? homeData.team_base.at_away : null,
          per_R: homeData.team_base ? homeData.team_base.per_R : null,
          allow_per_R: homeData.team_base ? homeData.team_base.per_allow_R : null
        },
        pitcher: {
          id: homePlayerIsNull ? null : homePlayer.pitchers.id,
          name: homePlayerIsNull ? null : homePlayer.pitchers.name,
          ori_name: homePlayerIsNull ? null : homePlayer.pitchers.ori_name,
          Win: homePlayerIsNull ? null : homePlayer.pitchers.Win,
          Loss: homePlayerIsNull ? null : homePlayer.pitchers.Loss,
          ERA: homePlayerIsNull ? null : homePlayer.pitchers.ERA,
          SO: homePlayerIsNull ? null : homePlayer.pitchers.SO,
          jersey_id: homePlayerIsNull ? null : homePlayer.pitchers.jersey_id
        },
        team_hit: {
          R: homeData.team_hit ? homeData.team_hit.R : null,
          H: homeData.team_hit ? homeData.team_hit.H : null,
          HR: homeData.team_hit ? homeData.team_hit.HR : null,
          AVG: homeData.team_hit ? homeData.team_hit.AVG : null,
          OBP: homeData.team_hit ? homeData.team_hit.OBP : null,
          SLG: homeData.team_hit ? homeData.team_hit.SLG : null
        }
      },
      away: {
        team_id: teamsFromMySQL.away_id,
        team_name: teamsFromMySQL.away_alias_ch,
        name: teamsFromMySQL.away_name,
        alias: teamsFromMySQL.away_alias,
        alias_ch: teamsFromMySQL.away_alias_ch,
        name_ch: teamsFromMySQL.away_name_ch,
        image_id: teamsFromMySQL.away_image_id,
        team_base: {
          spread_rate: Number((rate.away_spread_rate).toFixed(2)),
          totals_rate: Number((rate.away_totals_rate).toFixed(2)),
          L10: awayData.team_base ? awayData.team_base.L10 : null,
          STRK: awayData.team_base ? awayData.team_base.STRK : null,
          Win: awayData.team_base ? awayData.team_base.Win : null,
          Loss: awayData.team_base ? awayData.team_base.Loss : null,
          Draw: awayData.team_base ? awayData.team_base.Draw : null,
          at_home: awayData.team_base ? awayData.team_base.at_home : null,
          at_away: awayData.team_base ? awayData.team_base.at_away : null,
          per_R: awayData.team_base ? awayData.team_base.per_R : null,
          allow_per_R: awayData.team_base ? awayData.team_base.allow_per_R : null
        },
        pitcher: {
          id: awayPlayerIsNull ? null : awayPlayer.pitchers.id,
          name: awayPlayerIsNull ? null : awayPlayer.pitchers.name,
          ori_name: awayPlayerIsNull ? null : awayPlayer.pitchers.ori_name,
          Win: awayPlayerIsNull ? null : awayPlayer.pitchers.Win,
          Loss: awayPlayerIsNull ? null : awayPlayer.pitchers.Loss,
          ERA: awayPlayerIsNull ? null : awayPlayer.pitchers.ERA,
          SO: awayPlayerIsNull ? null : awayPlayer.pitchers.SO,
          jersey_id: awayPlayerIsNull ? null : awayPlayer.pitchers.jersey_id
        },
        team_hit: {
          R: awayData.team_hit ? awayData.team_hit.R : null,
          H: awayData.team_hit ? awayData.team_hit.H : null,
          HR: awayData.team_hit ? awayData.team_hit.HR : null,
          AVG: awayData.team_hit ? awayData.team_hit.AVG : null,
          OBP: awayData.team_hit ? awayData.team_hit.OBP : null,
          SLG: awayData.team_hit ? awayData.team_hit.SLG : null
        }
      },
      L10_record: tenFights
    };
    return data;
  } catch (err) {
    throw new AppErrors.RepackageError(err.stack);
  }
}

function checkPlayer(teamsFromMySQL) {
  const homePlayer = JSON.parse(teamsFromMySQL.home_player);
  const awayPlayer = JSON.parse(teamsFromMySQL.away_player);
  let homePlayerIsNull = true;
  let awayPlayerIsNull = true;

  if (homePlayer) {
    homePlayerIsNull = homePlayer.pitchers === null;
    if (homePlayer.pitchers) {
      if (homePlayer.pitchers.id === 0) homePlayerIsNull = true;
    }
  }
  if (awayPlayer) {
    awayPlayerIsNull = awayPlayer.pitchers === null;
    if (awayPlayer.pitchers) {
      if (awayPlayer.pitchers.id === 0) awayPlayerIsNull = true;
    }
  }
  return { homePlayer, awayPlayer, homePlayerIsNull, awayPlayerIsNull };
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
      home_spread_rate: (homeAtGivePass + homeAtBeGivenPass) / homeEvents.length,
      home_totals_rate: homeAtOverPass / homeEvents.length,
      away_spread_rate: (awayAtGivePass + awayAtBeGivenPass) / awayEvents.length,
      away_totals_rate: awayAtOverPass / awayEvents.length
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
               AND five.status = ${leagueUtil.MATCH_STATUS.END}
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
               AND five.status = ${leagueUtil.MATCH_STATUS.END}
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
               AND five.status = ${leagueUtil.MATCH_STATUS.END}
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
               AND five.status = ${leagueUtil.MATCH_STATUS.END}
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
            leagueID: leagueUtil.leagueCodebook(args.league).id,
            event_id: args.event_id
          },
          type: db.sequelize.QueryTypes.SELECT
        }
      );
      return resolve(queries);
    } catch (err) {
      return reject(new AppErrors.MysqlError(err.stack));
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
    logger.error(err.stack);
    throw new AppErrors.RepackageError(err.stack);
  }
}

module.exports = prematchBaseball;
