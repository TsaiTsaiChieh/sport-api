const db = require('../../util/dbUtil');
const neweb_sdk = require('../../util/cashflow_sdk/neweb_sdk');
const neweb_config = require('../../config/cashflow/neweb_config');
async function mpgNotifyModel(res) {
  updateTicket(res);
}

async function updateTicket(res)
{
  const exchange = res.body;
 
/* 金流基本參數*/

 const HashKey = neweb_config.hashKey;
 const HashIV = neweb_config.hashIV;


 const return_data = await neweb_sdk.create_mpg_aes_decrypt(exchange.TradeInfo, HashKey, HashIV);
 const rdata = JSON.parse(return_data);
 const serial_number = rdata.MerchantOrderNo 
 if(exchange.Status==='SUCCESS'){
    exchange.order_status = 1;
  }else{
    exchange.order_status = 0;
  }
  
  await db.CashflowDeposit.update({
    payment_type: rdata.PaymentType,
    trade_info:return_data,
    trade_sha: exchange.TradeSha
  }, {
    where: {
      serial_number:serial_number
    }
  });
  
}
module.exports = mpgNotifyModel;
