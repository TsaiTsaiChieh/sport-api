// const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');
const modules = require('../../util/modules');
function dividendExpireModel(args) {
  return new Promise(async function(resolve, reject) {
    const from = modules.moment(new Date()).subtract(1, 'months').startOf('month').unix();// 上個月第一天
    const to = modules.moment(new Date()).subtract(1, 'months').endOf('month').unix();// 上個月最後一天

    const expire_scheduled = modules.moment(new Date()).unix();
    if (args.method === 'POST') {
      const expire = await db.sequelize.query(
                `
                    SELECT uid, SUM(expire_points) as total_expire_points
                      FROM cashflow_dividends
                     WHERE status=0
                     GROUP BY uid
                `,
                {
                  type: db.sequelize.QueryTypes.SELECT
                });
      resolve(expire);
      /* 改為另外寫一個table */
    } else if (args.method === 'PUT') {
      // INSERT INTO cashflow_expire_dividends (uid, expire_points)
      //               SELECT to_uid, dividend
      //               FROM user__transfer__logs
      //               WHERE createdAt BETWEEN :from AND :to
      //                 AND dividend>0
      const expire = await db.sequelize.query(
                `
                    UPDATE cashflow_dividends
                       SET status=0,
                           expire_scheduled = :expire_scheduled
                     WHERE scheduled
                   BETWEEN :from AND :to
                `,
                {
                  logging: true,
                  replacements: { expire_scheduled:expire_scheduled, from: from, to: to },
                  type: db.sequelize.QueryTypes.INSERT
                });
      resolve(expire);
    } else if (args.method === 'DELETE') {
      const expire_uids = await db.sequelize.query(
                `
                SELECT uid, SUM(expire_points) as total_expire_points
                  FROM cashflow_dividends
                 WHERE scheduled BETWEEN :from AND :to
                   AND status = 0
                   AND expire_points > 0 
                 GROUP BY uid
                `,
                {
                  replacements: { from: from, to: to },
                  type: db.sequelize.QueryTypes.SELECT
                }
      );


      const update = 0;

      expire_uids.forEach(function(data){
        console.log(data, data.uid);
        const expire = db.sequelize.query(
          `
              UPDATE users
                 SET dividend = dividend-:expire_points
               WHERE uid = :uid
          `
          ,
          {
            logging: true,
            replacements: { expire_points:data.total_expire_points, uid: data.uid },
            type: db.sequelize.QueryTypes.UPDATE
          });
          if(expire!=null){
            update++;
          }
      });
      resolve({'updates':update});
    }
  });
}

module.exports = dividendExpireModel;
