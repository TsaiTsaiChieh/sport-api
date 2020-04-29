const modules = require('../../util/modules');
const db = require('../../util/dbUtil');

function newsModel(args, uid) {
  return new Promise(async function(resolve, reject) {
    try {
      console.log(args);
      /* 取前一個月時間 */
      const end = modules.moment(new Date()).format('YYYY-MM-DD HH:mm:ss'); ;
      const begin = modules.moment(new Date()).subtract(1, 'months').format('YYYY-MM-DD HH:mm:ss'); ;

      /* 系統訊息設定 */
      const page_system = args.page_s || 0;
      const limit_system = args.limit_s || 10;
      const start_system = page_system * limit_system;

      /* 使用者訊息設定 */
      const page_user = args.page_u || 0;
      const limit_user = args.limit_u || 10;
      const start_user = page_user * limit_user;

      /* 系統訊息資料 */
      const system = await db.sequelize.query(
        `
        SELECT * 
          FROM user__news
        WHERE createdAt BETWEEN '${begin}' and '${end}' 
          AND status=0    
          AND uid = '${uid}'
        ORDER BY createdAt DESC
        LIMIT ${start_system}, ${limit_system}
        `,
        {
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      /* 使用者訊息資料 */
      const user = await db.sequelize.query(
        `
        SELECT * 
          FROM user__news un, users u
        WHERE un.createdAt BETWEEN '${begin}' and '${end}'
          AND u.uid = un.uid
          AND un.status=1
          AND un.uid = '${uid}'
        ORDER BY un.createdAt DESC
          LIMIT ${start_user}, ${limit_user}
        `,
        {
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      const newsList = {
        system: system,
        user: user
      };
      resolve(newsList);
    } catch (err) {
      console.log('error happened...', err);
      reject({ code: 500, error: err });
    }
  });
}

module.exports = newsModel;
