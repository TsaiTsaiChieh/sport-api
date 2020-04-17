/* eslint-disable promise/always-return */
const modules = require('../../util/modules');
const db = require('../../util/dbUtil_ifyu');
const log = require('../../util/loggingUtil');
const Op = require('Sequelize').Op;

module.exports.getUserInfo = async function (aid) {
  // return new Promise(async function (resolve, reject) {
  //   try {
  //     log.info('function: get topic info by aid:'+aid);
  //     const result = await db.sequelize.models.topic__article.findAll({
  //       where: {
  //         id: aid
  //       },
  //       raw: true
  //     })
  //     resolve(result)
  //   } catch (error) {
  //     log.data(error);
  //     reject(error);
  //   }
  // })
}
module.exports.getTopicInfo = async function (aid) {
  return new Promise(async function (resolve, reject) {
    try {
      log.info('function: get topic info by aid:'+aid);
      const result = await db.sequelize.models.topic__article.findAll({
        where: {
          id: aid
        },
        raw: true
      })
      resolve(result)
    } catch (error) {
      log.data(error);
      reject(error);
    }
  })
}
module.exports.getTopicReplyCount = async function (articles) {
  return new Promise(async function (resolve, reject) {
    try {
      // SQL原意：SELECT aid, COUNT(*) FROM topic__replies WHERE aid = 116 OR aid = 117 GROUP BY aid;
      const result = db.sequelize.models.topic__reply.findAll({
        attributes: [
          'aid',
          [db.sequelize.fn('COUNT', db.sequelize.col('aid')), 'count']
        ],
        where: {
          aid: {
            [Op.or]: articles
          },
        },
        group: 'aid',
        raw: true
      })
      resolve(result)
    } catch (error) {
      log.data(error);
      reject(error);
    }
  })
}
