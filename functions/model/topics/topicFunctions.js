/* eslint-disable promise/always-return */
const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
const log = require('../../util/loggingUtil');
const Op = require('sequelize').Op;

module.exports.getUserInfo = async function(users) {
  return new Promise(async function(resolve, reject) {
    try {
      const result = db.sequelize.models.user.findAll({
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
      log.data(error);
      reject(error);
    }
  });
};
module.exports.getTopicInfo = async function(aid) {
  return new Promise(async function(resolve, reject) {
    try {
      log.info('function: get topic info by aid:' + aid);
      const result = await db.sequelize.models.topic__article.findAll({
        where: {
          article_id: aid
        },
        raw: true
      });
      resolve(result);
    } catch (error) {
      log.data(error);
      reject(error);
    }
  });
};
module.exports.getTopicReplyCount = async function(articles) { // 傳入array aid
  return new Promise(async function(resolve, reject) {
    try {
      // SQL原意：SELECT aid, COUNT(*) FROM topic__replies WHERE aid = 116 OR aid = 117 GROUP BY aid;
      const result = db.sequelize.models.topic__reply.findAll({
        attributes: [
          'article_id',
          [db.sequelize.fn('COUNT', db.sequelize.col('article_id')), 'count']
        ],
        where: {
          article_id: {
            [Op.or]: articles
          }
        },
        group: 'article_id',
        raw: true
      });
      resolve(result);
    } catch (error) {
      log.data(error);
      reject(error);
    }
  });
};
module.exports.getTopicLikeCount = async function(articles) { // 傳入array aid
  return new Promise(async function(resolve, reject) {
    try {
      // SQL原意：SELECT article_id, COUNT(*) FROM topic__likes WHERE article_id = 116 OR article_id = 117 GROUP BY article_id;
      const result = db.sequelize.models.topic__like.findAll({
        attributes: [
          'article_id',
          [db.sequelize.fn('COUNT', db.sequelize.col('article_id')), 'count']
        ],
        where: {
          article_id: {
            [Op.or]: articles
          }
        },
        group: 'article_id',
        raw: true
      });
      resolve(result);
    } catch (error) {
      log.data(error);
      reject(error);
    }
  });
};
