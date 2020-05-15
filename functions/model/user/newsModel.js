const modules = require('../../util/modules');
const db = require('../../util/dbUtil');

function newsModel(method, args, uid) {
  return new Promise(async function(resolve, reject) {
    try {
      if (method === 'POST') {
        /* 取前一個月時間 */
        const end = modules.moment(new Date()).unix();
        const begin = modules.moment(new Date()).subtract(1, 'months').unix();

        /* 系統訊息設定 */
        const page_system = args.page_system || 0;
        const limit_system = args.limit_system || 10;
        const start_system = page_system * limit_system;

        /* 使用者訊息設定 */
        const page_user = args.page_user || 0;
        const limit_user = args.limit_user || 10;
        const start_user = page_user * limit_user;


        /* 系統訊息資料 */
        const delete_id_query = await db.sequelize.query(
          `
          SELECT system_id
            FROM user__news__systems
           WHERE uid=$uid
          `,
          {
            bind: { uid: uid },
            type: db.sequelize.QueryTypes.SELECT
          }
        );
        let news_id = [];
        delete_id_query.forEach(function(ele) {
            news_id.push(ele.system_id.toString());
        });
        
        const system = await db.sequelize.query(
          `
          SELECT news_id, title, content, status, scheduled, createdAt, updatedAt 
            FROM user__news
           WHERE news_id NOT IN (:news_id)
             AND scheduled BETWEEN :begin and :end
             AND status=0
           ORDER BY scheduled DESC
           LIMIT :start_system, :limit_system
          `,
          {
            logging:true,
            replacements: { begin: begin, end: end, start_system: start_system, limit_system: limit_system, news_id:news_id.join() },
            type: db.sequelize.QueryTypes.SELECT
          }
        );

        /* 使用者訊息資料 */
        const user = await db.sequelize.query(
          `
          SELECT un.news_id, un.uid, un.title, un.content, un.status, un.scheduled, un.createdAt, un.updatedAt
            FROM user__news un, users u
          WHERE un.scheduled BETWEEN $begin and $end
            AND u.uid = un.uid
            AND un.status=1
            AND un.uid = $uid
          ORDER BY un.scheduled DESC
            LIMIT $start_user, $limit_user
          `,
          {
            bind: { uid: uid, begin: begin, end: end, start_user: start_user, limit_user: limit_user },
            type: db.sequelize.QueryTypes.SELECT
          }
        );

        const newsList = {
          system: system,
          user: user
        };
        resolve(newsList);
      } else if (method === 'PUT') {
        const now = modules.moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
        const now_timestamp = modules.moment(new Date()).unix();
        const title = args.title;
        const content = args.content;

        const insert = db.sequelize.query(
          `
            INSERT INTO user__news (uid, title, content, status, scheduled, createdAt, updatedAt)
            VALUES ($uid, $title, $content, 1, $now_timestamp, $now, $now);
          `,
          {
            bind: { uid: uid, title: title, content: content, now_timestamp: now_timestamp, now: now },
            type: db.sequelize.QueryTypes.INSERT
          }
        );
        resolve(insert);
      } else if (method === 'DELETE') {
        const is_system = args.is_system;
        const items = args.items;
        const del_join = items.join(',');
        let del_res = [];
        if (is_system) {
          items.forEach(function(item) {
            del_res = db.News_System.upsert({
              system_id: item,
              uid: uid,
              active: 0
            });
          });
        } else {
          del_res = db.sequelize.query(
            `
              UPDATE user__news 
                 SET uid='${uid}'
                 AND active=0
               WHERE news_id in (${del_join})
            `,
            {
              type: db.sequelize.QueryTypes.DELETE
            }
          );
        }
        resolve(del_res);
      }
    } catch (err) {
      console.log('error happened...', err);
      reject({ code: 500, error: err });
    }
  });
}

module.exports = newsModel;
