/*寫入轉換紀錄*/
function doTransfer(db, args){
    
    const from_id = args.from_id || 0;
    const to_id = args.to_id || 0;
    const trans_type = args.type;
    const money_type = args.money_type;
    const money_value = args.money_value;
  
    const transfer = db.sequelize.query(
    `
      INSERT  INTO 
              user__transfer__logs 
              (
                from_uid, 
                to_uid,
                trans_type, 
                money_type, 
                money_value
              )
      VALUES
              (
                $from_id, 
                $to_id, 
                $trans_type, 
                $money_type, 
                $money_value
              )
      `,
    {
      bind: { from_id: from_id, to_id: to_id, trans_type: trans_type, money_type: money_type, money_value: money_value },
      type: db.sequelize.QueryTypes.INSERT
    });
    return transfer;
  }


  module.exports = {
    doTransfer
  }