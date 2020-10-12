const db = require('../../util/dbUtil');
const Op = require('sequelize').Op;

module.exports.getUserInfo = async function(users) {
  return new Promise(async function(resolve, reject) {
    try {
      const result = await db.sequelize.models.user.findAll({
        attributes: [
          'uid',
          'status',
          'avatar',
          'name',
          'display_name',
          'signature'
        ],
        where: {
          uid: {
            [Op.or]: users
          }
        },
        raw: true
      });
      resolve(result);
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
};
module.exports.getTopicInfo = async function(aid) {
  return new Promise(async function(resolve, reject) {
    try {
      // console.log('function: get topic info by aid:' + aid);
      const result = await db.sequelize.models.topic__article.findOne({
        where: {
          article_id: aid,
          status: 1
        },
        raw: true
      });
      resolve(result);
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
};
module.exports.getTopicReplyCount = async function(articles) { // 傳入array aid
  return new Promise(async function(resolve, reject) {
    try {
      // SQL原意：SELECT aid, COUNT(*) FROM topic__replies WHERE aid = 116 OR aid = 117 GROUP BY aid;
      const result = await db.sequelize.models.topic__reply.findAll({
        attributes: [
          'article_id',
          [db.sequelize.fn('COUNT', db.sequelize.col('article_id')), 'count']
        ],
        where: {
          article_id: {
            status: 1,
            [Op.or]: articles
          },
          status: 1
        },
        group: 'article_id',
        raw: true
      });
      resolve(result);
    } catch (error) {
      console.error(error);
      resolve({});
    }
  });
};

module.exports.getReplyLikeCount = async function(replies) { // 傳入array rid
  return new Promise(async function(resolve, reject) {
    try {
      const result = await db.sequelize.models.topic__replylike.findAll({
        attributes: [
          'reply_id',
          [db.sequelize.fn('COUNT', db.sequelize.col('reply_id')), 'count']
        ],
        where: {
          reply_id: {
            status: 1,
            [Op.or]: replies
          }
        },
        group: 'reply_id',
        raw: true
      });
      resolve(result);
    } catch (error) {
      console.error(error);
      resolve({});
    }
  });
};
module.exports.getReplyContent = async function(replies) { // 傳入array rid
  return new Promise(async function(resolve, reject) {
    try {
      const result = await db.sequelize.models.topic__reply.findAll({
        where: {
          reply_id: {
            status: 1,
            [Op.or]: replies
          }
        },
        group: 'reply_id',
        raw: true
      });
      resolve(result);
    } catch (error) {
      console.error(error);
      resolve({});
    }
  });
};
module.exports.getArticlesContent = async function(aids) { // 傳入array rid
  return new Promise(async function(resolve, reject) {
    try {
      const result = await db.sequelize.models.topic__article.findAll({
        where: {
          article_id: {
            status: 1,
            [Op.or]: aids
          }
        },
        group: 'article_id',
        raw: true
      });
      resolve(result);
    } catch (error) {
      console.error(error);
      resolve({});
    }
  });
};
module.exports.getIsUserLikeTopic = async function(uid, article_id) { // 取得自己有無按過讚（單篇）
  return new Promise(async function(resolve, reject) {
    try {
      const result = await db.sequelize.models.topic__like.count({
        where: {
          article_id: article_id,
          uid: uid
        },
        raw: true
      });
      resolve(result !== 0);
    } catch (error) {
      console.error(error);
      reject(false);
    }
  });
};
module.exports.getIsUserLikeReply = async function(uid, replies) { // 取得自己有無按過留言讚（多則）
  return new Promise(async function(resolve, reject) {
    try {
      // console.log(uid);
      // console.log(replies);
      const result = await db.sequelize.models.topic__replylike.findAll({
        attributes: [
          'reply_id',
          [db.sequelize.fn('COUNT', db.sequelize.col('reply_id')), 'count']
        ],
        where: {
          uid: uid,
          reply_id: {
            [Op.or]: replies
          }
        },
        group: 'reply_id',
        raw: true
      });
      resolve(result);
    } catch (error) {
      console.error(error);
      resolve({});
    }
  });
};
module.exports.chkUserBlocking = async function(uid) {
  return new Promise(async function(resolve, reject) {
    try {
      const result = await db.sequelize.models.user.findOne({
        where: {
          uid: uid
        },
        raw: true
      });
      let block_ts;
      if (result.block_message && result.block_message !== null && result.block_message !== '') {
        const block_date = new Date(result.block_message);
        block_ts = block_date.getTime();
      } else {
        block_ts = 0;
      }
      if (Date.now() < block_ts) {
        resolve(false);
      } else {
        resolve(true);
      }
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
};
