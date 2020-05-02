const modules = require('../util/modules');
const db = require('../util/dbUtil');
const AppErrors = require('../util/AppErrors');
const oddURL = 'https://api.betsapi.com/v2/event/odds/summary';
const oddsURL = 'https://api.betsapi.com/v2/event/odds';
const leagues = ['pagetest_eSoccer'];
const Match = db.Match;
const MatchSpread = db.Spread;
const MatchTotals = db.Totals;
const leagueUniteID = '22000';
async function handicap_esport() {
  for (let i = 0; i < leagues.length; i++) {
    const querysSpread = await query_handicap('flag.spread', 0, leagues[i]);
    const querysTotals = await query_handicap('flag.totals', 0, leagues[i]);
    const querysSpreadOpening = await query_opening(
      'flag.spread',
      1,
      leagues[i]
    );
    const querysTotalsOpening = await query_opening(
      'flag.totals',
      1,
      leagues[i]
    );

    if (querysSpread.length > 0) {
      for (let z = 0; z < querysSpread.length; z++) {
        getHandicap(leagues[i], querysSpread[z]);
      }
    }
    if (querysTotals.length > 0) {
      for (let x = 0; x < querysTotals.length; x++) {
        getTotals(leagues[i], querysTotals[x]);
      }
    }
    if (querysSpreadOpening.length > 0) {
      for (let c = 0; c < querysSpreadOpening.length; c++) {
        updateHandicap(leagues[i], querysSpreadOpening[c]);
      }
    }
    if (querysTotalsOpening.length > 0) {
      for (let v = 0; v < querysTotalsOpening.length; v++) {
        updateHandicap(leagues[i], querysTotalsOpening[v]);
      }
    }
  }
  console.log('handicap_esports success');
}
async function updateHandicap(league, ele) {
  return new Promise(async function(resolve, reject) {
    try {
      const eventSnapshot = modules.getDoc(league, ele.bets_id);
      const URL = `${oddsURL}?token=${modules.betsToken}&event_id=${ele.bets_id}&odds_market=2,3`;
      const { data } = await modules.axios(URL);

      let spread_odds = [];
      let totals_odds = [];
      /* 因為 res 可能為 {
    "success": 1,
    "results": {}
    } */
      if (!data.results.odds) {
        spread_odds = data.results.odds['1_2'];
        totals_odds = data.results.odds['1_3'];
      }
      let newest_spread;

      if (spread_odds.length > 0) {
        newest_spread = spread_odds[spread_odds.length - 1];
        try {
          newest_spread = await spreadCalculator(newest_spread);
        } catch (err) {
          return reject(
            new AppErrors.HandicapEsoccerError(
              `${err} at handicap_esports of spreadCalculator of spreadCalculator by DY`
            )
          );
        }
        try {
          await eventSnapshot.set(
            {
              newest_spread: {
                handicap: Number.parseFloat(newest_spread.handicap),
                home_odd: Number.parseFloat(newest_spread.home_od),
                away_odd: Number.parseFloat(newest_spread.away_od),
                away_tw: newest_spread.away_tw,
                home_tw: newest_spread.home_tw,
                add_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(
                  new Date(Number.parseInt(newest_spread.add_time) * 1000)
                ),
                insert_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(
                  new Date()
                )
              }
            },
            { merge: true }
          );
        } catch (err) {
          return reject(
            new AppErrors.FirebaseCollectError(
              `${err} at handicap_esports of newest_spread by DY`
            )
          );
        }
        try {
          await Match.upsert({
            bets_id: ele.bets_id,
            spread_id: newest_spread.id
          });
        } catch (err) {
          return reject(
            new AppErrors.MysqlError(`${err} at handicap_esports by DY`)
          );
        }
      }
      let newest_totals;
      if (totals_odds.length > 0) {
        newest_totals = totals_odds[totals_odds.length - 1];
        try {
          newest_totals = await totalsCalculator(newest_totals);
        } catch (err) {
          return reject(
            new AppErrors.HandicapEsoccerError(
              `${err} at handicap_esports of totalsCalculator by DY`
            )
          );
        }
        try {
          await eventSnapshot.set(
            {
              newest_totals: {
                handicap: Number.parseFloat(newest_totals.handicap),
                under_odd: Number.parseFloat(newest_totals.under_od),
                over_odd: Number.parseFloat(newest_totals.over_od),
                over_tw: newest_totals.over_tw,
                add_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(
                  new Date(Number.parseInt(newest_totals.add_time) * 1000)
                ),
                insert_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(
                  new Date()
                )
              }
            },
            { merge: true }
          );
        } catch (err) {
          return reject(
            new AppErrors.FirebaseCollectError(
              `${err} at handicap_esports of newest_totals by DY`
            )
          );
        }
        try {
          await Match.upsert({
            bets_id: ele.bets_id,
            totals_id: newest_totals.id
          });
        } catch (err) {
          return reject(
            new AppErrors.MysqlError(
              `${err} at handicap_esports of Match by DY`
            )
          );
        }
      }

      for (let i = 0; i < spread_odds.length; i++) {
        let odd = spread_odds[i];
        try {
          odd = await spreadCalculator(odd);
        } catch (err) {
          return reject(
            new AppErrors.HandicapEsoccerError(
              `${err} at handicap_esports of spreadCalculator by DY`
            )
          );
        }
        if (odd.home_od && odd.handicap && odd.away_od) {
          const spread = {};
          spread[odd.id] = {
            handicap: Number.parseFloat(odd.handicap),
            home_odd: Number.parseFloat(odd.home_od),
            away_odd: Number.parseFloat(odd.away_od),
            add_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(
              new Date(Number.parseInt(odd.add_time) * 1000)
            ),
            insert_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(
              new Date()
            ),
            away_tw: odd.away_tw,
            home_tw: odd.home_tw
          };
          try {
            await eventSnapshot.set({ spreads: spread }, { merge: true });
          } catch (err) {
            return reject(
              new AppErrors.FirebaseCollectError(
                `${err} at handicap_esports of spreads by DY`
              )
            );
          }
          try {
            await MatchSpread.upsert({
              spread_id: odd.id,
              match_id: ele.bets_id,
              league_id: leagueUniteID,
              handicap: Number.parseFloat(odd.handicap),
              home_odd: Number.parseFloat(odd.home_od),
              away_odd: Number.parseFloat(odd.away_od),
              home_tw: odd.home_tw,
              away_tw: odd.away_tw,
              add_time: Number.parseInt(odd.add_time) * 1000
            });
          } catch (err) {
            return reject(
              new AppErrors.MysqlError(
                `${err} at handicap_esports of MatchSpread by DY`
              )
            );
          }
        }
      }
      for (let i = 0; i < totals_odds.length; i++) {
        let odd = totals_odds[i];
        try {
          odd = await totalsCalculator(odd);
        } catch (err) {
          return reject(
            new AppErrors.HandicapEsoccerError(
              `${err} at handicap_esports of totalsCalculator by DY`
            )
          );
        }
        if (odd.over_od && odd.handicap && odd.under_od) {
          const totals = {};
          totals[odd.id] = {
            handicap: Number.parseFloat(odd.handicap),
            under_odd: Number.parseFloat(odd.under_od),
            over_odd: Number.parseFloat(odd.over_od),
            add_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(
              new Date(Number.parseInt(odd.add_time) * 1000)
            ),
            insert_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(
              new Date()
            ),
            over_tw: odd.over_tw
          };
          try {
            await eventSnapshot.set({ totals: totals }, { merge: true });
          } catch (err) {
            return reject(
              new AppErrors.FirebaseCollectError(
                `${err} at handicap_esports of totals by DY`
              )
            );
          }
          try {
            await MatchTotals.upsert({
              totals_id: odd.id,
              match_id: ele.bets_id,
              league_id: leagueUniteID,
              handicap: Number.parseFloat(odd.handicap),
              over_odd: Number.parseFloat(odd.over_od),
              under_odd: Number.parseFloat(odd.under_od),
              over_tw: odd.over_tw,
              add_time: Number.parseInt(odd.add_time) * 1000
            });
          } catch (err) {
            return reject(
              new AppErrors.MysqlError(
                `${err} at handicap_esports of MatchTotals by DY`
              )
            );
          }
          // console.log(
          //   `${league}(${ele.bets_id}) - ${ele.away.alias_ch}(${
          //     ele.away.alias
          //   }):${ele.home.alias_ch}(${ele.home.alias}) at ${modules
          //     .moment(ele.scheduled * 1000)
          //     .format('llll')} updated handicap successful, URL: ${URL}`
          // );
        }
      }
    } catch (err) {
      return reject(
        new AppErrors.AxiosError(`${err} at handicap_esports by DY`)
      );
    }
  });
}
async function query_opening(flag, value, league) {
  return new Promise(async function(resolve, reject) {
    const eventsRef = modules.firestore.collection(league);
    const eles = [];
    try {
      const querys = await eventsRef
        .where(flag, '==', value)
        .where('scheduled', '>', modules.moment() / 1000)
        .get();
      querys.forEach(function(docs) {
        eles.push(docs.data());
      });
      return await Promise.all(eles);
    } catch (err) {
      return reject(
        new AppErrors.FirebaseCollectError(
          `${err} at handicap_esports of query_opening by DY`
        )
      );
    }
  });
}
async function query_handicap(flag, value, leagues) {
  return new Promise(async function(resolve, reject) {
    const date = modules.moment();
    const eles = [];
    const eventsRef = modules.firestore.collection(leagues);
    const beginningDate = modules.moment(date);
    const endDate = modules.moment(date).add(24, 'hours');
    // 只針對明天（和今天時間相減相差 24 小時內）的賽事
    try {
      const querys = await eventsRef
        .where(flag, '==', value)
        .where('scheduled', '>=', beginningDate / 1000)
        .where('scheduled', '<=', endDate / 1000)
        .get();
      querys.forEach(async function(docs) {
        eles.push(docs.data());
      });
      return await Promise.all(eles);
    } catch (err) {
      return reject(
        new AppErrors.FirebaseCollectError(
          `${err} at handicap_esports of query_handicap by DY`
        )
      );
    }
  });
}

async function getHandicap(league, ele) {
  return new Promise(async function(resolve, reject) {
    try {
      const eventSnapshot = modules.getDoc(league, ele.bets_id);
      const URL = `${oddURL}?token=${modules.betsToken}&event_id=${ele.bets_id}`;
      const { data } = await modules.axios(URL);
      // console.log(
      //   `${league}(${ele.bets_id}) - ${ele.away.alias_ch}(${ele.away.alias}):${
      //     ele.home.alias_ch
      //   }(${ele.home.alias}) at ${modules
      //     .moment(ele.scheduled * 1000)
      //     .format('llll')}
      //   `
      // );
      // if no data, the data.results will be { }
      if (data.results.Bet365 !== undefined) {
        if (data.results.Bet365) {
          const odds = data.results.Bet365.odds.start;
          if (odds['1_2']) {
            let spreadData = odds['1_2'];
            try {
              spreadData = await spreadCalculator(spreadData);
            } catch (err) {
              return reject(
                new AppErrors.HandicapEsoccerError(
                  `${err} at handicap_esports of spreadCalculator by DY`
                )
              );
            }
            const spread = {};
            spread[spreadData.id] = {
              handicap: Number.parseFloat(spreadData.handicap),
              home_odd: Number.parseFloat(spreadData.home_od),
              away_odd: Number.parseFloat(spreadData.away_od),
              add_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(
                new Date(Number.parseInt(spreadData.add_time) * 1000)
              ),
              insert_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(
                new Date()
              ),
              home_tw: spreadData.home_tw,
              away_tw: spreadData.away_tw
            };
            try {
              await eventSnapshot.set(
                {
                  flag: { spread: 1 },
                  spread: spread,
                  newest_spread: spread[spreadData.id]
                },
                { merge: true }
              );
            } catch (err) {
              return reject(
                new AppErrors.FirebaseCollectError(
                  `${err} at handicap_esports of spreads by DY`
                )
              );
            }
            try {
              await Match.upsert({
                bets_id: ele.bets_id,
                spread_id: spreadData.id
              });
            } catch (err) {
              return reject(
                new AppErrors.MysqlError(
                  `${err} at handicap_esports of Match by DY`
                )
              );
            }
            try {
              await MatchSpread.upsert({
                spread_id: spreadData.id,
                match_id: ele.bets_id,
                league_id: leagueUniteID,
                handicap: Number.parseFloat(spreadData.handicap),
                home_odd: Number.parseFloat(spreadData.home_od),
                away_odd: Number.parseFloat(spreadData.away_od),
                home_tw: spreadData.home_tw,
                away_tw: spreadData.away_tw,
                add_time: Number.parseInt(spreadData.add_time) * 1000
              });
            } catch (err) {
              return reject(
                new AppErrors.MysqlError(
                  `${err} at handicap_esports of MatchSpread by DY`
                )
              );
            }
            // console.log(
            //   `${league}-event_id: ${ele.bets_id} get spread successful, URL: ${URL}`
            // );
          }
        }
      }
    } catch (err) {
      return reject(
        new AppErrors.AxiosError(
          `${err} at handicap_esports of getHandicap by DY`
        )
      );
    }
  });
}
async function getTotals(league, ele) {
  return new Promise(async function(resolve, reject) {
    try {
      const eventSnapshot = modules.getDoc(league, ele.bets_id);
      const URL = `${oddURL}?token=${modules.betsToken}&event_id=${ele.bets_id}`;
      const { data } = await modules.axios(URL);
      // console.log(
      //   `${league}(${ele.bets_id}) - ${ele.away.alias_ch}(${ele.away.alias}):${
      //     ele.home.alias_ch
      //   }(${ele.home.alias}) at ${modules
      //     .moment(ele.scheduled * 1000)
      //     .format('llll')}
      //   `
      // );
      if (data.results.Bet365 !== undefined) {
        if (data.results.Bet365) {
          const odds = data.results.Bet365.odds.start;
          if (odds['1_3']) {
            let totalsData = odds['1_3'];
            const totals = {};
            try {
              totalsData = await totalsCalculator(totalsData);
            } catch (err) {
              return reject(
                new AppErrors.HandicapEsoccerError(
                  `${err} at handicap_esports of totalsCalculator by DY`
                )
              );
            }
            totals[totalsData.id] = {
              handicap: Number.parseFloat(totalsData.handicap),
              over_odd: Number.parseFloat(totalsData.over_od),
              under_odd: Number.parseFloat(totalsData.under_od),
              add_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(
                new Date(Number.parseInt(totalsData.add_time) * 1000)
              ),
              insert_time: modules.firebaseAdmin.firestore.Timestamp.fromDate(
                new Date()
              ),
              over_tw: totalsData.over_tw
            };
            try {
              await eventSnapshot.set(
                {
                  flag: { totals: 1 },
                  totals: totals,
                  newest_totals: totals[totalsData.id]
                },
                { merge: true }
              );
            } catch (err) {
              return reject(
                new AppErrors.FirebaseCollectError(
                  `${err} at handicap_esports of getTotals by DY`
                )
              );
            }
            try {
              await Match.upsert({
                bets_id: ele.bets_id,
                totals_id: totalsData.id
              });
            } catch (err) {
              return reject(
                new AppErrors.MysqlError(
                  `${err} at handicap_esports of getTotals of Match by DY`
                )
              );
            }
            try {
              await MatchTotals.upsert({
                totals_id: totalsData.id,
                match_id: ele.bets_id,
                league_id: leagueUniteID,
                handicap: Number.parseFloat(totalsData.handicap),
                over_odd: Number.parseFloat(totalsData.over_od),
                under_odd: Number.parseFloat(totalsData.under_od),
                over_tw: totalsData.over_tw,
                add_time: Number.parseInt(totalsData.add_time) * 1000
              });
            } catch (err) {
              return reject(
                new AppErrors.MysqlError(
                  `${err} at handicap_esports of MatchTotals by DY`
                )
              );
            }
            // console.log(
            //   `${league}-event_id: ${ele.bets_id} get totals successful, URL: ${URL}`
            // );
          }
        }
      }
    } catch (err) {
      return reject(
        new AppErrors.AxiosError(
          `${err} at handicap_esports of getTotals by DY`
        )
      );
    }
  });
}
function spreadCalculator(handicapObj) {
  handicapObj.handicap = handicapObj.handicap.toString();

  if (handicapObj.handicap.indexOf(',') !== -1) {
    // 同時有兩個盤口值
    const firstHandicap = parseFloat(handicapObj.handicap.split(',')[0]);
    const secondHandicap = parseFloat(handicapObj.handicap.split(',')[1]);

    if (firstHandicap % 1 !== 0) {
      // 第一盤口為小數，則顯示為+
      if (firstHandicap >= 0) {
        // 顯示在主隊區
        handicapObj.home_tw = secondHandicap + '+50';
        handicapObj.away_tw = null;
      } else {
        // 顯示在客隊區
        handicapObj.home_tw = null;
        handicapObj.away_tw = Math.abs(secondHandicap) + '+50';
      }
    } else {
      // 第一盤口為整數，則顯示為-
      if (firstHandicap >= 0) {
        // 顯示在主隊區
        handicapObj.home_tw = firstHandicap + '-50';
        handicapObj.away_tw = null;
      } else {
        // 顯示在客隊區
        handicapObj.home_tw = null;
        handicapObj.away_tw = Math.abs(firstHandicap) + '-50';
      }
    }
  } else {
    // 只有一個盤口值
    handicapObj.handicap = parseFloat(handicapObj.handicap);

    if (handicapObj.handicap === 0) {
      // 讓 0 分
      handicapObj.home_tw = 'pk(0+0)';
      handicapObj.away_tw = null;
    } else if (handicapObj.handicap % 1 === 0) {
      // 整數
      if (handicapObj.handicap >= 0) {
        // 放在主隊區
        handicapObj.home_tw = handicapObj.handicap + '平';
        handicapObj.away_tw = null;
      } else {
        // 放在客隊區
        handicapObj.home_tw = null;
        handicapObj.away_tw = Math.abs(handicapObj.handicap) + '平';
      }
    } else if (handicapObj.handicap % 1 !== 0) {
      // 小數
      if (handicapObj.handicap >= 0) {
        // 放在主隊區
        handicapObj.home_tw = Math.floor(Math.abs(handicapObj.handicap)) + '輸';
        handicapObj.away_tw = null;
      } else {
        // 放在客隊區
        handicapObj.home_tw = null;
        handicapObj.away_tw = Math.ceil(Math.abs(handicapObj.handicap)) + '輸';
      }
    }
  }
  return handicapObj;
}
function totalsCalculator(handicapObj) {
  if (
    handicapObj.over_odd === handicapObj.under_odd ||
    handicapObj.handicap % 1 !== 0
  ) {
    handicapObj.over_tw = `${handicapObj.handicap}`;
  } else if (
    handicapObj.handicap % 1 === 0 &&
    handicapObj.over_odd !== handicapObj.under_odd
  ) {
    if (handicapObj.over_odd > handicapObj.under_odd) {
      handicapObj.over_tw = `${handicapObj.handicap} +50`;
    } else if (handicapObj.over_odd < handicapObj.under_odd) {
      handicapObj.over_tw = `${handicapObj.handicap} -50`;
    }
  }
  return handicapObj;
}
module.exports = handicap_esport;
