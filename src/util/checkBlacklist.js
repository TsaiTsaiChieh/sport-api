const { findUser } = require('./databaseEngine');
const { ROLE } = require('./rolesUtil');
const AppErrors = require('./AppErrors');
const { FORBIDDEN } = require('http-status');

// 禁言
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
    return next();
  } catch (err) {
    return res.status(FORBIDDEN).json(err);
  }
}

async function checkFreeze(status) {
  if (status <= ROLE.FREEZE) return Promise.reject(new AppErrors.UserHadBeenFreezed());
  return Promise.resolve();
}

// 禁止預測
// 由於禁止預測屬情節重大，被被禁止預測後 user 狀態會優先先被改為 -1
async function checkBanned(req, res, next) {
  try {
    const { uid } = req.token;
    const userData = await findUser(uid);
    await checkFreeze(userData.status);
    return next();
  } catch (err) {
    return res.status(FORBIDDEN).json(err);
  }
}

// 水桶
async function checkBucketed(req, res, next) {
  try {
    const now = new Date();
    const { uid } = req.token;
    const userData = await findUser(uid);
    await checkFreeze(userData.status);

    if (userData.bucketed_time) {
      const blockTime = new Date(userData.bucketed_time).getTime();
      if (now <= blockTime) {
      // Just try to be the same as the structure in createMessage model
        const error = new AppErrors.UserHadBeenBucketed();
        return res.status(FORBIDDEN).json({ error: error.name, devcode: error.status, message: blockTime });
      }
    }
    req.userData = userData;
    return next();
  } catch (err) {
    return res.status(FORBIDDEN).json(err);
  }
}

module.exports = {
  checkMuted,
  checkBanned,
  checkBucketed
};
