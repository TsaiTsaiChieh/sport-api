
const moment = require('moment');

/* 寫入轉換紀錄 */
function doTransfer(db, args) {
  const from_uid = args.from_uid || 'default';
  const to_uid = args.to_uid || 'default';
  const type_id = args.type_id || 0;
  const article_id = args.article_id || 0;
  const type = args.type || 'default';
  const money_type = args.money_type || 0;
  const money_value = args.money_value || 0;
  const ingot = args.ingot || 0;
  const coin = args.coin || 0;
  const dividend = args.dividend || 0;
  const title = args.title || 'empty_title';
  const content = args.content || 'empty_content';
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
                ingot,
                coin,
                dividend,
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
                $ingot,
                $coin,
                $dividend,
                $title,
                $content,
                $scheduled,
                $createdAt,
                $updatedAt
              )
      `,
    {
      logging: false,
      bind: { from_uid: from_uid, to_uid: to_uid, type_id: type_id, type: type, money_type: money_type, money_value: money_value, ingot, coin, dividend, title: title, content: content, scheduled: scheduled, createdAt: date, updatedAt: date },
      type: db.sequelize.QueryTypes.INSERT
    });

  return transfer;
}

module.exports = {
  doTransfer
};
