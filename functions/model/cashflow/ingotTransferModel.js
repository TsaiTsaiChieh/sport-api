// const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');
const modules = require('../../util/modules');
async function ingotTransferModel(args) {
  return new Promise(async function(resolve, reject) {
    const t = await db.sequelize.transaction();
    const scheduled = modules.moment().unix();
    try {
      const transfer_id = args.transfer_id;
      const [transferErr, transfer] = await modules.to(db.sequelize.models.cashflow_ingot_transfer.findOne({
        where: { transfer_id: transfer_id },
        attribute: ['uid', 'ingot', 'ingot_real', 'coin', 'coin_real', 'money', 'money_real', 'dividend', 'dividend_real', 'fee', 'fee_real']
      }));
   
        /* 匯款入帳 */
      if (args.output === 'income') {
        transfer.status = 1;
        const [incomeErr, income] = await db.sequelize.query(
            `
                INSERT INTO cashflow_ingot_transfers 
                            ( from_transfer_id, uid,  status,  cash_status,  ingot,  ingot_real,  coin,  coin_real,  money,  money_real,  fee,  fee_real,  scheduled) 
                     VALUES ( $transfer_id, $uid, $status, $cash_status, $ingot, $ingot_real, $coin, $coin_real, $money, $money_real, $fee, $fee_real, $scheduled)
            `,
            {
              bind: { transfer_id:transfer_id, uid:transfer.uid, status:transfer.status, cash_status:transfer.cash_status, ingot:transfer.ingot, ingot_real:transfer.ingot_real, coin:transfer.coin, coin_real:transfer.coin_real, 
                      money:transfer.money, money_real:transfer.money_real, fee:transfer.fee, fee_real:transfer.fee_real, scheduled},
              type: db.sequelize.QueryTypes.INSERT
            }
        );

       
        /* 匯款失敗 */
      } else if (args.output === 'failed') {
        transfer.status = -1;
        const [incomeErr, income] = await db.sequelize.query(
            `
                INSERT INTO cashflow_ingot_transfers 
                            ( from_transfer_id, uid,  status,  cash_status,  ingot,  ingot_real,  coin,  coin_real,  money,  money_real,  fee,  fee_real,  scheduled) 
                     VALUES ( $transfer_id, $uid, $status, $cash_status, $ingot, $ingot_real, $coin, $coin_real, $money, $money_real, $fee, $fee_real, $scheduled)
            `,
            {
              bind: { transfer_id:transfer_id, uid:transfer.uid, status:transfer.status, cash_status:transfer.cash_status, ingot:transfer.ingot, ingot_real:transfer.ingot_real, coin:transfer.coin, coin_real:transfer.coin_real, 
                      money:transfer.money, money_real:transfer.money_real, fee:transfer.fee, fee_real:transfer.fee_real, scheduled},
              type: db.sequelize.QueryTypes.INSERT
            }
        );
      }
     
      if (transferErr) {
        await t.rollback();
      }
      if (incomeErr) {
        await t.rollback();
      }
      if (failedErr) {
        await t.rollback();
      }
      
      await t.commit();
      
    } catch (err) {
      await t.rollback();
    }
  });
}

module.exports = ingotTransferModel;
