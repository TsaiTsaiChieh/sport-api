const { NP, leagueCodebook, to } = require('../../util/modules');
const errs = require('../../util/errorCode');
const { getGodSellPredictionDatesWinBetsInfo } = require('../../util/databaseEngine');

async function buyModel(args, uid) {
  const buyList = [];
  const begin = args.begin;
  const end = args.end;

  const [err, buy] = await to(getGodSellPredictionDatesWinBetsInfo(uid, begin, end));
  if (err) {
    console.error('[Error][buyModel][getGodSellPredictionDatesWinBetsInfo] ', err);
    throw errs.dbErrsMsg('404', '50111', { addMsg: err.parent.code });
  }
  if (!buy) return buyList;

  for (const ele of buy) {
    buyList.push({
      date: ele.matches_date,
      god: {
        god_uid: ele.info.uid,
        god_name: ele.info.display_name,
        avatar: ele.info.avatar
      },
      league: leagueCodebook(ele.info.name).name_ch,
      cost: ele.info.price,
      sub_price: ele.info.sub_price,
      bets: NP.round(ele.info.win_bets, 2),
      status: ele.buy_status // -2:已退款  -1:處理中 全額退款  0:處理中 賽事全無效  1:已付費
    });
  };

  return buyList;
}

module.exports = buyModel;
