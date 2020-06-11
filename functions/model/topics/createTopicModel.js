const db = require('../../util/dbUtil');
const func = require('./topicFunctions');
const sanitizeHtml = require('sanitize-html');
function dbCreate(insertData) {
  return new Promise(async function(resolve, reject) {
    try {
      // console.log('create new article to db');
      const result = await db.sequelize.models.topic__article.create(insertData);
      // console.log('create article success');
      resolve(result.get('article_id'));
    } catch (error) {
      console.error(error);
      reject('create article failed');
    }
  });
}
async function createTopic(args) {
  return new Promise(async function(resolve, reject) {
    try {
      if (typeof args.token === 'undefined') {
        reject({ code: 403, error: 'token expired' });
        return;
      }
      if (!await func.chkUserBlocking(args.token.uid)) {
        reject({ code: 403, error: 'user is blocking' });
        return;
      }

      const insertData = {
        uid: args.token.uid,
        league: args.league,
        category: args.category,
        title: args.title
      };

      // 過濾html tags
      insertData.content = sanitizeHtml(args.content, {
        allowedTags: ['br', 'b', 'i', 'u', 'a', 'img', 'strike', 'div', 'span', 'font', 'ul', 'ol', 'li'],
        allowedAttributes: {
          div: ['style'],
          span: ['style'],
          strike: ['style'],
          b: ['style'],
          a: ['href'],
          img: ['src'],
          font: ['size', 'color']
        },
        allowedSchemes: ['http', 'https'],
        allowedSchemesAppliedToAttributes: ['href', 'src', 'style'],
        allowedStyles: {
          '*': {
            color: [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/],
            'text-align': [/^left$/, /^right$/, /^center$/],
            'font-size': [/^\d+(?:px|em|%)$/]
          }
        }
      });

      const article = await dbCreate(insertData);
      resolve({ code: 200, article_id: article });
    } catch (err) {
      console.error(err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = createTopic;
