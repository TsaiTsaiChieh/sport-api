const modules = require('../../util/modules');
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');

function buyModel(args, uid) {
  return new Promise(async function(resolve, reject) {
    try {
      const buyList = [];
      const begin = args.begin;
      const end = args.end;

      const buy = await db.sequelize.query(
        `
          SELECT 
                  b.buy_id,
                  b.scheduled AS date, 
                  u.uid, 
                  u.name AS god_name, 
                  u.avatar, 
                  r.price, 
                  ml.name_ch,
                  b.season,
                  b.day_of_year,
                  (
                    SELECT SUM(uwlh.win_bets)
                      FROM users__win__lists__histories uwlh
                     WHERE uwlh.league_id = b.league_id
                       AND uwlh.season = b.season
                       AND uwlh.day_of_year = b.day_of_year
                  ) bets,
                  (
                  CASE b.status  
                    WHEN -1 THEN r.price 
                    WHEN 0  THEN '-'
                    WHEN 1  THEN r.sub_price
                    WHEN 2  THEN r.sub_price 
                  END  
                  ) sub_price,
                  b.status
            FROM  user__buys b, 
                  users u, 
                  user__ranks r, 
                  match__leagues ml
            WHERE b.god_id=u.uid 
              AND b.league_id = ml.league_id
              AND r.rank_id = b.god_rank
              AND b.uid=$uid
            GROUP BY
                  b.buy_id,
                  b.updatedAt, 
                  b.uid, 
                  u.name, 
                  u.avatar, 
                  r.price, 
                  ml.name_ch
       `,
        {
          bind: { uid: uid, begin: begin, end: end },
          type: db.sequelize.QueryTypes.SELECT
        }
      );
      buy.forEach(function(ele) { // 這裡有順序性
        buyList.push(repackage(ele));
      });

      resolve(buyList);
    } catch (err) {
      console.log('Error in  user/buy by henry:  %o', err);
      return reject(errs.errsMsg('500', '500', err.message));
    }
  });
}
function repackage(ele) {
  const data = {};
  const god = {};
  god.god_name = ele.god_name;
  god.avatar = ele.avatar;

  data.date = ele.date;
  data.god = god;
  data.league = ele.name_ch;
  data.cost = ele.price;
  data.bets = ele.bets.toFixed(2);
  data.sub_price = ele.sub_price;
  data.status = ele.status;

  return data;
}
module.exports = buyModel;
