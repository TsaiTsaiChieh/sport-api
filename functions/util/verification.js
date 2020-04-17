/* eslint-disable consistent-return */
const modules = require('../util/modules');
const db = require('../util/dbUtil');
const NORMAL_USER = 1;
const GOD_USER = 2;
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
async function confirmLogin_v2(req, res, next) {
  try {
    const bearerHeader = req.headers['authorization'];
    if (bearerHeader) {
      const bearer = bearerHeader.split(' ');
      const bearerToken = bearer[1];
      decodedIdToken = await modules.firebaseAdmin
        .auth()
        .verifySessionCookie(bearerToken, true);
      req.token = decodedIdToken;
      req.token.customClaims = getRoleAndTitles(decodedIdToken.uid);
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

async function token_v2(req, res, next) {
  try {
    const bearerHeader = req.headers.authorization;
    if (!bearerHeader) res.sendStatus(401);
    if (bearerHeader) {
      const bearer = bearerHeader.split(' ');
      const bearerToken = bearer[1];
      const decodedIdToken = await modules.firebaseAdmin
        .auth()
        .verifySessionCookie(bearerToken, true);
      req.token = decodedIdToken;
      req.token.customClaims = getRoleAndTitles(decodedIdToken.uid);
    }
  } catch (err) {
    console.error('Error in util/verification token_v2 functions', err);
    res.sendStatus(401);
  }
  return next();
}

async function getRoleAndTitles(uid) {
  const userResults = await db.User.findOne({
    where: { uid },
    attributes: ['status']
  });
  if (userResults.status === NORMAL_USER) {
    // req.token.customClaims = { role: NORMAL_USER, titles: [] };
    return { role: NORMAL_USER, titles: [] };
  } else if (userResults.status === GOD_USER) {
    const titlesResult = await db.Title.findAll({
      where: {
        uid,
        period: modules.getTitlesPeriod(new Date()).period
      },
      attributes: ['league_id']
    });
    const titles = [];
    for (let i = 0; i < titlesResult.length; i++) {
      titles.push(modules.leagueDecoder(titlesResult[i].league_id));
    }
    // req.token.customClaims = { role: GOD_USER, titles };
    return { role: GOD_USER, titles };
  }
}
module.exports = { token, token_v2, admin, confirmLogin, confirmLogin_v2 };
