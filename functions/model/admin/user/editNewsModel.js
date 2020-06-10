/* eslint-disable promise/always-return */
const db = require('../../../util/dbUtil');
const modules = require('../../../util/modules');
function dbNew(insertData) {
  return new Promise(async function(resolve, reject) {
    try {
      await db.sequelize.models.user__new.create(insertData);
      resolve();
    } catch (error) {
      console.error(error);
      reject('new news failed');
    }
  });
}
function dbDel(news_id) {
  return new Promise(async function(resolve, reject) {
    try {
      const record = await db.sequelize.models.user__new.findOne({
        where: {
          news_id: news_id
        }
      });
      record.update({ active: 0 });
      resolve();
    } catch (error) {
      console.error(error);
      reject('edit user failed');
    }
  });
}
function dbEdit(news_id, insertData) {
  return new Promise(async function(resolve, reject) {
    try {
      const record = await db.sequelize.models.user__new.findOne({
        where: {
          news_id: news_id
        }
      });
      record.update(insertData);
      resolve();
    } catch (error) {
      console.error(error);
      reject('edit user failed');
    }
  });
}
const now = modules.moment(new Date()).unix();
async function model(args) {
  return new Promise(async function(resolve, reject) {
    try {
      if (args.method === 'new') {
        dbNew({
          content: args.content,
          status: 1,
          active: 1,
          scheduled: now
        });
      }
      if (args.method === 'del') {
        dbDel(args.news_id);
      }
      if (args.method === 'edit') {
        dbEdit(args.news_id, {
          content: args.content,
          active: 1,
          scheduled: now
        });
      }
      resolve({ code: 200 });
    } catch (err) {
      console.error(err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = model;
