const firebaseAdmin = require('../../util/firebaseUtil');
const firestore = firebaseAdmin().firestore();
const messageModule = require('../../util/messageModule');
const db = require('../../util/dbUtil');
async function getUserInfo(uid) {
  return new Promise(async function(resolve, reject) {
    try {
      const result = await db.sequelize.models.user.findOne({
        attributes: [
          'uid',
          'status'
        ],
        where: {
          uid: uid
        },
        raw: true
      });
      resolve(result);
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
};

function getMessageWithId(id) {
  return new Promise(async function(resolve, reject) {
    try {
      const messageSnapshot = await firestore.collection('messages').doc(id).get();
      const message = messageSnapshot.data();
      let body = {};
      if (message) {
        // const userSnapshot = await getSnapshot('users', message.uid);
        // const user = userSnapshot.data();
        const user = await getUserInfo(message.uid);
        if (user) {
          body = messageModule.repackageMessageDataWithFlag(message, user, 0);
        } else {
          reject({
            code: 400,
            error: 'This user did does not exist (輸入的使用者 uid 不存在)'
          });
        }
      } else {
        reject({
          code: 400,
          error: 'This message id does not exist (輸入的訊息 id 不存在)'
        });
      }
      resolve(body);
    } catch (err) {
      console.log(err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = getMessageWithId;
