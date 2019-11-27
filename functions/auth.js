// @ts-nocheck
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
const functions = require('firebase-functions');
const ShortcutFunction = require('./shortcut_function');
const envValues = require('././env_values');
const cookie = require('cookie');
const rp = require('request-promise');
const jwt = require('jsonwebtoken');
const secure_compare = require('secure-compare');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
const express = require('express');
const { google } = require('googleapis');
const admin = ShortcutFunction.lazyFirebaseAdmin(envValues.cert);

const firebase = require('firebase');

firebase.initializeApp(envValues.firebaseConfig);

const app = express();
app.use(express.json());

const session = require('express-session');
const session_options_line = {
  secret: envValues.lineConfig.channelSecret,
  resave: false,
  saveUninitialized: false
};
const line_login = require('line-login');
app.use(session(session_options_line));

const lineLogin = new line_login({
  channel_id: envValues.lineConfig.channelID,
  channel_secret: envValues.lineConfig.channelSecret,
  callback_url: envValues.lineConfig.callbackURL,
  scope: 'openid profile email',
  prompt: 'consent',
  bot_prompt: 'normal'
});

app.use('/line_login', lineLogin.auth());
// app.disable("x-powered-by");
app.all('/api', (req, res) => {
  console.log('api....');
  res.json({
    message: 'Hello API2'
  });
  // return res.status(200);
  res.status(200).send('hello');
});

// http://localhost:5000/rextest-ded68/us-central1/api/auth/emailRegister
// application/json
// {
//     "registerEmail": "rex7@gets-info.com",
//     "emailVerified": true,
//     "registerPassword": "111111",
//     "confirmPassword": "111111",
//     "returnSecureToken": true
// }
//信箱註冊
// /auth/emailRegister
app.post('/emailRegister', (req, res) => {
  if (req.method === 'POST') {
    const registerEmail = req.body.registerEmail;
    const registerPassword = req.body.registerPassword;
    const confirmPassword = req.body.confirmPassword;
    // var displayName = req.body.displayName;

    if (!registerEmail)
      return res.status(400).json({
        success: false,
        message: 'missing email'
      });
    if (!registerPassword)
      return res.status(400).json({
        success: false,
        message: 'missing password'
      });
    if (!confirmPassword)
      return res.status(400).json({
        success: false,
        message: 'missing confirm password'
      });
    if (registerPassword !== confirmPassword)
      return res.status(400).json({
        success: false,
        message: 'password confirm failed'
      });

    //參考https://firebase.google.com/docs/auth/admin/manage-users?authuser=0#create_a_user
    admin
      .auth()
      .createUser({
        email: registerEmail,
        password: registerPassword
        // displayName:displayName
      })
      .then(userRecord => {
        // See the UserRecord reference doc for the contents of userRecord.
        // var uid = userRecord.uid;
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.json({
          success: true,
          message: userRecord
        });
        console.log('Successfully created new user:', userRecord.uid);
      })
      .catch(error => {
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.json({
          success: false,
          message: error
        });
        console.log('Error creating new user:', error);
      });
  } else {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.json({
      success: false,
      message: '無效的請求'
    });
    console.log('Error creating new user : Invalid req');
  }
});

app.post('/email', (req, res) => {
  const loginEmail = req.body.loginEmail;
  const loginPassword = req.body.loginPassword;

  if (!loginEmail)
    return res.status(400).json({
      success: false,
      message: 'missing email'
    });
  if (!loginPassword)
    return res.status(400).json({
      success: false,
      message: 'missing password'
    });
  firebase
    .auth()
    .signInWithEmailAndPassword(loginEmail, loginPassword)
    .then(user => {
      user.user
        .getIdToken()
        .then(idToken => {
          const expiresIn = 60 * 60 * 24 * 7 * 1000;
          admin
            .auth()
            .createSessionCookie(idToken, {
              expiresIn
            })
            .then(sessionCookie => {
              const options = {
                maxAge: expiresIn,
                httpOnly: true,
                secure: true
              };
              res.cookie('__session', sessionCookie, options);
              res.json({
                success: true,
                message: '登入成功'
              });
              console.log('Successfully login user : ', user.user.uid);
            })
            .catch(error => {
              res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
              res.json({
                success: false,
                message: 'createSessionCookie'
              });
              console.log('Error login user : createSessionCookie\n\t', error);
            });
        })
        .catch(error => {
          res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.json({
            success: false,
            message: 'idToken'
          });
          console.log('Error login user: idToken\n\t', error);
        });
    })
    .catch(error => {
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.json({
        success: false,
        error: error
      });
      console.log('Error login user: ', error);
    });
});

app.post('/phoneRegister', (req, res) => {
  const registerPhone = req.body.registerPhone;
  const registerPassword = req.body.registerPassword;
  const confirmPassword = req.body.confirmPassword;
  console.log(registerPhone);

  if (!registerPhone)
    return res.status(400).json({
      success: false,
      message: 'missing phone number'
    });
  if (!registerPassword)
    return res.status(400).json({
      success: false,
      message: 'missing password'
    });
  if (!confirmPassword)
    return res.status(400).json({
      success: false,
      message: 'missing confirm password'
    });
  if (registerPassword !== confirmPassword)
    return res.status(400).json({
      success: false,
      message: 'password confirm failed'
    });
  //參考https://firebase.google.com/docs/auth/admin/manage-users?authuser=0#create_a_user
  admin
    .auth()
    .createUser({
      phoneNumber: registerPhone
    })
    .then(userRecord => {
      // See the UserRecord reference doc for the contents of userRecord.
      const uid = userRecord.uid;
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.json({
        success: true,
        message: userRecord
      });
      console.log('Successfully created new user:', uid);
    })
    .catch(error => {
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.json({
        success: false,
        message: error
      });
      console.log('Error creating new user:', error);
    });
});

// https://stackoverflow.com/questions/46893766/firebase-auth-signinwithphonenumber-express-on-node-js
app.post('/phoneToken', (req, res) => {
  firebase.auth().settings.appVerificationDisabledForTesting = false;

  const loginPhone = req.body.loginPhone;
  const testVerificationCode = '123456';
  // const loginPassword = req.body.loginPassword;

  if (!loginPhone)
    return res.status(400).json({
      success: false,
      message: 'missing phone number'
    });
  // if (!loginPassword) return res.status(400).json({
  //     success: false,
  //     message: 'missing password'
  // });
  const appVerifier = new firebase.auth.RecaptchaVerifier(
    'recaptcha-container'
  );
  firebase
    .auth()
    .signInWithPhoneNumber(loginPhone, appVerifier)
    .then(user => {
      user.user
        .getIdToken()
        .then(idToken => {
          const expiresIn = 60 * 60 * 24 * 7 * 1000;
          admin
            .auth()
            .createSessionCookie(idToken, {
              expiresIn
            })
            .then(sessionCookie => {
              const options = {
                maxAge: expiresIn,
                httpOnly: true,
                secure: true
              };
              res.cookie('__session', sessionCookie, options);
              res.json({
                success: true,
                message: '登入成功',
                stats: 1
              });
              console.log('Successfully login user : ', user.user.uid);
            })
            .catch(error => {
              res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
              res.json({
                success: false,
                message: 'createSessionCookie'
              });
              console.log('Error login user : createSessionCookie\n\t', error);
            });
        })
        .catch(error => {
          res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.json({
            success: false,
            message: 'idToken'
          });
          console.log('Error login user: idToken\n\t', error);
        });
    })
    .catch(error => {
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.json({
        success: false,
        error: error
      });
      console.log('Error login user: ', error);
    });
});
app.post('/phone', (req, res) => {
  let token = req.body.token;
  if (!token)
    return res.status(400).json({
      error: 'missing email'
    });
  // console.log(token);

  const expiresIn = 60 * 60 * 24 * 7 * 1000;
  admin
    .auth()
    .createSessionCookie(token, {
      expiresIn
    })
    .then(sessionCookie => {
      let options = {
        maxAge: expiresIn,
        httpOnly: true,
        secure: true
      };
      res.cookie('__session', sessionCookie, options);
      res.json({
        success: true,
        message: '登入成功'
      });
    })
    .catch(error => {
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.json({
        success: false,
        error: error,
        a: 'createSessionCookie'
      });
    });
});

app.post('/sendSMS', (req, res) => {
  const { phoneNumber, recaptchaToken } = req.body;
  console.log(phoneNumber, recaptchaToken);
  const identityToolkit = google.identitytoolkit({
    auth: 'AIzaSyB31V6WewUi-iY12231Ixahquf68uGaoCo',
    version: 'v3'
  });
  const response = identityToolkit.relyingparty.sendVerificationCode({
    phoneNumber,
    recaptchaToken: recaptchaToken
    // recaptchaToken: recaptcha,
  });

  // save sessionInfo into db. You will need this to verify the SMS code
  // const sessionInfo = response.data.sessionInfo;
  console.log(response);
  res.json({ test: 'test' });
});

app.post('/login', (req, res) => {
  let returnJson = { success: false };
  let token = req.body.token;
  let uid = req.body.uid;
  //   res.setHeader('Access-Control-Allow-Origin', '*');
  if (!token) {
    console.log('Error login user: missing token');
    return res.status(400).json(returnJson);
  }
  let expiresIn = 60 * 60 * 24 * 7 * 1000;
  admin
    .auth()
    .createSessionCookie(token, { expiresIn })
    .then(async sessionCookie => {
      let firestoreUser = await getUserProfile(uid);

      returnJson.success = true;
      if (firestoreUser) {
        console.log('firestoreUser exist');
        returnJson.uid = firestoreUser.uid;
        returnJson.userStats = firestoreUser.userStats;
        returnJson.userInfo = firestoreUser.data;
      }
      let options = { maxAge: expiresIn, httpOnly: true };
      //   let options = { maxAge: expiresIn, httpOnly: true, secure: true };
      res.cookie('__session', sessionCookie, options);
      res.json(returnJson);
    })
    .catch(error => {
      console.log('Error login user: \n\t', error);
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.json({ success: false });
    });
});

app.post('/logout', (req, res) => {
  let cookies = req.get('cookie') || '__session=';
  if (cookies) {
    firebase
      .auth()
      .signOut()
      .then(() => {
        console.log('logout out user');
        res.clearCookie('__session');
        // res.setHeader('Access-Control-Allow-Origin', '*');
        res.json({ success: true });
      })
      .catch(error => {
        // An error happened.
      });
  }
});

app.get('/signIn', (req, res) => {
  firebase
    .auth()
    .signInWithPopup(provider)
    .then(result => {
      console.log(result.additionalUserInfo.isNewUser);
    });
});

app.get('/verifySessionCookie', async (req, res) => {
  let cookies = req.get('cookie') || '__session=';
  res.setHeader('Access-Control-Allow-Origin', '*');
  let sessionCookie = cookie.parse(cookies).__session;
  if (sessionCookie) {
    console.log('verifySessionCookie - ', sessionCookie);
    // let isVerified = verifySessionCookie(sessionCookie);
    if (verifySessionCookie(sessionCookie)) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } else {
    console.log('Auth - verifySessionCookie success : cookie missing');
    res.json({ success: false });
  }
});

const verifySessionCookie = async sessionCookie => {
  await admin
    .auth()
    .verifySessionCookie(sessionCookie, true)
    .then(decodedClaims => {
      console.log('Auth - verifySessionCookie success : ', decodedClaims);
      return true;
    })
    .catch(error => {
      console.log('Auth - verifySessionCookie false : ', error);
      return false;
    });
};

// Generate a Request option to access LINE APIs
function generateLineApiRequest(apiEndpoint, lineAccessToken) {
  return {
    url: apiEndpoint,
    headers: { Authorization: `Bearer ${lineAccessToken}` },
    json: true
  };
}

app.post('/getUserInfo', async (req, res) => {
  let returnJson = {
    success: false,
    uid: req.body.userId
  };
  try {
    // let userIdStr = userId.toString().trim();
    let userIdStr = req.body.userId;
    console.log('get firestore user : ', userIdStr);

    if (userIdStr.length < 1) {
      console.warn('firebaseGetUserData no userId : ', userId);
      // returnJson.userStats = 0;
      returnJson.uid = userId;
      returnJson.success = false;
      res.json(returnJson);
    }

    let firestore = ShortcutFunction.lazyFirebaseAdmin().firestore();
    let doc = await firestore
      .collection('users')
      .doc(userIdStr)
      .get();
    if (!doc.exists) {
      console.log('No such document!');
      returnJson.userStats = 0;
      returnJson.success = true;
    } else {
      returnJson.data = doc.data();
      returnJson.userStats = doc.data().userStats;
      returnJson.success = true;
      let create = doc.createTime;
      console.log('createTime...:', JSON.stringify(create, null, '\t'));
      console.log('createTime...:', create.seconds);
      console.log('createTime...:', create.nanoseconds);
      let update = doc.updateTime;
      console.log('updateTime...:', JSON.stringify(update, null, '\t'));
      console.log('updateTime...:', update.seconds);
      console.log('updateTime...:', update.nanoseconds);
      console.log('id...:', doc.ref);
      console.log('id...2:', doc.ref._path.segments);
      console.log('id...3:', doc.id);
      console.log(`Retrieved data: ${JSON.stringify(doc, null, '\t')}`);
    }
    console.log(
      'getFirestoreUser : ',
      userIdStr,
      '\n',
      JSON.stringify(returnJson, null, '\t')
    );
    res.json(returnJson);
  } catch (error) {
    console.warn('firebaseGetUserData', error);
    res.json({ success: false });
  }
});

//Line Login v2.1 https://github.com/jirawatee/LINE-Login-x-Firebase-Android/blob/master/functions/index.js

// function generateFirebaseToken(lineMid) {
//     var firebaseUid = 'line:' + lineMid;
//     var additionalClaims = {
//         provider: 'LINE'
//     };
//     return firebase.auth().createCustomToken(firebaseUid);
// }

// app.get('/sendWelcomeMail')

// const userCreated = functions.auth.user()
//     .onCreate((event) => {
//         console.log('新增使用者');
//
//         const user = event.data;
//
//         return user;
//     });
// app.listen(5000,()=> console.log('Server started on port 5000'));

// module.exports = functions.https.onRequest(app);

async function getUserProfile(userId) {
  let returnJson = {
    success: false,
    uid: userId
  };
  try {
    // let userIdStr = userId.toString().trim();
    let userIdStr = userId;
    console.log('get firestore user : ', userIdStr);

    if (userIdStr.length < 1) {
      console.warn('firebaseGetUserData no userId : ', userId);
      // returnJson.userStats = 0;
      returnJson.uid = userId;
      returnJson.success = false;
      return returnJson;
    }

    let firestore = ShortcutFunction.lazyFirebaseAdmin().firestore();
    let doc = await firestore
      .collection('users')
      .doc(userIdStr)
      .get();
    if (!doc.exists) {
      console.log('No such document!');
      returnJson.userStats = 0;
      returnJson.success = true;
    } else {
      returnJson.data = doc.data();
      returnJson.userStats = doc.data().userStats;
      returnJson.success = true;
      console.log('createTime...:', doc.createTime);
      console.log(`Retrieved data: ${JSON.stringify(doc)}`);
    }
    console.log(
      'getFirestoreUser : ',
      userIdStr,
      '\n',
      JSON.stringify(returnJson, null, '\t')
    );
    return await returnJson;
  } catch (error) {
    console.warn('firebaseGetUserData', error);
    returnJson.success = false;
  }
}

app.post('/modifyUserProfile', async (req, res) => {
  try {
    let cookies = req.get('cookie') || '__session=';
    // if (true) { //開發中暫停驗證sessionCookie
    let sessionCookie = cookie.parse(cookies).__session;
    if (verifySessionCookie(sessionCookie)) {
      let uid = req.body.uid;
      if (!uid)
        res.status(400).json({ success: false, message: 'missing uid' });
      let firestoreUser = await getUserProfile(uid);
      let data = {};
      console.log(firestoreUser.userStats);
      switch (firestoreUser.userStats) {
        case 0: //新會員
          if (
            !req.body.displayName ||
            !req.body.name ||
            !req.body.phone ||
            !req.body.email ||
            !req.body.birthday
          )
            res.status(400).json({ success: false, message: 'missing info' });
          data.displayName = req.body.displayName; //only new user can set displayName, none changeable value
          data.name = req.body.name; //only new user can set name(real name), none changeable value
          data.phone = req.body.phone;
          data.email = req.body.email;
          data.birthday = admin.firestore.Timestamp.fromDate(
            new Date(req.body.birthday)
          ); //only new user can set birthday, none changeable value
          if (!req.body.avatar)
            data.avatar = 'https://this.is.defaultAvatar.jpg';
          data.userStats = 1;
          data.signature = '';
          data.blockMessage = 0;
          data.denys = [];
          data.coin = 0; //搞幣
          data.dividend = 0; //搞紅利
          data.ingot = 0; //搞錠
          break;
        case 1: //一般會員
          break;
        case 2: //大神
          break;
        case 3: //鎖帳號會員
          res.status(400).json({ success: false, message: 'blocked user' });
          break;
        case 9: //管理員
          break;
        default:
          throw 'LINE channel ID mismatched';
      }
      if (req.body.avatar) data.avatar = await uploadAvatar(req.body.avatar);
      if (req.body.email) data.email = req.body.email;
      if (req.body.phone) data.phone = req.body.phone;
      if (req.body.signature) data.signature = req.body.signature;
      res.setHeader('Access-Control-Allow-Origin', '*');

      let firestore = ShortcutFunction.lazyFirebaseAdmin().firestore();
      firestore
        .collection('users')
        .doc(uid)
        .set(data, { merge: true })
        .then(ref => {
          console.log('Added document with ID: ', ref);
          res.json({ success: true, result: ref });
        })
        .catch(e => {
          console.log('Added document with error: ', e);
          res.json({ success: false, message: 'update failed' });
        });
      // res.json({success: true, result: writeResult});
    } else {
      res.json({ success: false, message: 'not login' });
    }
  } catch (e) {
    console.log('Added document with error: ', e);
    res.json({ success: false, message: 'profile faild' });
  }
});

async function uploadAvatar() {
  console.log('compress avatar to 100*100?');
  return 'https://uploaded.firestorage.avatar.jpg';
}

function getFirebaseUser(accessToken) {
  // const firebaseUid = `line:${body.id}`;
  const firebaseUid = accessToken.id_token.sub;

  return admin
    .auth()
    .getUser(firebaseUid)
    .then(userRecord => {
      return userRecord;
    })
    .catch(error => {
      if (error.code === 'auth/user-not-found') {
        return admin.auth().createUser({
          identifier: 'Line',
          uid: firebaseUid,
          displayName: accessToken.id_token.name,
          photoURL: accessToken.id_token.picture,
          email: accessToken.id_token.email
        });
      }
      return Promise.reject(error);
    });
}

app.get('/lineLoginHandler', (req, res) => {
  const lineAccessToken = req.query.code;
  // const lineState = req.query.state;

  // https://api.line.me/oauth2/v2.1/token
  lineLogin.issue_access_token(lineAccessToken).then(token_response => {
    let decoded_id_token;
    try {
      decoded_id_token = jwt.verify(
        token_response.id_token,
        envValues.lineConfig.channelSecret,
        {
          audience: envValues.lineConfig.channelID,
          issuer: 'https://access.line.me',
          algorithms: ['HS256']
        }
      );
      console.log('id token verification succeeded.');
      console.log('test state', JSON.stringify(token_response));
      token_response.id_token = decoded_id_token;

      // if (!secure_compare(decoded_id_token.nonce, req.session.line_login_nonce)) {
      //     res.status(500).send({error: 'login failed! nonce error'});
      // }

      lineLogin
        .verify_access_token(token_response.access_token)
        .then(verify_response => {
          if (verify_response.client_id !== envValues.lineConfig.channelID) {
            return Promise.reject(new Error('Line channel ID mismatched'));
          }
          getFirebaseUser(token_response)
            .then(userRecord => {
              admin
                .auth()
                .createCustomToken(userRecord.uid)
                .then(token => {
                  const expiresIn = 60 * 5 * 1000;
                  const options = {
                    maxAge: expiresIn
                  };
                  res.cookie('auth_token', token, options);
                  res.redirect(
                    307,
                    'https://sport19y0715.web.app/line_login.html'
                  );
                });
            })
            .catch(err => {
              console.log('id token verification failed.', err);
              res.status(500).send({ error: 'login failed!' });
            });
        });
    } catch (exception) {
      console.log('id token verification failed.');
      res.status(500).send({ error: 'login failed!' });
    }
  });
});
module.exports = functions.https.onRequest(app);
