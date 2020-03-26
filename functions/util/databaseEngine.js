const modules = require('./modules');

function findUser(uid) {
  return new Promise(async function(resolve, reject) {
    const userSnapshot = await modules.getSnapshot('userss', uid);
    if (!userSnapshot.exists)
      return reject({
        code: 404,
        error: { devcode: 1305, msg: 'user status abnormal' }
      });
    if (userSnapshot.exists) return resolve(userSnapshot.data());
  });
}

module.exports = {
  findUser
};
