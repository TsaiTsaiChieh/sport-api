const modules = require('../../util/modules');
const AppErrors = require('../../util/AppErrors');

async function livescore(args) {
  return new Promise(async function (resolve, reject) {
    try {
      const match = await queryMatch(args);
      const result = await repackage(args, match);
      resolve(result);
    } catch (err) {
      reject(err);
    }
  });
}
function queryMatch(args) {
  return new Promise(async function (resolve, reject) {
    try {
      const query = await modules.firestore
        .collection(modules.leagueCodebook(args.league).match)
        .where('bets_id', '==', args.eventID)
        .get();
      const match = [];
      query.docs.map(function (doc) {
        match.push(doc.data());
      });
      return resolve(await Promise.all(match));
    } catch (err) {
      return reject(`${err.stack} by DY`);
    }
  });
}
async function repackage(args, match) {
  try {
    if (args.league === 'NBA') {
      const queryHomeForHome = await modules.firestore
        .collection(modules.leagueCodebook(args.league).match)
        .where('home.alias', '==', match.home.alias)
        .where('scheduled', '<', match.scheduled)
        .orderBy('scheduled', 'desc')
        .limit(1)
        .get();
      let forLineupHome = [];
      queryHomeForHome.docs.map(function (doc) {
        forLineupHome.push(doc.data());
      });
      const queryAwayForHome = await modules.firestore
        .collection(modules.leagueCodebook(args.league).match)
        .where('away.alias', '==', match.home.alias)
        .where('scheduled', '<', match.scheduled)
        .orderBy('scheduled', 'desc')
        .limit(1)
        .get();
      let forLineupAway = [];
      queryAwayForHome.docs.map(function (doc) {
        forLineupAway.push(doc.data());
      });

      if (!forLineupHome.length === 0 && forLineupAway.length === 0) {
        match.history.lineup = {
          starter: {
            home: {
              lineup0: forLineupHome[0].lineups.home.starters['0'],
              lineup1: forLineupHome[0].lineups.home.starters['1'],
              lineup2: forLineupHome[0].lineups.home.starters['2'],
              lineup3: forLineupHome[0].lineups.home.starters['3'],
              lineup4: forLineupHome[0].lineups.home.starters['4']
            }
          }
        };
      }
      if (forLineupHome.length === 0 && !forLineupAway.length === 0) {
        match.history.lineup = {
          starter: {
            home: {
              lineup0: forLineupAway[0].lineups.away.starters['0'],
              lineup1: forLineupAway[0].lineups.away.starters['1'],
              lineup2: forLineupAway[0].lineups.away.starters['2'],
              lineup3: forLineupAway[0].lineups.away.starters['3'],
              lineup4: forLineupAway[0].lineups.away.starters['4']
            }
          }
        };
        if (!forLineupHome.length === 0 && !forLineupAway.length === 0) {
          if (forLineupHome[0].scheduled > forLineupAway[0].scheduled) {
            match.history.lineup = {
              starter: {
                home: {
                  lineup0: forLineupHome[0].lineups.home.starters['0'],
                  lineup1: forLineupHome[0].lineups.home.starters['1'],
                  lineup2: forLineupHome[0].lineups.home.starters['2'],
                  lineup3: forLineupHome[0].lineups.home.starters['3'],
                  lineup4: forLineupHome[0].lineups.home.starters['4']
                }
              }
            };
          } else {
            match.history.lineup = {
              starter: {
                home: {
                  lineup0: forLineupAway[0].lineups.away.starters['0'],
                  lineup1: forLineupAway[0].lineups.away.starters['1'],
                  lineup2: forLineupAway[0].lineups.away.starters['2'],
                  lineup3: forLineupAway[0].lineups.away.starters['3'],
                  lineup4: forLineupAway[0].lineups.away.starters['4']
                }
              }
            };
          }
          if (forLineupHome.length === 0 && forLineupAway.length === 0) {
            match.history.lineup.starters = { home: 'no history data' };
          }
          forLineupHome = [];
          forLineupAway = [];
          const queryHomeForAway = await modules.firestore
            .collection(modules.leagueCodebook(args.league).match)
            .where('home.alias', '==', match.away.alias)
            .where('scheduled', '<', match.scheduled)
            .orderBy('scheduled', 'desc')
            .limit(1)
            .get();
          queryHomeForAway.docs.map(function (doc) {
            forLineupHome.push(doc.data());
          });
          const queryAwayForAway = await modules.firestore
            .collection(modules.leagueCodebook(args.league).match)
            .where('away.alias', '==', match.away.alias)
            .where('scheduled', '<', match.scheduled)
            .orderBy('scheduled', 'desc')
            .limit(1)
            .get();
          queryAwayForAway.docs.map(function (doc) {
            forLineupAway.push(doc.data());
          });

          if (!forLineupHome.length === 0 && forLineupAway.length === 0) {
            match.history.lineup = {
              starter: {
                away: {
                  lineup0: forLineupHome[0].lineups.home.starters['0'],
                  lineup1: forLineupHome[0].lineups.home.starters['1'],
                  lineup2: forLineupHome[0].lineups.home.starters['2'],
                  lineup3: forLineupHome[0].lineups.home.starters['3'],
                  lineup4: forLineupHome[0].lineups.home.starters['4']
                }
              }
            };
          }
          if (forLineupHome.length === 0 && !forLineupAway.length === 0) {
            match.history.lineup = {
              starter: {
                away: {
                  lineup0: forLineupAway[0].lineups.away.starters['0'],
                  lineup1: forLineupAway[0].lineups.away.starters['1'],
                  lineup2: forLineupAway[0].lineups.away.starters['2'],
                  lineup3: forLineupAway[0].lineups.away.starters['3'],
                  lineup4: forLineupAway[0].lineups.away.starters['4']
                }
              }
            };
          }
          if (!forLineupHome.length === 0 && !forLineupAway.length === 0) {
            if (forLineupHome[0].scheduled > forLineupAway[0].scheduled) {
              match.history.lineup = {
                starter: {
                  away: {
                    lineup0: forLineupHome[0].lineups.home.starters['0'],
                    lineup1: forLineupHome[0].lineups.home.starters['1'],
                    lineup2: forLineupHome[0].lineups.home.starters['2'],
                    lineup3: forLineupHome[0].lineups.home.starters['3'],
                    lineup4: forLineupHome[0].lineups.home.starters['4']
                  }
                }
              };
            } else {
              match.history.lineup.starters = {
                starter: {
                  away: {
                    lineup0: forLineupAway[0].lineups.away.starters['0'],
                    lineup1: forLineupAway[0].lineups.away.starters['1'],
                    lineup2: forLineupAway[0].lineups.away.starters['2'],
                    lineup3: forLineupAway[0].lineups.away.starters['3'],
                    lineup4: forLineupAway[0].lineups.away.starters['4']
                  }
                }
              };
            }
          }
          if (forLineupHome.length === 0 && forLineupAway.length === 0) {
            match.history.lineup.starters = { away: 'no history data' };
          }
        }
      }
      match.sport = sport;

      return match;
    }

    if (args.league === 'MLB') {
      match.sport = sport;

      return match;
    }
    if (args.league === 'eSoccer') {
      const ele = match[0];

      const temp = {
        id: ele.bets_id,
        status: ele.flag.status,
        sport: modules.league2Sport(args.league),
        league: ele.league.name_ch,
        ori_league: args.league,
        scheduled: ele.scheduled * 1000,
        newest_spread: {
          handicap: ele.newest_spread ? ele.newest_spread.handicap : null,
          home_tw: ele.newest_spread ? ele.newest_spread.home_tw : null,
          away_tw: ele.newest_spread ? ele.newest_spread.away_tw : null
        },
        home: {
          team_name: ele.home.team_name,
          player_name: ele.home.player_name,
          name: ele.home.name,
          name_ch: ele.home.name_ch,
          alias: ele.home.alias,
          alias_ch: ele.home.alias_ch,
          image_id: ele.home.image_id
        },
        away: {
          team_name: ele.away.team_name,
          player_name: ele.away.player_name,
          name: ele.away.name,
          name_ch: ele.away.name_ch,
          alias: ele.away.alias,
          alias_ch: ele.away.alias_ch,
          image_id: ele.away.image_id
        }
      };

      return temp;
    }
  } catch (err) {
    console.error(`${err.stack} by DY`);
    throw AppErrors.RepackageError(`${err.stack} by DY`);
  }
}

module.exports = livescore;
