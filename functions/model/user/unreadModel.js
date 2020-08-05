const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');
async function unreadModel(req) {
  return new Promise(async function(resolve, reject) {
    try {
      const method = req.method;
      const uid = req.token.uid;
      if (method === 'POST') {
        /* 讀取使用者未讀訊息 */
        const unread_count = await db.User.findOne({
          attributes: [
            'unread_count'
          ],
          where: {
            uid: uid
          }
        });
        return resolve(unread_count);
      } else if (method === 'PUT') {
        /* 使用者未讀訊息更新為已讀(數量更新為0) */
        const unread_clean = await db.User.update(
          { unread_count: 0 },
          { where: { uid: uid } }
        );
        return resolve(unread_clean);
      }
    } catch (err) {
      console.log('Error in user/unread by henry:  %o', err);
      return reject(errs.errsMsg('500', '500', err.message));
    }
  });
}

module.exports = unreadModel;
