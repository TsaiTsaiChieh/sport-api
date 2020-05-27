  const errs = require('../../util/errorCode');
  const db = require('../../util/dbUtil');
  const modules = require('../../util/modules');
  function dividendExpireModel(args) {
    return new Promise(async function(resolve, reject) {
        
        if(args.method=="POST"){
            const expire_uids = db.sequelize.query(
                `
                    SELECT uid, SUM(expire_points)
                      FROM cashflow_expire_dividends
                     GROUP BY uid
                `,
                {
                  type: db.sequelize.QueryTypes.SELECT
                });
            resolve(expire_uids);
            /*改為另外寫一個table*/
        }else if(args.method=="PUT"){
            const from = modules.moment(new Date()).subtract(1,'months').startOf('month').format("YYYY-MM-DD");//上個月第一天
            const to = modules.moment(new Date()).subtract(1,'months').endOf('month').format("YYYY-MM-DD");//上個月最後一天
        
            const expire_uids = db.sequelize.query(
                `
                    INSERT INTO cashflow_expire_dividends (uid, expire_points)
                    SELECT to_uid, dividend
                    FROM user__transfer__logs
                    WHERE createdAt BETWEEN :from AND :to
                      AND dividend>0
                `,
                {
                  logging:true,
                  replacements: {from:from, to:to},
                  type: db.sequelize.QueryTypes.INSERT
                });
            resolve({expire_uids});
        }
        
        
    });
  }

  module.exports = dividendExpireModel;
  