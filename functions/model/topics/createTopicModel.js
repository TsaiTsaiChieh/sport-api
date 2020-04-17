/* eslint-disable promise/always-return */
const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
const log = require('../../util/loggingUtil');
const sanitizeHtml = require('sanitize-html');
function dbCreate(insertData) {
  return new Promise(async function (resolve, reject) {
    try {
      log.info('create new article to db');
      // await db.sequelize.models.topic__article.sync({ alter: true }); //有新增欄位時才用
      const result = await db.sequelize.models.topic__article.create(insertData)
      log.succ('create article success');
      resolve(result.get('id'))
    } catch (error) {
      log.data(error);
      reject('create article failed');
      return;
    }
  })
}
async function createTopic(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const userSnapshot = await modules.getSnapshot('users', args.token.uid);

      log.info('verify firebase user')
      if (!userSnapshot.exists) {
        reject({ code: 404, error: 'user not found' });
        return;
      }

      const insertData = {
        uid: args.token.uid,
        type: args.type,
        category: args.category,
        title: args.title
      }

      // 過濾html tags
      insertData.content = sanitizeHtml(args.content, {
        allowedTags: [ 'br', 'b', 'i', 'u', 'a', 'img', 'strike', 'div', 'span', 'font', 'ul', 'ol', 'li' ],
        allowedAttributes: {
          'div': [ 'style' ],
          'span': [ 'style' ],
          'strike': [ 'style' ],
          'b': [ 'style' ],
          'a': [ 'href' ],
          'img': [ 'src' ],
          'font': [ 'size', 'color' ]
        },
        allowedSchemes: [ 'http', 'https' ],
        allowedSchemesAppliedToAttributes: [ 'href', 'src', 'style' ],
        allowedStyles: {
          '*': {
            'color': [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/],
            'text-align': [/^left$/, /^right$/, /^center$/],
            'font-size': [/^\d+(?:px|em|%)$/]
          }
        }
      });
      
      const article = await dbCreate(insertData)
      resolve({ code: 200, article_id: article });
    } catch (err) {
      log.err(err);
      reject({ code: 500, error: err });
      return;
    }
  });
}
module.exports = createTopic;