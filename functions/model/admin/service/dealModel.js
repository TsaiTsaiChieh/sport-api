/* eslint-disable promise/always-return */
const db = require('../../../util/dbUtil');
function dbEdit(type, id, insertData) {
  return new Promise(async function(resolve, reject) {
    try {
      if (type === 'user') {
        const record = await db.sequelize.models.user.findOne({
          where: {
            uid: id
          }
        });
        record.update(insertData);
      } else if (type === 'blog') {
        await db.sequelize.models.user__blocklog.create(insertData);
      } else if (type === 'topic') {
        const record = await db.sequelize.models.topic__article.findOne({
          where: {
            uid: id
          }
        });
        record.update(insertData);
      } else if (type === 'reply') {
        const record = await db.sequelize.models.topic__reply.findOne({
          where: {
            uid: id
          }
        });
        record.update(insertData);
      } else if (type === 'report') {
        const record = await db.sequelize.models.service__reporttopic.findOne({
          where: {
            id: id
          }
        });
        record.update(insertData);
      }
      resolve();
    } catch (error) {
      console.error(error);
      reject('edit user failed');
    }
  });
}
function getUser(uid) {
  return new Promise(async function(resolve, reject) {
    try {
      const user = await db.sequelize.models.user.findOne({
        where: {
          uid: uid
        },
        raw: true
      });
      resolve(user);
    } catch (error) {
      console.error(error);
      reject('get user failed');
    }
  });
}
async function model(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const user = await getUser(args.uid);
      if (args.blobkuser) {
        let block_days = 0;
        if (user.block_count === 0) block_days = 1;
        else if (user.block_count === 1) block_days = 3;
        else if (user.block_count === 2) block_days = 7;
        else if (user.block_count >= 3) block_days = 9999;

        const d = new Date();
        let new_blockdate = d.setDate(d.getDate() + block_days);
        new_blockdate = new Date(new_blockdate).toISOString();
        const datenow = new Date().toISOString();

        const new_blockcount = user.block_count + 1;
        await dbEdit('user', args.uid, {
          block_count: new_blockcount,
          block_message: new_blockdate
        });
        await dbEdit('blog', args.uid, {
          uid: args.uid,
          newcount: new_blockcount,
          start: datenow,
          end: new_blockdate
        });
      }
      if (args.article_status) {
        if (args.type === 'topic') {
          await dbEdit('topic', args.article_id, {
            status: args.article_status
          });
        } else if (args.type === 'reply') {
          await dbEdit('reply', args.article_id, {
            status: args.article_status
          });
        }
      }
      if (args.article_status) {
        if (args.type === 'topic') {
          await dbEdit('topic', args.article_id, {
            delete_reason: args.reply
          });
        } else if (args.type === 'reply') {
          await dbEdit('reply', args.article_id, {
            delete_reason: args.reply
          });
        }
      }
      await dbEdit('report', args.report_id, {
        reply: args.reply
      });

      resolve({ code: 200 });
    } catch (err) {
      console.error(err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = model;
