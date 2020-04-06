/* eslint-disable consistent-return */
const modules = require('../util/modules');

// async function token(req, res, next) {
//   const session = req.cookies.__session;
//   try {
//     const decodedIdToken = await modules.firebaseAdmin
//       .auth()
//       .verifySessionCookie(session, true);
//     // decodedIdToken = {
//     //   iss: 'https://session.firebase.google.com/sport19y0715',
//     //   aud: 'sport19y0715',
//     //   auth_time: 1574923068,
//     //   user_id: 'zmPF5Aht60Y6GdBbGnrOSlWcgV53',
//     //   sub: 'zmPF5Aht60Y6GdBbGnrOSlWcgV53',
//     //   iat: 1575361737,
//     //   exp: 1575966537,
//     //   phone_number: '+886963999999',
//     //   firebase: { identities: { phone: [Array] }, sign_in_provider: 'phone' },
//     //   uid: 'zmPF5Aht60Y6GdBbGnrOSlWcgV53'
//     // };
//     req.token = decodedIdToken;
//   } catch (err) {
//     console.error('Error in util/verification token functions', err);
//     res.status(401).json({ code: 401, error: 'Unauthorized' });
//     return;
//   }
//   next();
// }

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

// async function confirmLogin(req, res, next) {
//   const session = req.cookies.__session;
//   try {
//     if (session) {
//       const decodedIdToken = await modules.firebaseAdmin
//         .auth()
//         .verifySessionCookie(session, true);
//       req.token = decodedIdToken;
//     }
//     if (!session) {
//       // do nothing and next
//     }
//   } catch (err) {
//     console.error('Error in util/verification confirmLogin functions', err);
//     return res.status(500).json({ code: 500, error: err });
//   }
//   return next();
// }
async function confirmLogin(req, res, next) {
  try {
    const bearerHeader = req.headers['authorization'];

    if (bearerHeader) {
      const bearer = bearerHeader.split(' ');
      const bearerToken = bearer[1];
      req.token = await modules.firebaseAdmin
          .auth()
          .verifySessionCookie(bearerToken, true);
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
      req.token = await modules.firebaseAdmin
          .auth()
          .verifySessionCookie(bearerToken, true);
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
