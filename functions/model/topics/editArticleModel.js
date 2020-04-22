/* eslint-disable promise/always-return */
const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
const log = require('../../util/loggingUtil');
const sanitizeHtml = require('sanitize-html');
function dbFind(aid) {
  return new Promise(async function (resolve, reject) {
    try {
      const result = await db.sequelize.models.topic__article.findAll({
        where: {
          'article_id': aid
        },
        raw: true
      })
      resolve(result)
    } catch (error) {
      log.data(error);
      reject('get topics failed');
      return;
    }
  })
}
function dbEdit(aid, insertData) {
  return new Promise(async function (resolve, reject) {
    try {
      log.info('edit article');
      const record = await db.sequelize.models.topic__article.findOne({
        where: {
          'article_id': aid
        }
      })
      record.update(insertData)
      resolve()
    } catch (error) {
      log.data(error);
      reject('edit article failed');
      return;
    }
  })
}
async function createTopic(args) {
  return new Promise(async function(resolve, reject) {
    try {
      if(typeof args.token === 'undefined'){
        reject({ code: 403, error: 'token expired' });
        return;
      }
      const userSnapshot = await modules.getSnapshot('users', args.token.uid);

      log.info('verify firebase user')
      if (!userSnapshot.exists) {
        reject({ code: 404, error: 'user not found' });
        return;
      }

      // 撈原文
      let orig_article;
      try {
        const article = await dbFind(args.aid)
        if(!article[0]){
          reject({ code: 404, error: 'article not found' });
          return;
        }
        orig_article = article[0]; // 原文
      } catch (err) {
        log.err(err);
        reject({ code: 500, error: err });
        return;
      }

      if(args.token.uid !== orig_article.uid){
        reject({ code: 403, error: 'not your article' });
        return;
      }
console.log(orig_article)
      const insertData = {
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
      
      const article = await dbEdit(args.aid, insertData)
      resolve({ code: 200 });
    } catch (err) {
      log.err(err);
      reject({ code: 500, error: err });
      return;
    }
  });
}
module.exports = createTopic;