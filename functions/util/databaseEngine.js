const modules = require('./modules');
const appError = require('./appErrors');

function findUser(uid) {
  return new Promise(async function(resolve, reject) {
    const userSnapshot = await modules.getSnapshot('users', uid);
    if (!userSnapshot.exists) return reject(new appError.UserNotFound());
    if (userSnapshot.exists) return resolve(userSnapshot.data());
  });
}

module.exports = {
  findUser
};
