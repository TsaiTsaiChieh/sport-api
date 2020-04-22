const modules = require('../../util/modules');
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');

function searchUserDetail (args) {
  return new Promise(async function (resolve, reject) {
    try {
      const searchUserDetail = []; // 儲存 聯盟處理完成資料
      const uid = args;

      const range = args.range;
      const period = modules.getTitlesPeriod(new Date()).period;
      const searchUserDetailQuery = await db.sequelize.query(
        `
        SELECT *, u.uid as uuid FROM users u 
          LEFT JOIN users__win__lists uwl 
            ON u.uid = uwl.uid 
          LEFT JOIN titles t 
            ON t.uid=u.uid
         WHERE u.uid = '${uid}'
        `,
        {
          type: db.sequelize.QueryTypes.SELECT
        })
      // console.log(searchUserDetailQuery);
      searchUserDetailQuery.forEach(function (data) { // 這裡有順序性
        searchUserDetail.push(repackage(data));
      });

      resolve(searchUserDetail);
    } catch (err) {
      console.log('Error in  rank/searchUserDetail by henry:  %o', err);
      return reject(errs.errsMsg('500', '500', err.message));
    }
  });
}

function repackage (ele) {
  const data = {
    // win_rate: ele.win_rate,
    uid: ele.uuid,
    avatar: ele.avatar,
    displayname: ele.display_name
  };
  // console.log(data);
  data.win_rate = ele.win_rate;

  // 大神要 顯示 預設稱號
  if ([1, 2, 3, 4].includes(ele.rank_id)) {
    data.rank = ele.rank_id;
    data.default_title = ele.default_title;
    data.continue = ele.continue; // 連贏Ｎ場
    data.predict_rate = [ele.predict_rate1, ele.predict_rate2, ele.predict_rate3]; // 近N日 N過 N
    data.predict_rate2 = [ele.predict_rate1, ele.predict_rate3]; // 近N日過 N
    data.win_bets_continue = ele.win_bets_continue; // 勝注連過 Ｎ日
    data.matches_rate = [ele.matches_rate1, ele.matches_rate2]; // 近 Ｎ 場過 Ｎ 場;
    data.matches_continue = ele.matches_continue // 連贏Ｎ場
  }

  return data;
}

function rangeWinRateCodebook (range) {
  switch (range) {
    case 'this_period':
      return 'this_period_win_bets';
    case 'this_week':
      return 'this_week_win_rate';
    case 'last_week':
      return 'last_week_win_rate';
    case 'this_month':
      return 'this_month_win_rate';
    case 'last_month':
      return 'last_month_win_rate';
    case 'this_season':
      return 'this_season_win_rate';
  }
}

module.exports = searchUserDetail;
