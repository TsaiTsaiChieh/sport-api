const modules = require('../util/modules');
const db = require('../util/dbUtil');
const NORMAL_USER = 1;
const GOD_USER = 2;
const ADMIN_USER = 9;
const MANAGER_USER = 8;
const SERVICE_USER = 7;
const { UNAUTHORIZED, INTERNAL_SERVER_ERROR } = modules.httpStatus;

async function admin(req, res, next) {
  try {
    const result = await db.sequelize.models.user.findOne({
      where: {
        uid: req.token.uid
      },
      raw: true
    });
    if (result.status >= ADMIN_USER) {
      req.admin = true;
      req.adminUid = req.token.uid;
      return next();
    } else {
      return res.status(UNAUTHORIZED).json({ code: UNAUTHORIZED, error: 'Unauthorized admin' });
    }
  } catch (err) {
    res.status(INTERNAL_SERVER_ERROR).json({ code: INTERNAL_SERVER_ERROR, error: 'check admin error' });
  }
}

async function confirmLogin(req, res, next) {
  try {
    const bearerHeader = req.headers.authorization;

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
      // do nothing
    }
  } catch (err) {
    console.error('Error in util/verification confirmLogin functions', err);
    return res.status(UNAUTHORIZED).json({ code: UNAUTHORIZED, error: err });
  }
  return next();
}
async function confirmLogin_v2(req, res, next) { // 未登入不擋，登入則取得 token，mysql 版本
  try {
    const bearerHeader = req.headers.authorization;
    if (bearerHeader) {
      const bearer = bearerHeader.split(' ');
      const bearerToken = bearer[1];
      const decodedIdToken = await modules.firebaseAdmin
        .auth()
        .verifySessionCookie(bearerToken, true);
      req.token = decodedIdToken;
      req.token.customClaims = await getRoleAndTitles(decodedIdToken.uid);
    } else {
      // do nothing
    }
  } catch (err) {
    console.error('Error in util/verification confirmLogin_v2 functions', err);
    return res.status(UNAUTHORIZED).json({ code: UNAUTHORIZED, error: err });
  }
  return next();
}

async function token(req, res, next) {
  try {
    const bearerHeader = req.headers.authorization;

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
      return res.sendStatus(UNAUTHORIZED);
    }
  } catch (err) {
    console.error('Error in util/verification token functions', err);
    return res.sendStatus(UNAUTHORIZED);
  }
  next();
}

async function token_v2(req, res, next) {
  try {
    const bearerHeader = req.headers.authorization;
    if (!bearerHeader) res.sendStatus(UNAUTHORIZED);
    if (bearerHeader) {
      const bearer = bearerHeader.split(' ');
      const bearerToken = bearer[1];
      const decodedIdToken = await modules.firebaseAdmin
        .auth()
        .verifySessionCookie(bearerToken, true);
      req.token = decodedIdToken;
      req.token.customClaims = await getRoleAndTitles(decodedIdToken.uid);
    }
  } catch (err) {
    console.error('Error in util/verification token_v2 functions', err);
    return res.sendStatus(UNAUTHORIZED);
  }
  return next();
}

async function getToken(req, res, next) { // 只取得 token 未登入不擋，舊版本 (純 firebase 版本)
  try {
    const bearerHeader = req.headers.authorization;

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
      req.token = null;
    }
  } catch (err) {
    console.error('Error in util/verification token functions', err);
    req.token = null;
    // res.sendStatus(401);
  }
  next();
}

async function getRoleAndTitles(uid) {
  const userResults = await db.User.findOne({
    where: { uid },
    attributes: ['status']
  });
  switch (userResults.status) {
    case NORMAL_USER:
      return { role: NORMAL_USER, titles: [] };
    case GOD_USER:
    {
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
    case SERVICE_USER:
      return { role: SERVICE_USER, titles: ['客服人員'] };
    case MANAGER_USER:
      return { role: MANAGER_USER, titles: ['客服主管'] };
    case ADMIN_USER:
      return { role: ADMIN_USER, titles: ['Admin'] };
    default:
      return { role: NORMAL_USER, titles: [] };
  }
}

module.exports = { token, token_v2, getToken, admin, confirmLogin, confirmLogin_v2 };
