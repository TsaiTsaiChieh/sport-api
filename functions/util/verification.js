/* eslint-disable consistent-return */
const modules = require('../util/modules');

async function admin(req, res, next) {
  try {
    const userSnapshot = await modules.getSnapshot('users', req.token.uid);
    const user = userSnapshot.data();
    if (user.status >= 9) {
      req.admin = true;
      req.adminUid = req.token.uid;
      return next();
    } else {
      res.status(401).json({ code: 401, error: 'Unauthorized admin' });
      return;
    }
  } catch (err) {
    res.status(401).json({ code: 401, error: 'Unauthorized admin' });
    return;
  }
}

async function confirmLogin(req, res, next) {
  try {
    const bearerHeader = req.headers['authorization'];

    if (bearerHeader) {
      const bearer = bearerHeader.split(' ');
      const bearerToken = bearer[1];
      decodedIdToken = await modules.firebaseAdmin
        .auth()
        .verifySessionCookie(bearerToken, true);
      req.token = await modules.firebaseAdmin
        .auth()
        .getUser(decodedIdToken.uid);
    } else {
      // do nothing
    }
  } catch (err) {
    console.error('Error in util/verification confirmLogin functions', err);
    return res.status(500).json({ code: 500, error: err });
  }
  return next();
}

async function token(req, res, next) {
  try {
    const bearerHeader = req.headers['authorization'];

    if (bearerHeader) {
      const bearer = bearerHeader.split(' ');
      const bearerToken = bearer[1];

      const decodedIdToken = await modules.firebaseAdmin
        .auth()
        .verifySessionCookie(bearerToken, true);
      req.token = await modules.firebaseAdmin
        .auth()
        .getUser(decodedIdToken.uid);
    } else {
      res.sendStatus(401);
    }
  } catch (err) {
    console.error('Error in util/verification token functions', err);
    res.sendStatus(401);
  }
  next();
}

module.exports = { token, admin, confirmLogin };
