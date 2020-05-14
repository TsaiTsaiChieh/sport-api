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
      const result = await db.sequelize.models.topic__article.findAll({
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
          }
        },
        group: 'article_id',
        raw: true
      });
      resolve(result);
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
};
module.exports.getTopicLikeCount = async function(articles) { // 傳入array aid
  return new Promise(async function(resolve, reject) {
    try {
      // SQL原意：SELECT article_id, COUNT(*) FROM topic__likes WHERE article_id = 116 OR article_id = 117 GROUP BY article_id;
      const result = await db.sequelize.models.topic__like.findAll({
        attributes: [
          'article_id',
          [db.sequelize.fn('COUNT', db.sequelize.col('article_id')), 'count']
        ],
        where: {
          article_id: {
            status: 1,
            [Op.or]: articles
          }
        },
        group: 'article_id',
        raw: true
      });
      resolve(result);
    } catch (error) {
      console.error(error);
      reject(error);
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
      reject(error);
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
      reject(error);
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
      reject(error);
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
      reject(error);
    }
  });
};
