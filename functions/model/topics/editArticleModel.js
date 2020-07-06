const db = require('../../util/dbUtil');
const sanitizeHtml = require('sanitize-html');
function dbFind(aid) {
  return new Promise(async function(resolve, reject) {
    try {
      const result = await db.sequelize.models.topic__article.findAll({
        where: {
          status: 1,
          article_id: aid
        },
        raw: true
      });
      resolve(result);
    } catch (error) {
      console.error(error);
      reject('get topic failed');
    }
  });
}
function dbEdit(aid, insertData) {
  return new Promise(async function(resolve, reject) {
    try {
      // console.log('edit article');
      const record = await db.sequelize.models.topic__article.findOne({
        where: {
          article_id: aid
        }
      });
      record.update(insertData);
      resolve();
    } catch (error) {
      console.error(error);
      reject('edit article failed');
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

      // 撈原文
      let orig_article;
      try {
        const article = await dbFind(args.article_id);
        if (!article[0]) {
          reject({ code: 404, error: 'article not found' });
          return;
        }
        orig_article = article[0]; // 原文
        if (orig_article.status !== 1 && orig_article.status !== 3) {
          reject({ code: 404, error: 'topic not found' });
          return;
        }
      } catch (err) {
        console.error(err);
        reject({ code: 500, error: err });
        return;
      }

      if (args.token.uid !== orig_article.uid) {
        reject({ code: 403, error: 'not your article' });
        return;
      }
      // console.log(orig_article);
      const insertData = {
        league: args.league,
        category: args.category,
        title: args.title
      };

      if (args.imgurl) insertData.imgurl = args.imgurl;

      // 過濾html tags
      insertData.content = sanitizeHtml(args.content, {
        allowedTags: ['br', 'b', 'i', 'u', 'a', 'img', 'strike', 'div', 'span', 'font', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
        allowedAttributes: {
          div: ['style'],
          span: ['style'],
          strike: ['style'],
          b: ['style'],
          a: ['href'],
          img: ['src', 'alt'],
          font: ['size', 'color'] // h1~h6
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

      await dbEdit(args.article_id, insertData);
      resolve({ code: 200 });
    } catch (err) {
      console.error(err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = createTopic;
