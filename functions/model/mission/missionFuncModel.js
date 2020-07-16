const db = require('../../util/dbUtil');
const moment = require('moment');
const { zone_tw } = require('../../config/env_values');
// const funcList = {topicCheckByOneDate: };

// 預測賽事 區分聯盟
// begin、end: 日期區間
async function predictLeagueMatchCheckByDateBetween(userUid, beginUnix, endUnix) {
  const matchs = await db.sequelize.query(`
    select league_id, count(id) count
      from user__predictions
     where uid = :userUid
       and match_date between :begin and :end
     group by league_id
  `, {
    replacements: {
      userUid: userUid,
      begin: beginUnix,
      end: endUnix
    },
    type: db.sequelize.QueryTypes.SELECT
  });

  return matchs;
}

// 預測賽事 不區分聯盟
// begin、end: 日期區間
async function predictMatchCheckByDateBetween(userUid, beginUnix, endUnix) {
  const matchs = await db.sequelize.query(`
    select count(id) count
      from user__predictions
     where uid = :userUid
       and match_date between :begin and :end
  `, {
    replacements: {
      userUid: userUid,
      begin: beginUnix,
      end: endUnix
    },
    type: db.sequelize.QueryTypes.SELECT
  });

  return matchs;
}

// 發文檢查  category 類型(投注分享/賽事分析....等)
// begin、end:  同天 1594310400 1594310400 或 一段區間 1594310400 1594483200
async function topicCheckByDateBetween(uid, beginUnix, endUnix, category) {
  beginUnix = beginUnix.toString().length === 10 ? beginUnix * 1000 : beginUnix;
  endUnix = endUnix.toString().length === 10 ? endUnix * 1000 : endUnix;
  const beginYMD = moment.tz(beginUnix, zone_tw).format('YYYY-MM-DD');
  const endYMD = moment.tz(endUnix, zone_tw).format('YYYY-MM-DD');

  const topics = await db.sequelize.query(`
    select count(article_id) count
      from topic__articles
     where uid = :uid
       and createdAt between :begin and :end
       and category in (:category)
  `, {
    replacements: {
      uid: uid,
      begin: beginYMD + ' 00:00:00',
      end: endYMD + ' 11:59:59',
      category: category
    },
    type: db.sequelize.QueryTypes.SELECT
  });

  return topics;
}

// 預測賽事 當日 單(同)一聯盟 ?盤勝利 (限一次)
// begin、end: 日期區間
async function predictCorrectLeagueDailyByDateBetween(userUid, beginUnix, endUnix) {
  const matchs = await db.sequelize.query(`
    select league_id, match_date, sum(spread_corrct_count) correct_count
      from (
             select league_id, match_date, 
                    if (spread_result_flag > 0, 1, 0) spread_corrct_count
               from user__predictions
              where uid = :userUid
                and match_date between :begin and :end
           ) a
     group by league_id, match_date
     order by match_date
  `, {
    replacements: {
      userUid: userUid,
      begin: beginUnix,
      end: endUnix
    },
    type: db.sequelize.QueryTypes.SELECT
  });

  return matchs;
}

module.exports = {
  predictLeagueMatchCheckByDateBetween,
  predictMatchCheckByDateBetween,
  topicCheckByDateBetween,
  predictCorrectLeagueDailyByDateBetween
};
