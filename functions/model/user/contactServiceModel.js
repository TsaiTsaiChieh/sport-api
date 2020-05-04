/* eslint-disable promise/always-return */
const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
const sanitizeHtml = require('sanitize-html');
function dbCreate(insertData) {
  return new Promise(async function(resolve, reject) {
    try {
      // await db.sequelize.models.service__contact.sync({ alter: true }); //有新增欄位時才用
      await db.sequelize.models.service__contact.create(insertData);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}
async function contactService(args) {
  return new Promise(async function(resolve, reject) {
    try {
      let uid;
      if (typeof args.token !== 'undefined' && args.token !== null) {
        uid = args.token.uid;
      } else {
        uid = null;
      }

      const insertData = {
        uid: uid,
        name: args.name,
        email: args.email,
        content: args.content,
        images: JSON.stringify(args.images)
      };

      // 過濾html tags
      insertData.content = sanitizeHtml(args.content, {
        allowedTags: ['br', 'a'],
        allowedAttributes: {
          a: ['href']
        },
        allowedSchemes: ['http', 'https']
      });

      await dbCreate(insertData);
      resolve({ code: 200 });
    } catch (err) {
      console.error(err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = contactService;
