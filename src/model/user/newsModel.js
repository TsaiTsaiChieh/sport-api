const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
function newsModel(method, args, uid) {
  return new Promise(async function(resolve, reject) {
    try {
      if (method === 'POST') {
        const newsList = {
          system: [],
          user: []
        };
        const end = await modules.moment(new Date()).format('YYYY-MM-DD HH:MM:SS');
        /* 取前一個月時間 */
        const begin_month = await modules.moment(new Date()).subtract(1, 'months').format('YYYY-MM-DD HH:MM:SS');
        /* 取前一周時間 */
        const begin_week = await modules.moment(new Date()).subtract(1, 'weeks').format('YYYY-MM-DD HH:MM:SS');

        /* 系統訊息資料 */
        newsList.system = await db.sequelize.query(
          `
            SELECT * FROM user__news__sys WHERE (target = -1 OR target LIKE '%${uid}%') AND updatedAt BETWEEN '${begin_month}' AND '${end}'
          `,
          {
            type: db.sequelize.QueryTypes.SELECT,
            raw: true
          }
        );

        // console.log(user_filter);return;
        /* 讀取最愛玩家資料 */
        const favorite_user = await db.sequelize.query(
        `
          SELECT god_uid
            FROM user__favoriteplayers
           WHERE uid = '${uid}'
           GROUP BY god_uid
        `,
        {
          type: db.sequelize.QueryTypes.SELECT,
          raw: true
        }
        );

        const uids = Object.values(favorite_user).map(item => item.god_uid);

        /* 使用者訊息資料 */
        newsList.user = await db.sequelize.query(
            `
            SELECT un.news_id, un.uid, u.display_name, un.sort, un.sort_id, un.league, un.title, un.content, un.status, un.match_scheduled_tw, un.scheduled, un.createdAt, un.updatedAt
              FROM user__news un, users u
            WHERE u.uid = un.uid
              AND un.status=0
              AND un.active=1
              AND un.uid in ( :uids )
              AND un.updatedAt BETWEEN '${begin_week}' and '${end}'
            ORDER BY un.updatedAt DESC
            `,
            {
              replacements: { uids: uids },
              type: db.sequelize.QueryTypes.SELECT,
              raw: true
            }
        );
        console.log(newsList);
        resolve(newsList);
      } else if (method === 'PUT') {
        const now = modules.moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
        const now_timestamp = modules.moment(new Date()).unix();
        const title = args.title;
        const content = args.content;

        const insert = db.sequelize.query(
          `
            INSERT INTO user__news (uid, title, content, status, active, scheduled, createdAt, updatedAt)
            VALUES ($uid, $title, $content, 0, 1, $now_timestamp, $now, $now);
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
                 SET active=0
               WHERE news_id in (${del_join})
                 AND status=0
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
