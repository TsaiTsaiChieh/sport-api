/* eslint-disable no-unused-vars */
const { NP, leagueCodebook } = require('../../util/modules');
const errs = require('../../util/errorCode');
// const db = require('../../util/dbUtil');
const { getGodSellPredictionDatesWinBetsInfo } = require('../../util/databaseEngine');

function buyModel(args, uid) {
  return new Promise(async function(resolve, reject) {
    try {
      const buyList = [];
      const begin = args.begin;
      const end = args.end;
      const buy = await getGodSellPredictionDatesWinBetsInfo(uid, begin, end);
      // const rangeDate = moment.range(begin, end);

      // const arrRangeDate = [];
      // Array.from(rangeDate.by('day')).forEach(function(data) {
      //   arrRangeDate.push(convertTimezone(data.format('YYYYMMDD')));
      // });
      // // console.log('arrRangeDate: ', arrRangeDate);

      // // 用 bind 會有錯誤
      // const buy = await db.sequelize.query(
      //   `
      //     SELECT *
      //       FROM user__buys
      //      where matches_date in (:arrRangeDate)
      //        -- and uid = :uid
      //   `,
      //   {
      //     replacements: { uid: uid, arrRangeDate: arrRangeDate },
      //     type: db.sequelize.QueryTypes.SELECT
      //   }
      // );

      for (const ele of buy) {
        buyList.push({
          date: ele.matches_date,
          god: {
            god_name: ele.info.display_name,
            avatar: ele.info.avatar
          },
          league: leagueCodebook(ele.info.name).name_ch,
          cost: ele.info.price,
          sub_price: ele.info.sub_price,
          bets: NP.round(ele.info.win_bets, 2),
          status: ele.buy_status
        });
      };

      resolve(buyList);
    } catch (err) {
      console.log('Error in  user/buy by henry:  %o', err);
      return reject(errs.errsMsg('500', '500', err.message));
    }
  });
}

// function repackage(ele) {
//   const data = {};
//   const god = {};
//   god.god_name = ele.display_name;
//   god.avatar = ele.avatar;
//   data.god = god;

//   data.date = ele.date;
//   data.league = ele.name;
//   data.cost = ele.price;
//   data.bets = ele.win_bets.toFixed(2);
//   data.sub_price = ele.sub_price;
//   data.status = ele.status;

//   return data;
// }

module.exports = buyModel;
