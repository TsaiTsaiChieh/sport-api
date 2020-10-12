const { NP, to, getLastPeriod, convertTimezone } = require('../../util/modules');
const { leagueCodebook } = require('../../util/leagueUtil');
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');

async function buyModel(args, uid) {
  const buyList = [];
  const begin = convertTimezone(args.begin);
  const end = convertTimezone(args.end,
    {
      op: 'add',
      value: 1,
      unit: 'days'
    }) - 1;
  const [err, buy] = await to(getGodSellPredictionDatesWinBetsInfo(uid, begin, end));
  console.log(begin)
  console.log(end)

  if (err) {
    console.error('[Error][buyModel][getGodSellPredictionDatesWinBetsInfo] ', err);
    throw errs.dbErrsMsg('404', '50111', { addMsg: err.parent.code });
  }
  if (!buy) return buyList;

  for (const ele of buy) {
    const bets = ele.info.win_bets ? NP.round(ele.info.win_bets, 2) : '-';
    buyList.push({
      date: ele.buy_date,
      god: {
        god_uid: ele.info.uid,
        god_name: ele.info.display_name,
        avatar: ele.info.avatar
      },
      league: leagueCodebook(ele.info.name).name_ch,
      cost: ele.info.price,
      sub_price: ele.info.sub_price,
      bets: bets,
      // bets: bets,
      status: ele.buy_status // 3:已結案 2:已退款  1:處理中 全額退款  0:處理中 賽事全無效
    });
  }

  return buyList;
}

// 查日期區間大神預測牌組勝注資訊
// await getGodSellPredictionDatesWinBetsInfo('2WMRgHyUwvTLyHpLoANk7gWADZn1', '20200608', '20200608');
async function getGodSellPredictionDatesWinBetsInfo(uid, sDate, eDate) {
  // 取得 user__buys 購買資料
  const buyLists = await db.sequelize.query(`
    select uid, league_id, god_uid, buy_date, buy_status, matches_date
      from user__buys
     where uid = :uid
       and buy_date BETWEEN :begin AND :end
     ORDER by buy_date desc
  `, {
    replacements: {
      uid: uid,
      begin: sDate,
      end: eDate
    },
    type: db.sequelize.QueryTypes.SELECT
  });
  // 取得 該大神預測牌組勝注
  const result = [];
  for (const data of buyLists) {
    const info = await getGodSellPredictionWinBetsInfo(data.god_uid, data.league_id, data.matches_date);

    if (!info.length) continue; // 空陣列移除，不回傳 略過

    result.push({
      buy_date: data.buy_date,
      buy_status: data.buy_status,
      info: info[0] // 這裡預設情況下是只會有一筆，萬一有兩筆時，只存入第一筆
    });
  }
  return result;
}

// 查該大神預測牌組勝注
// matches_fail_status  -1 全額退款，0 一般退款  判斷依據是 預測數 是否等同 預測無效數
async function getGodSellPredictionWinBetsInfo(god_uid, league_id, matches_date_unix) {
  // const end_unix = coreDateInfo(matches_date_unix).dateEndUnix;
  const period = getLastPeriod(matches_date_unix * 1000).period;
  const infos = await db.sequelize.query(`
    select users.uid, users.avatar, users.display_name,
           titles.period, titles.rank_id, titles.price, titles.sub_price,
           titles.league_id, titles.name, win_bets
      from (
             select uid, avatar, display_name
               from users
              where uid = :uid
           ) users,
           (
             select titles.uid, titles.league_id, view__leagues.name,
                    titles.period, titles.rank_id, ranks.price, ranks.sub_price
               from titles, user__ranks ranks, view__leagues
              where titles.rank_id = ranks.rank_id
                and titles.league_id = view__leagues.league_id
                and uid = :uid
                and titles.league_id = :league_id
                and period = :period
           ) titles,
           (
             SELECT IFNULL( (SELECT win_bets from users__win__lists__histories
              where uid = :uid
                and league_id = :league_id
                and date_timestamp = :begin ) ,'') as win_bets
           ) histories
     where users.uid = titles.uid
  `, {
    replacements: {
      uid: god_uid,
      league_id: league_id,
      begin: matches_date_unix,
      period: period
    },
    type: db.sequelize.QueryTypes.SELECT
  });

  return infos;
}

module.exports = buyModel;
