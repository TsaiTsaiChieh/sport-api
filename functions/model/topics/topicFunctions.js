/* eslint-disable promise/always-return */
const modules = require('../../util/modules');
const db = require('../../util/dbUtil_ifyu');
const log = require('../../util/loggingUtil');

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
module.exports.getTopicReplyCount = async function (aid) {
  return new Promise(async function (resolve, reject) {
    try {
      log.info('function: get topic reply count by aid: '+aid);
      const result = await db.sequelize.models.topic__reply.count({
        where: {
          aid: aid
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
