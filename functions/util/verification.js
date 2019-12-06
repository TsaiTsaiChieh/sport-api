const modules = require('../util/modules');

async function token(req, res, next) {
  const session = req.cookies.__session;
  try {
    const decodedIdToken = await modules.firebaseAdmin
      .auth()
      .verifySessionCookie(session, true);
    // 之後要設定過期時間，重新給 token
    // decodedIdToken = {
    //   iss: 'https://session.firebase.google.com/sport19y0715',
    //   aud: 'sport19y0715',
    //   auth_time: 1574923068,
    //   user_id: 'zmPF5Aht60Y6GdBbGnrOSlWcgV53',
    //   sub: 'zmPF5Aht60Y6GdBbGnrOSlWcgV53',
    //   iat: 1575361737,
    //   exp: 1575966537,
    //   phone_number: '+886963999999',
    //   firebase: { identities: { phone: [Array] }, sign_in_provider: 'phone' },
    //   uid: 'zmPF5Aht60Y6GdBbGnrOSlWcgV53'
    // };
    req.token = decodedIdToken;
  } catch (err) {
    res.status(401).send('Unauthorized request');
    return;
  }
  next();
}

module.exports = { token };
