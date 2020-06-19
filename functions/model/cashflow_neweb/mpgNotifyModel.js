const db = require('../../util/dbUtil');

async function mpgNotifyModel(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const status = NULL;
      if(args.status!=undefined){
        status = args.status
      }else{
        status = 'undefined';
      }
      
      if(args.MerchantID!=undefined){
        merchant_id = args.MerchantID
      }else{
        merchant_id = 'undefined';
      }

      if(args.TradeInfo!=undefined){
        trade_info = args.TradeInfo
      }else{
        trade_info = 'undefined';
      }
      
      if(args.TradeSha!=undefined){
        trade_sha = args.TradeSha
      }else{
        trade_info = 'undefined';
      }

      const expire = await db.sequelize.query(
        `
        INSERT cashflow_deposits (uid, money, money_real, coin, coin_real, dividend, dividend_real, serial_number, status, merchant_id, trade_info, trade_sha) VALUES ('33333', 3, 3, 3, 3, 1, 1, 111, :status, :merchant_id, :trade_info, :trade_sha)
        `,
        {
          logging: true,
          replacements: 
          {
            status:status,
            merchant_id:merchant_id,
            trade_info:trade_info,
            trade_sha:trade_sha
          },
            type: db.sequelize.QueryTypes.INSERT
        });
      resolve(expire);
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = mpgNotifyModel;
