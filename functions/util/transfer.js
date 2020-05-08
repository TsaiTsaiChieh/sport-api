const moment = require('moment');

/*寫入轉換紀錄*/
function doTransfer(db, args){
  
    const from_uid = args.from_uid || 'default';
    const to_uid = args.to_uid || 'default';
    const type_id = args.type_id || 0;
    const type = args.type || 'default';
    const money_type = args.money_type || 0;
    const money_value = args.money_value || 0;
    const title = args.title || 'empty title';
    const content = args.content || 'empty content';
    const scheduled = moment().unix();
    const date = moment().format('YYYY-MM-DD');
    const transfer = db.sequelize.query(
    `
      INSERT  INTO 
              user__transfer__logs 
              (
                from_uid, 
                to_uid,
                type_id,
                type, 
                money_type, 
                money_value,
                title,
                content,
                scheduled,
                createdAt,
                updatedAt
              )
      VALUES
              (
                $from_uid, 
                $to_uid, 
                $type_id,
                $type, 
                $money_type, 
                $money_value,
                $title,
                $content,
                $scheduled,
                $createdAt,
                $updatedAt
              )
      `,
    {
      logging:true,
      bind: { from_uid: from_uid, to_uid: to_uid, type_id:type_id, type: type, money_type: money_type, money_value: money_value, title:title, content:content, scheduled:scheduled, createdAt:date, updatedAt:date },
      type: db.sequelize.QueryTypes.INSERT
    });
    return transfer;
  }

  module.exports = {
    doTransfer
  }