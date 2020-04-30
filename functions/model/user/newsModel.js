const modules = require('../../util/modules');
const db = require('../../util/dbUtil');

function newsModel(method, args, uid) {
  return new Promise(async function(resolve, reject) {
    try {
      if (method === 'POST') {
        /* 取前一個月時間 */
        const end = modules.moment(new Date()).format('YYYY-MM-DD HH:mm:ss'); ;
        const begin = modules.moment(new Date()).subtract(1, 'months').format('YYYY-MM-DD HH:mm:ss'); ;

        /* 系統訊息設定 */
        const page_system = args.page_system || 0;
        const limit_system = args.limit_system || 10;
        const start_system = page_system * limit_system;

        /* 使用者訊息設定 */
        const page_user = args.page_user || 0;
        const limit_user = args.limit_user || 10;
        const start_user = page_user * limit_user;

        /* 系統訊息資料 */
        const system = await db.sequelize.query(
          `
          SELECT * 
            FROM user__news
          WHERE createdAt BETWEEN '${begin}' and '${end}' 
            AND status=0
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
      } else if (method === 'DELETE') {
        const del_join = args.join(',');

        const del_res = db.sequelize.query(`DELETE FROM user__news WHERE uid = '${uid}' news_id in (${del_join})`);

        if (del_res) {
          const result = {
            code: '200',
            msg: '刪除成功'
          };
          resolve(result);
        } else {
          const result = {
            code: '400',
            msg: '刪除失敗'
          };
          resolve(result);
        }
      }
    } catch (err) {
      console.log('error happened...', err);
      reject({ code: 500, error: err });
    }
  });
}

module.exports = newsModel;
