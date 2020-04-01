const modules = require('./modules');
const AppError = require('./AppErrors');

function findUser(uid) {
  return new Promise(async function(resolve, reject) {
    try {
      const { customClaims } = await modules.firebaseAdmin.auth().getUser(uid);
      if (!customClaims.role) return reject(new AppError.UserNotFound());
      return resolve(customClaims);
    } catch (error) {
      return reject(new AppError.UserNotFound());
    }
  });
}

module.exports = {
  findUser
};
