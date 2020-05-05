const modules = require('../../util/modules');
async function livescore(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const result = await reResult(args.sport, args.league, args.eventID);

      resolve(result);
    } catch (err) {
      console.error(
        'Error in livescore/livescoreDetailPrematchModel by DY',
        err
      );
      reject({ code: 500, error: err });
    }
  });
}
async function reResult(sport, league, eventID) {
  const result = await repackage(sport, league, eventID);

  return await Promise.all(result);
}
async function repackage(sport, league, eventID) {
  const leagueName = `pagetest_${league}`;
  const eventData = [];
  const query = await modules.firestore
    .collection(leagueName)
    .where('bets_id', '==', eventID)
    .get();

  query.forEach((doc) => {
    eventData.push(doc.data());
  });

  const time = eventData[0].scheduled * 1000;
  const dateNow = Date.now();

  // for specific league
  // nba
  if (league === 'NBA') {
    const queryHomeForHome = await modules.firestore
      .collection(leagueName)
      .where('home.alias', '==', eventData[0].home.alias)
      .where('scheduled', '<', time)
      .orderBy('scheduled', 'desc')
      .limit(1)
      .get();
    let forLineupHome = [];
    queryHomeForHome.forEach((doc) => {
      forLineupHome.push(doc.data());
    });
    const queryAwayForHome = await modules.firestore
      .collection(leagueName)
      .where('away.alias', '==', eventData[0].home.alias)
      .where('scheduled', '<', time)
      .orderBy('scheduled', 'desc')
      .limit(1)
      .get();
    let forLineupAway = [];
    queryAwayForHome.forEach((doc) => {
      forLineupAway.push(doc.data());
    });

    if (!forLineupHome.length === 0 && forLineupAway.length === 0) {
      eventData[0].history.lineup = {
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
      eventData[0].history.lineup = {
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
          eventData[0].history.lineup = {
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
          eventData[0].history.lineup = {
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
          eventData[0].history.lineup.starters = { home: 'no history data' };
        }
        forLineupHome = [];
        forLineupAway = [];
        const queryHomeForAway = await modules.firestore
          .collection(leagueName)
          .where('home.alias', '==', eventData[0].away.alias)
          .where('scheduled', '<', time)
          .orderBy('scheduled', 'desc')
          .limit(1)
          .get();
        queryHomeForAway.forEach((doc) => {
          forLineupHome.push(doc.data());
        });
        const queryAwayForAway = await modules.firestore
          .collection(leagueName)
          .where('away.alias', '==', eventData[0].away.alias)
          .where('scheduled', '<', time)
          .orderBy('scheduled', 'desc')
          .limit(1)
          .get();
        queryAwayForAway.forEach((doc) => {
          forLineupAway.push(doc.data());
        });

        if (!forLineupHome.length === 0 && forLineupAway.length === 0) {
          eventData[0].history.lineup = {
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
          eventData[0].history.lineup = {
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
            eventData[0].history.lineup = {
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
            eventData[0].history.lineup.starters = {
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
          eventData[0].history.lineup.starters = { away: 'no history data' };
        }
      }
    }
    eventData[0].sport = sport;
    eventData[0].league = league;
    return eventData;
  }

  if (league === 'MLB') {
    eventData[0].sport = sport;
    eventData[0].league = league;
    return eventData;
  }
  if (league === 'eSoccer') {
    league = eventData[0].league.name_ch;
    eventData[0].sport = sport;
    eventData[0].league = league;
    return eventData;
  }
}

module.exports = livescore;
