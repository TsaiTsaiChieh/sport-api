const db = require('../../../util/dbUtil');
const func = require('../../topics/topicFunctions');
const countPerPage = 50;
async function model(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const where = {};
      if (args.status) where.status = args.status;
      const res = await db.sequelize.models.service__reporttopic.findAndCountAll({
        where: where,
        limit: countPerPage, // 每頁幾個
        offset: countPerPage * args.page, // 跳過幾個 = limit * index
        sort: null,
        raw: true
      });
      /* 讀取一些別的資料 */
      let RusersToGet = []; // 檢舉玩家的時候
      let usersToGet = [];
      let RusersInfo = [];
      let usersInfo = [];
      let articlesToGet = [];
      let articlesInfo = [];
      let repliesToGet = [];
      let repliesInfo = [];
      for (let i = 0; i < res.rows.length; i++) {
        usersToGet.push(res.rows[i].uid);
        if (res.rows[i].type === 'article') {
          articlesToGet.push(res.rows[i].article_id);
        } else if (res.rows[i].type === 'reply') {
          repliesToGet.push(res.rows[i].article_id);
        } else if (res.rows[i].type === 'user') {
          RusersToGet.push(res.rows[i].article_id);
        }
      }
      /* 去除重複的 */
      RusersToGet = [...new Set(RusersToGet)];
      usersToGet = [...new Set(usersToGet)];
      articlesToGet = [...new Set(articlesToGet)];
      repliesToGet = [...new Set(repliesToGet)];
      /* 讀取user info */
      try {
        usersInfo = await func.getUserInfo(usersToGet);
        RusersInfo = await func.getUserInfo(RusersToGet);
      } catch (error) {
        console.error(error);
        reject({ code: 500, error: 'get user info failed' });
      }
      /* 讀取要取得的回覆內容 */
      try {
        repliesInfo = await func.getReplyContent(repliesToGet);
      } catch (error) {
        reject({ code: 500, error: 'get reply info failed' });
      }
      /* 讀取要取得的文章內容 */
      try {
        articlesInfo = await func.getArticlesContent(articlesToGet);
      } catch (error) {
        console.error(error);
        reject({ code: 500, error: 'get article info failed' });
      }

      for (let i = 0; i < res.rows.length; i++) {
        let userInfo = usersInfo.filter(obj => obj.uid === res.rows[i].uid.toString());
        userInfo = userInfo[0] ? userInfo[0] : null;
        res.rows[i].user_info = userInfo;
        if (res.rows[i].type === 'article') {
          let articleInfo = articlesInfo.filter(obj => obj.article_id === Number(res.rows[i].article_id));
          articleInfo = articleInfo[0] ? articleInfo[0] : null;
          res.rows[i].article_info = articleInfo;
        } else if (res.rows[i].type === 'reply') {
          let replyInfo = repliesInfo.filter(obj => obj.reply_id === res.rows[i].article_id);
          replyInfo = replyInfo[0] ? replyInfo[0] : null;
          res.rows[i].reply_info = replyInfo;
        } else if (res.rows[i].type === 'user') {
          let RuserInfo = RusersInfo.filter(obj => obj.uid === res.rows[i].article_id);
          RuserInfo = RuserInfo[0] ? RuserInfo[0] : null;
          res.rows[i].accuse_user_info = RuserInfo;
        }
      }

      resolve({ code: 200, count: res.count, data: res.rows });
    } catch (err) {
      console.error(err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = model;
