const db = require('../../util/dbUtil');

async function mpgNotifyModel(args) {
  return new Promise(function(resolve, reject) {
    try {
      let statu = 2;

      if(args.Status){
        statu = 3;
      }else{
        statu = 4;
      }
      const notify = db.sequelize.query(
        `
          UPDATE cashflow_deposits SET status=:status WHERE serial_number=:serial_number
        `,
        {
          logging:true,
          replacements: 
          {
            status:statu,
            serial_number:'serial_number_test'
          },
          type: db.sequelize.QueryTypes.UPDATE
        });
      resolve(notify);
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = mpgNotifyModel;
