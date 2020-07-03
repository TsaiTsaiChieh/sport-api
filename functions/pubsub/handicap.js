// from https://docs.google.com/document/d/1eLni15nSnqND1-o5nBo1YOy3jT8QnuclzVNDxshewSc/edit#
const modules = require('../util/modules');
const db = require('../util/dbUtil');
const AppErrors = require('../util/AppErrors');
const oddsURL = 'https://api.betsapi.com/v2/event/odds';
const sports = [
  // 18,
  // 18,
  // 16,
  1,
  16,
  16,
  16
];
const leagueUniteIDArray = [
  // 2274
  // 8251
  // 225
  8,
  347, // 日職
  349, // 韓職
  11235 // 台職
];
const Match = db.Match;
const MatchSpread = db.Spread;
const MatchTotals = db.Totals;
async function handicap() {
  // go through each league
  for (let i = 0; i < sports.length; i++) {
    const querysForEvent = await query_event(leagueUniteIDArray[i]);

    if (querysForEvent.length > 0) {
      await upsertHandicap(querysForEvent, sports[i], leagueUniteIDArray[i]);
    }
  }
  console.log('handicap success');
}
async function axiosForURL(URL) {
  return new Promise(async function(resolve, reject) {
    try {
      const { data } = await modules.axios(URL);
      return resolve(data);
    } catch (err) {
      return reject(
        new AppErrors.AxiosError(`${err} at prematchFunctions by DY`)
      );
    }
  });
}

async function query_event(league) {
  return new Promise(async function(resolve, reject) {
    const unix = Math.floor(Date.now() / 1000);
    const tomorrow = modules.convertTimezoneFormat(unix, {
      op: 'add',
      value: 1,
      unit: 'days'
    });
    const now = modules.convertTimezoneFormat(unix);
    try {
      const queries = await db.sequelize.query(
        `(
				 SELECT game.bets_id AS bets_id, game.scheduled AS scheduled
					 FROM matches AS game
					WHERE game.status = ${modules.MATCH_STATUS.SCHEDULED}
						AND game.scheduled BETWEEN UNIX_TIMESTAMP('${now}') AND UNIX_TIMESTAMP('${tomorrow}')
						AND game.league_id = '${league}'
			 )`,
        {
          type: db.sequelize.QueryTypes.SELECT
        }
      );
      return resolve(queries);
    } catch (err) {
      return reject(new AppErrors.MysqlError(`${err.stack} at handicap by DY`));
    }
  });
}
async function upsertHandicap(querysForEvent, sport, league) {
  return new Promise(async function(resolve, reject) {
    try {
      for (let i = 0; i < querysForEvent.length; i++) {
        const ele = querysForEvent[i];

        const URL = `${oddsURL}?token=${modules.betsToken}&event_id=${ele.bets_id}&odds_market=2,3`;
        const data = await axiosForURL(URL);
        let spread_odds = [];
        let totals_odds = [];
        /* 因為 res 可能為 {
        "success": 1,
        "results": {}
      } */
        if (data.results.odds) {
          if (data.results.odds[`${sport}_2`]) {
            spread_odds = data.results.odds[`${sport}_2`];
          }
          if (data.results.odds[`${sport}_3`]) {
            totals_odds = data.results.odds[`${sport}_3`];
          }

          let newest_spread;
          if (spread_odds.length > 0) {
            for (let spcount = 0; spcount < spread_odds.length; spcount++) {
              if (
                spread_odds[spcount].home_od !== null &&
                spread_odds[spcount].handicap !== null &&
                spread_odds[spcount].away_od !== null &&
                spread_odds[spcount].home_od !== '-' &&
                spread_odds[spcount].away_od !== '-' &&
                spread_odds[spcount].add_time * 1000 <= ele.scheduled * 1000
              ) {
                newest_spread = spread_odds[spcount];
                newest_spread = spreadCalculator(newest_spread, sport);
                await write2MysqlOfMatchAboutNewestSpread(ele, newest_spread);
                await write2MysqlOfMatchSpread(newest_spread, ele, league);
                break;
              }
            }
          }
          let newest_totals;
          if (totals_odds.length > 0) {
            for (let tocount = 0; tocount < totals_odds.length; tocount++) {
              if (
                totals_odds[tocount].over_od !== null &&
                totals_odds[tocount].handicap !== null &&
                totals_odds[tocount].under_od !== null &&
                totals_odds[tocount].over_od !== '-' &&
                totals_odds[tocount].under_od !== '-' &&
                totals_odds[tocount].add_time * 1000 <= ele.scheduled * 1000
              ) {
                newest_totals = totals_odds[tocount];
                newest_totals = totalsCalculator(newest_totals, sport);
                await write2MysqlOfMatchAboutNewestTotals(ele, newest_totals);
                await write2MysqlOfMatchTotals(newest_totals, ele, league);
                break;
              }
            }
          }
        }
      }
      return resolve('ok');
    } catch (err) {
      return reject(new AppErrors.MysqlError(`${err.stack} at handicap by DY`));
    }
  });
}

async function write2MysqlOfMatchAboutNewestSpread(ele, newest_spread) {
  return new Promise(async function(resolve, reject) {
    try {
      await Match.upsert({
        bets_id: ele.bets_id,
        spread_id: newest_spread.id
      });
      return resolve('ok');
    } catch (err) {
      return reject(
        new AppErrors.MysqlError(`${err} at handicap ${ele.bets_id} by DY`)
      );
    }
  });
}
async function write2MysqlOfMatchAboutNewestTotals(ele, newest_totals) {
  return new Promise(async function(resolve, reject) {
    try {
      await Match.upsert({
        bets_id: ele.bets_id,
        totals_id: newest_totals.id
      });
      return resolve('ok');
    } catch (err) {
      return reject(
        new AppErrors.MysqlError(`${err} at handicap ${ele.bets_id} by DY`)
      );
    }
  });
}

async function write2MysqlOfMatchSpread(odd, ele, leagueUniteID) {
  return new Promise(async function(resolve, reject) {
    try {
      await MatchSpread.upsert({
        spread_id: odd.id,
        match_id: ele.bets_id,
        league_id: leagueUniteID,
        handicap: Number.parseFloat(odd.handicap),
        rate: Number.parseFloat(odd.rate),
        home_odd: Number.parseFloat(odd.away_od),
        away_odd: Number.parseFloat(odd.home_od),
        home_tw: odd.home_tw,
        away_tw: odd.away_tw,
        add_time: Number.parseInt(odd.add_time) * 1000
      });
      return resolve('ok');
    } catch (err) {
      return reject(
        new AppErrors.MysqlError(
          `${err} at handicap of MatchSpread ${ele.bets_id} by DY`
        )
      );
    }
  });
}
async function write2MysqlOfMatchTotals(odd, ele, leagueUniteID) {
  return new Promise(async function(resolve, reject) {
    try {
      await MatchTotals.upsert({
        totals_id: odd.id,
        match_id: ele.bets_id,
        league_id: leagueUniteID,
        handicap: Number.parseFloat(odd.handicap),
        rate: Number.parseFloat(odd.rate),
        over_odd: Number.parseFloat(odd.over_od),
        under_odd: Number.parseFloat(odd.under_od),
        over_tw: odd.over_tw,
        add_time: Number.parseInt(odd.add_time) * 1000
      });
      return resolve('ok');
    } catch (err) {
      return reject(
        new AppErrors.MysqlError(
          `${err} at handicap of MatchTotals ${ele.bets_id} by DY`
        )
      );
    }
  });
}

function spreadCalculator(handicapObj, sport) {
  if (handicapObj.handicap) {
    handicapObj.handicap = parseFloat(handicapObj.handicap);
    handicapObj.home_odd = parseFloat(handicapObj.away_od);
    handicapObj.away_odd = parseFloat(handicapObj.home_od);

    if (sport === 17 || sport === 18) {
      // 籃球或冰球
      if (handicapObj.handicap % 1 === 0) {
        // 整數盤口
        if (handicapObj.handicap >= 0) {
          // 主讓客
          handicapObj.home_tw = `${Math.abs(handicapObj.handicap)}平`;
          handicapObj.away_tw = null;
          handicapObj.rate = 0;
        } else {
          // 客讓主
          handicapObj.home_tw = null;
          handicapObj.away_tw = `${Math.abs(handicapObj.handicap)}平`;
          handicapObj.rate = 0;
        }
      } else {
        // 小數盤口
        if (handicapObj.handicap >= 0) {
          // 主讓客
          handicapObj.home_tw = `${Math.abs(handicapObj.handicap)}`;
          handicapObj.away_tw = null;
          handicapObj.rate = 0;
        } else {
          // 客讓主
          handicapObj.home_tw = null;
          handicapObj.away_tw = `${Math.abs(handicapObj.handicap)}`;
          handicapObj.rate = 0;
        }
      }
    }

    if (sport === 16) {
      // 棒球
      if (handicapObj.handicap % 1 === 0) {
        // 整數盤口
        if (handicapObj.home_odd !== handicapObj.away_odd) {
          // 不同賠率
          if (handicapObj.handicap >= 0) {
            // 主讓客
            if (handicapObj.home_odd > handicapObj.away_odd) {
              // 主賠率>客賠率 顯示 +
              handicapObj.home_tw = `${Math.abs(handicapObj.handicap)}+50`;
              handicapObj.away_tw = null;
              handicapObj.rate = 50;
            } else {
              // 客賠率>主賠率 顯示 -
              handicapObj.home_tw = `${Math.abs(handicapObj.handicap)}-50`;
              handicapObj.away_tw = null;
              handicapObj.rate = -50;
            }
          } else {
            // 客讓主
            if (handicapObj.home_odd > handicapObj.away_odd) {
              // 主賠率>客賠率 顯示 -
              handicapObj.home_tw = null;
              handicapObj.away_tw = `${Math.abs(handicapObj.handicap)}-50`;
              handicapObj.rate = -50;
            } else {
              // 客賠率>主賠率 顯示 +
              handicapObj.home_tw = null;
              handicapObj.away_tw = `${Math.abs(handicapObj.handicap)}+50`;
              handicapObj.rate = 50;
            }
          }
        } else {
          // 相同賠率
          if (handicapObj.handicap >= 0) {
            // 主讓客
            handicapObj.home_tw = `${Math.abs(handicapObj.handicap)}平`;
            handicapObj.away_tw = null;
            handicapObj.rate = 0;
          } else {
            // 客讓主
            handicapObj.home_tw = null;
            handicapObj.away_tw = `${Math.abs(handicapObj.handicap)}平`;
            handicapObj.rate = 0;
          }
        }
      } else {
        // 小數盤口
        if (handicapObj.handicap > 1 || handicapObj.handicap < -1) {
          if (handicapObj.home_odd !== handicapObj.away_odd) {
            // 不同賠率
            let tempHandicap;
            if (handicapObj.home_odd >= 1.85 && handicapObj.away_odd >= 1.85) {
              // 主/客賠率都大於等於 1.85 時不調整
              if (handicapObj.handicap >= 0) {
                // 主讓客
                if (handicapObj.home_odd > handicapObj.away_odd) {
                  // 主賠率>客賠率 顯示 +
                  handicapObj.home_tw = `${Math.floor(
                    Math.abs(handicapObj.handicap)
                  )}+50`;
                  handicapObj.away_tw = null;
                  handicapObj.rate = 50;
                } else {
                  // 主賠率<客賠率 顯示 -
                  handicapObj.home_tw = `${Math.floor(
                    Math.abs(handicapObj.handicap)
                  )}-50`;
                  handicapObj.away_tw = null;
                  handicapObj.rate = -50;
                }
              } else {
                // 客讓主
                if (handicapObj.home_odd > handicapObj.away_odd) {
                  // 主賠率>客賠率 顯示 -
                  handicapObj.home_tw = null;
                  handicapObj.away_tw = `${Math.floor(
                    Math.abs(handicapObj.handicap)
                  )}-50`;
                  handicapObj.rate = -50;
                } else {
                  // 主賠率<客賠率 顯示 +
                  handicapObj.home_tw = null;
                  handicapObj.away_tw = `${Math.floor(
                    Math.abs(handicapObj.handicap)
                  )}+50`;
                  handicapObj.rate = 50;
                }
              }
            } else {
              // 主/客賠率其中一個小於 1.85 時做調整 todo
              if (handicapObj.home_odd > handicapObj.away_odd) {
                // 主賠率>客賠率
                if (handicapObj.handicap > 0) {
                  // 主讓客 = 斜邊 = 往上數
                  tempHandicap = modifyHandicap(
                    Math.abs(handicapObj.handicap),
                    1,
                    Math.round((1.85 - handicapObj.away_odd) / 0.06)
                  );
                } else {
                  // 客讓主 = 同邊 = 往下數
                  tempHandicap = modifyHandicap(
                    Math.abs(handicapObj.handicap),
                    -1,
                    Math.round((1.85 - handicapObj.away_odd) / 0.06)
                  );
                }
              } else {
                // 客賠率>主賠率
                if (handicapObj.handicap >= 0) {
                  // 主讓客 = 同邊 = 往下數
                  tempHandicap = modifyHandicap(
                    Math.abs(handicapObj.handicap),
                    -1,
                    Math.round((1.85 - handicapObj.home_odd) / 0.06)
                  );
                } else {
                  // 客讓主 = 斜邊 = 往上數
                  tempHandicap = modifyHandicap(
                    Math.abs(handicapObj.handicap),
                    1,
                    Math.round((1.85 - handicapObj.home_odd) / 0.06)
                  );
                }
              }

              // here
              if (tempHandicap !== undefined && !tempHandicap) {
                if (tempHandicap === 'PK') {
                  handicapObj.handicap = 0;
                  handicapObj.rate = 0;
                  handicapObj.home_tw = 'PK';
                  handicapObj.away_tw = null;
                }
                if (handicapObj.handicap >= 0) {
                  // 原本的盤口>=0 主讓客
                  if (tempHandicap[0] === '-') {
                    // 盤口變號 變成客讓主
                    tempHandicap = tempHandicap.replace('-', '');
                    if (tempHandicap.indexOf('-') !== -1) {
                      handicapObj.handicap = parseFloat(
                        `-${tempHandicap.split('-')[0]}`
                      );
                      handicapObj.rate = parseFloat(
                        `-${tempHandicap.split('-')[1]}`
                      );
                    } else if (tempHandicap.indexOf('+') !== -1) {
                      handicapObj.handicap = parseFloat(
                        `-${tempHandicap.split('+')[0]}`
                      );
                      handicapObj.rate = parseFloat(tempHandicap.split('+')[1]);
                    } else if (tempHandicap.indexOf('平') !== -1) {
                      handicapObj.handicap = parseFloat(
                        `-${tempHandicap.split('平')[0]}`
                      );
                      handicapObj.rate = 0;
                    } else if (tempHandicap.indexOf('輸') !== -1) {
                      handicapObj.handicap = parseFloat(
                        `-${tempHandicap.split('輸')[0]}`
                      );
                      handicapObj.rate = -100;
                    }
                    handicapObj.home_tw = null;
                    handicapObj.away_tw = tempHandicap;
                  } else {
                    // 不用變號
                    if (tempHandicap.indexOf('-') !== -1) {
                      handicapObj.handicap = parseFloat(
                        tempHandicap.split('-')[0]
                      );
                      handicapObj.rate = parseFloat(
                        `-${tempHandicap.split('-')[1]}`
                      );
                    } else if (tempHandicap.indexOf('+') !== -1) {
                      handicapObj.handicap = parseFloat(
                        tempHandicap.split('+')[0]
                      );
                      handicapObj.rate = parseFloat(tempHandicap.split('+')[1]);
                    } else if (tempHandicap.indexOf('平') !== -1) {
                      handicapObj.handicap = parseFloat(
                        tempHandicap.split('平')[0]
                      );
                      handicapObj.rate = 0;
                    } else if (tempHandicap.indexOf('輸') !== -1) {
                      handicapObj.handicap = parseFloat(
                        tempHandicap.split('輸')[0]
                      );
                      handicapObj.rate = -100;
                    }
                    handicapObj.home_tw = tempHandicap;
                    handicapObj.away_tw = null;
                  }
                } else {
                  // 原本的盤口<0 客讓主
                  if (tempHandicap[0] === '-') {
                    // 變號 變成主讓客
                    tempHandicap = tempHandicap.replace('-', '');
                    if (tempHandicap.indexOf('-') !== -1) {
                      handicapObj.handicap = parseFloat(
                        `${tempHandicap.split('-')[0]}`
                      );
                      handicapObj.rate = parseFloat(
                        `-${tempHandicap.split('-')[1]}`
                      );
                    } else if (tempHandicap.indexOf('+') !== -1) {
                      handicapObj.handicap = parseFloat(
                        `${tempHandicap.split('+')[0]}`
                      );
                      handicapObj.rate = parseFloat(tempHandicap.split('+')[1]);
                    } else if (tempHandicap.indexOf('平') !== -1) {
                      handicapObj.handicap = parseFloat(
                        `${tempHandicap.split('平')[0]}`
                      );
                      handicapObj.rate = 0;
                    } else if (tempHandicap.indexOf('輸') !== -1) {
                      handicapObj.handicap = parseFloat(
                        `${tempHandicap.split('輸')[0]}`
                      );
                      handicapObj.rate = -100;
                    }
                    handicapObj.home_tw = tempHandicap;
                    handicapObj.away_tw = null;
                  } else {
                    // 不用變號
                    if (tempHandicap.indexOf('-') !== -1) {
                      handicapObj.handicap = parseFloat(
                        `-${tempHandicap.split('-')[0]}`
                      );
                      handicapObj.rate = parseFloat(
                        `-${tempHandicap.split('-')[1]}`
                      );
                    } else if (tempHandicap.indexOf('+') !== -1) {
                      handicapObj.handicap = parseFloat(
                        `-${tempHandicap.split('+')[0]}`
                      );
                      handicapObj.rate = parseFloat(tempHandicap.split('+')[1]);
                    } else if (tempHandicap.indexOf('平') !== -1) {
                      handicapObj.handicap = parseFloat(
                        `-${tempHandicap.split('平')[0]}`
                      );
                      handicapObj.rate = 0;
                    } else if (tempHandicap.indexOf('輸') !== -1) {
                      handicapObj.handicap = parseFloat(
                        `-${tempHandicap.split('輸')[0]}`
                      );
                      handicapObj.rate = -100;
                    }
                    handicapObj.home_tw = null;
                    handicapObj.away_tw = tempHandicap;
                  }
                }
              }
            }
          } else {
            // 相同賠率
            if (handicapObj.handicap >= 0) {
              // 主讓客
              handicapObj.home_tw = `${Math.abs(handicapObj.handicap)}-50`;
              handicapObj.away_tw = null;
              handicapObj.rate = -50;
            } else {
              // 客讓主
              handicapObj.home_tw = null;
              handicapObj.away_tw = `${Math.abs(handicapObj.handicap)}-50`;
              handicapObj.rate = -50;
            }
          }
        } else {
          handicapObj.handicap = null;
          handicapObj.home_tw = null;
          handicapObj.away_tw = null;
          handicapObj.rate = null;
        }
      }
    }

    if (sport === 1) {
      // 足球
      handicapObj.handicap = handicapObj.handicap.toString();
      if (handicapObj.handicap.indexOf(',') !== -1) {
        // 有兩個以上盤口
        const firstHandicap = Math.abs(
          parseFloat(handicapObj.handicap.split(',')[0])
        );
        const secondHandicap = Math.abs(
          parseFloat(handicapObj.handicap.split(',')[1])
        );
        if (firstHandicap % 1 !== 0) {
          // 第一盤口為小數
          if (firstHandicap >= 0 && secondHandicap >= 0) {
            // 顯示在主隊區，代表主讓客
            handicapObj.home_tw = firstHandicap + '/' + secondHandicap;
            handicapObj.away_tw = null;
            handicapObj.handicap =
              (parseFloat(Math.abs(firstHandicap)) +
                parseFloat(Math.abs(secondHandicap))) /
              2;
            handicapObj.rate = 50;
          } else {
            // 顯示在客隊區
            handicapObj.home_tw = null;
            handicapObj.away_tw = firstHandicap + '/' + secondHandicap;
            handicapObj.handicap =
              (parseFloat(Math.abs(firstHandicap)) +
                parseFloat(Math.abs(secondHandicap))) /
              2;
            handicapObj.rate = 50;
          }
        } else {
          // 第一盤口為整數
          if (firstHandicap >= 0) {
            // 顯示在主隊區
            handicapObj.home_tw = firstHandicap + '/' + secondHandicap;

            handicapObj.away_tw = null;
            handicapObj.handicap =
              (parseFloat(Math.abs(firstHandicap)) +
                parseFloat(Math.abs(secondHandicap))) /
              2;
            handicapObj.rate = -50;
          } else {
            // 顯示在客隊區
            handicapObj.home_tw = null;
            handicapObj.away_tw = firstHandicap + '/' + secondHandicap;
            handicapObj.handicap =
              (parseFloat(Math.abs(firstHandicap)) +
                parseFloat(Math.abs(secondHandicap))) /
              2;
            handicapObj.rate = -50;
          }
        }
      } else {
        // 只有一個盤口值
        handicapObj.handicap = parseFloat(handicapObj.handicap);
        if (handicapObj.handicap === 0) {
          // 讓 0 分
          handicapObj.home_tw = 'pk';
          handicapObj.away_tw = null;
          handicapObj.rate = 0;
        } else if (handicapObj.handicap % 1 === 0) {
          // 整數
          if (handicapObj.handicap > 0) {
            // 主讓客
            handicapObj.home_tw = handicapObj.handicap;
            handicapObj.away_tw = null;
            handicapObj.rate = 0;
          } else {
            // 客讓主
            handicapObj.home_tw = null;
            handicapObj.away_tw = handicapObj.handicap;
            handicapObj.rate = 0;
          }
        } else if (handicapObj.handicap % 1 !== 0) {
          // 小數
          if (handicapObj.handicap > 0) {
            // 主讓客
            const str = handicapObj.handicap.toString();
            const str1 = str.split('.')[0];
            const str2 = str.split('.')[1];
            if (str2 === '25') {
              handicapObj.home_tw = `${str1}/${str1}.5`;
              handicapObj.away_tw = null;
              handicapObj.rate = -50;
            } else if (str2 === '75') {
              handicapObj.home_tw = `${str1}.5/${parseFloat(str1) + 1}`;
              handicapObj.away_tw = null;
              handicapObj.rate = 50;
            } else {
              handicapObj.home_tw = Math.abs(handicapObj.handicap);
              handicapObj.away_tw = null;
              handicapObj.rate = -100;
            }
          } else {
            // 客讓主
            const str = Math.abs(handicapObj.handicap).toString();
            const str1 = str.split('.')[0];
            const str2 = str.split('.')[1];
            if (str2 === '25') {
              handicapObj.home_tw = null;
              handicapObj.away_tw = `${str1}/${str1}.5`;
              handicapObj.rate = -50;
            } else if (str2 === '75') {
              handicapObj.home_tw = null;
              handicapObj.away_tw = `${str1}.5/${parseFloat(str1) + 1}`;
              handicapObj.rate = 50;
            } else {
              handicapObj.home_tw = null;
              handicapObj.away_tw = Math.abs(handicapObj.handicap);
              handicapObj.rate = -100;
            }
          }
        }
      }
    }
  }
  return handicapObj;
}

function totalsCalculator(handicapObj, sport) {
  if (handicapObj.handicap) {
    if (sport === 17 || sport === 18) {
      // 籃球或冰球
      if (handicapObj.handicap % 1 === 0) {
        // 整數
        handicapObj.over_tw = `${handicapObj.handicap}`;
        handicapObj.rate = 0;
      } else {
        // 小數
        handicapObj.over_tw = `${handicapObj.handicap}`;
        handicapObj.rate = -100;
      }
    }
    if (sport === 16) {
      // 棒球
      if (handicapObj.handicap % 1 === 0) {
        // 整數
        if (handicapObj.over_odd !== handicapObj.under_odd) {
          // 賠率不同
          if (handicapObj.over_odd > handicapObj.under_odd) {
            // 大分賠率>小分賠率
            handicapObj.over_tw = `${handicapObj.handicap}+50`;
            handicapObj.rate = 50;
          } else {
            // 大分賠率>小分賠率
            handicapObj.over_tw = `${handicapObj.handicap}-50`;
            handicapObj.rate = -50;
          }
        } else {
          // 賠率相同
          handicapObj.over_tw = `${handicapObj.handicap}`;
          handicapObj.rate = 0;
        }
      } else {
        // 小數
        if (handicapObj.over_odd !== handicapObj.under_odd) {
          // 賠率不同
          if (handicapObj.over_odd > handicapObj.under_odd) {
            // 大分賠率>小分賠率
            handicapObj.over_tw = `${Math.floor(handicapObj.handicap)}+50`;
            handicapObj.rate = 50;
          } else {
            // 大分賠率>小分賠率
            handicapObj.over_tw = `${Math.floor(handicapObj.handicap)}-50`;
            handicapObj.rate = -50;
          }
        } else {
          // 賠率相同
          handicapObj.over_tw = `${Math.floor(handicapObj.handicap)}輸`;
          handicapObj.rate = -100;
        }
      }
    }

    if (sport === 1) {
      // 足球
      if (handicapObj.handicap) {
        handicapObj.handicap = handicapObj.handicap.toString();
        if (handicapObj.handicap.indexOf(',') !== -1) {
          const firstHandicap = Math.abs(
            parseFloat(handicapObj.handicap.split(',')[0])
          );
          const secondHandicap = Math.abs(
            parseFloat(handicapObj.handicap.split(',')[1])
          );
          if (firstHandicap % 1 !== 0) {
            // 第一盤口為小數
            handicapObj.over_tw = firstHandicap + '/' + secondHandicap;
            handicapObj.handicap =
              (parseFloat(Math.abs(firstHandicap)) +
                parseFloat(Math.abs(secondHandicap))) /
              2;
            handicapObj.rate = 50;
          } else {
            // 第一盤口為整數
            // 顯示在主隊區
            handicapObj.over_tw = firstHandicap + '/' + secondHandicap;
            handicapObj.handicap =
              (parseFloat(Math.abs(firstHandicap)) +
                parseFloat(Math.abs(secondHandicap))) /
              2;
            handicapObj.rate = -50;
          }
        } else {
          // 盤口只有一個數
          const str = handicapObj.handicap.toString();
          const str1 = str.split('.')[0];
          const str2 = str.split('.')[1];
          if (str2 === '25') {
            handicapObj.over_tw = `${str1}/${str1}.5`;
            handicapObj.rate = -50;
          } else if (str2 === '75') {
            handicapObj.over_tw = `${str1}.5/${parseFloat(str1) + 1}`;
            handicapObj.rate = 50;
          } else {
            handicapObj.over_tw = Math.abs(handicapObj.handicap);
            handicapObj.rate = 0;
          }
        }
      }
    }
  }
  return handicapObj;
}
function normalTable(handicap, upOrDown) {
  if (upOrDown === 1) {
    return [
      `${Math.floor(handicap)}輸`,
      `${Math.floor(handicap)}-50`,
      `${Math.floor(handicap)}平`,
      `${Math.floor(handicap)}+50`
    ];
  } else {
    return [
      `${Math.floor(handicap)}+50`,
      `${Math.floor(handicap)}平`,
      `${Math.floor(handicap)}-50`,
      `${Math.floor(handicap)}輸`
    ];
  }
}
function modifyHandicap(handicap, upOrDown, unit) {
  const specificTable = ['1+50', 'PK', '-1+50', '-1輸'];
  let handicapNow;
  const unitArray = Math.ceil(unit / 4) + 1; // 總共需要幾個unit組合
  const calculateArray = [];
  if (upOrDown === 1) {
    // 往上數
    for (let i = 0; i < unitArray; i++) {
      handicapNow = Math.floor(handicap) - i;
      // add array
      if (handicapNow === 0) {
        // 加特殊情況
        specificTable.forEach((item) => calculateArray.push(item));
      } else {
        // 加一般陣列
        normalTable(handicapNow, upOrDown).forEach((item) =>
          calculateArray.push(item)
        );
      }
    }
  } else {
    // 往下數
    for (let i = 0; i < unitArray; i++) {
      // add array
      handicapNow = Math.floor(handicap) + i + 1;
      // 加一般陣列
      normalTable(handicapNow, upOrDown).forEach((item) =>
        calculateArray.push(item)
      );
    }
    unit = unit - 1;
  }

  let tempHandicap = calculateArray[unit];
  if (tempHandicap === undefined) {
    tempHandicap = handicap;
  }
  return tempHandicap;
}
module.exports = handicap;
