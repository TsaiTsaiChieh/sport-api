const { findUser } = require('./databaseEngine');
const { ROLE } = require('./rolesUtil');
const AppErrors = require('./AppErrors');
const { FORBIDDEN } = require('http-status');

async function checkMuted(req, res, next) {
  try {
    const now = new Date();
    const { uid } = req.token;
    const userData = await findUser(uid);
    await checkFreeze(userData.status);

    if (userData.muted_time) {
      const blockTime = new Date(userData.muted_time).getTime();
      if (now <= blockTime) {
      // Just try to be the same as the structure in createMessage model
        const error = new AppErrors.UserHadBeenMuted();
        return res.status(FORBIDDEN).json({ error: error.name, devcode: error.status, message: blockTime });
      }
    }
    req.userData = userData;
    next();
  } catch (err) {
    return res.json(err);
  }
}

async function checkFreeze(status) {
  if (status <= ROLE.FREEZE) return Promise.reject(new AppErrors.UserHadBeenFreezed());
  return Promise.resolve();
}

module.exports = {
  checkMuted
};
