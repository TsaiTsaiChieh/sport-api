// // @ts-nocheck
// /* eslint-disable no-unused-vars */
// /* eslint-disable no-console */
// const functions = require('firebase-functions');
// const ShortcutFunction = require('../shortcut_function');
// const envValues = require('../Configs/env_values');
// const cookie = require('cookie');
// const rp = require('request-promise');
// const secure_compare = require("secure-compare");
// const cookieParser = require("cookie-parser");
//
// // // Create and Deploy Your First Cloud Functions
// // // https://firebase.google.com/docs/functions/write-firebase-functions
// const express = require("express");
// const {google} = require('googleapis');
// const admin = ShortcutFunction.lazyFirebaseAdmin(envValues.cert);
//
// const firebase = require('firebase');
//
// firebase.initializeApp(envValues.firebaseConfig);
//
// const app = express();
// app.use(express.json());
// app.use(cookieParser());
//
//
// app.all('/', (req, res) => {
//     res.json({auth: true})
// });
// // app.disable("x-powered-by");
// app.all('/api', (req, res) => {
//     console.log(JSON.stringify(req.cookies, null, '\t'));
//     let refCookies = req.get('cookie') || 'refCode=';
//     let refCode = cookie.parse(refCookies).refCode;
//     console.log(refCode);
//     console.log("api....");
//     const options = {
//         maxAge: 1000 * 2 * 60,
//         httpOnly: true
//     };
//     res.cookie('api_test', "api_test", options);
//     res.json({
//         message: 'Hello API2'
//     });
//     // return res.status(200);
//     res.status(200).send("hello");
// });
//
// // http://localhost:5000/rextest-ded68/us-central1/api/auth/emailRegister
// // application/json
// // {
// //     "registerEmail": "rex7@gets-info.com",
// //     "emailVerified": true,
// //     "registerPassword": "111111",
// //     "confirmPassword": "111111",
// //     "returnSecureToken": true
// // }
// //信箱註冊
// // /auth/emailRegister
// app.post('/emailRegister', (req, res) => {
//     if (req.method === 'POST') {
//         const registerEmail = req.body.registerEmail;
//         const registerPassword = req.body.registerPassword;
//         const confirmPassword = req.body.confirmPassword;
//         // var displayName = req.body.displayName;
//
//         if (!registerEmail) return res.status(400).json({
//             success: false,
//             message: 'missing email'
//         });
//         if (!registerPassword) return res.status(400).json({
//             success: false,
//             message: 'missing password'
//         });
//         if (!confirmPassword) return res.status(400).json({
//             success: false,
//             message: 'missing confirm password'
//         });
//         if (registerPassword !== confirmPassword) return res.status(400).json({
//             success: false,
//             message: 'password confirm failed'
//         });
//
//         //參考https://firebase.google.com/docs/auth/admin/manage-users?authuser=0#create_a_user
//         admin.auth().createUser({
//             email: registerEmail,
//             password: registerPassword,
//             // displayName:displayName
//         })
//             .then(function (userRecord) {
//                 // See the UserRecord reference doc for the contents of userRecord.
//                 // var uid = userRecord.uid;
//                 res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
//                 res.json({
//                     success: true,
//                     message: userRecord
//                 });
//                 console.log('Successfully created new user:', userRecord.uid);
//             })
//             .catch(function (error) {
//                 res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
//                 res.json({
//                     success: false,
//                     message: error
//                 });
//                 console.log('Error creating new user:', error);
//             });
//     } else {
//         res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
//         res.json({
//             success: false,
//             message: '無效的請求'
//         });
//         console.log('Error creating new user : Invalid req');
//     }
// });
//
// app.post('/email', (req, res) => {
//     const loginEmail = req.body.loginEmail;
//     const loginPassword = req.body.loginPassword;
//
//     if (!loginEmail) return res.status(400).json({
//         success: false,
//         message: 'missing email'
//     });
//     if (!loginPassword) return res.status(400).json({
//         success: false,
//         message: 'missing password'
//     });
//     firebase.auth().signInWithEmailAndPassword(loginEmail, loginPassword)
//         .then(function (user) {
//             user.user.getIdToken()
//                 .then(function (idToken) {
//                     const expiresIn = 60 * 60 * 24 * 7 * 1000;
//                     admin.auth().createSessionCookie(idToken, {
//                         expiresIn
//                     })
//                         .then(function (sessionCookie) {
//                             const options = {
//                                 maxAge: expiresIn,
//                                 httpOnly: true,
//                                 secure: true
//                             };
//                             res.cookie('__session', sessionCookie, options);
//                             res.json({
//                                 success: true,
//                                 message: '登入成功'
//                             });
//                             console.log('Successfully login user : ', user.user.uid);
//                         })
//                         .catch(function (error) {
//                             res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
//                             res.json({
//                                 success: false,
//                                 message: 'createSessionCookie'
//                             });
//                             console.log('Error login user : createSessionCookie\n\t', error);
//                         });
//                 })
//                 .catch(function (error) {
//                     res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
//                     res.json({
//                         success: false,
//                         message: 'idToken'
//                     });
//                     console.log('Error login user: idToken\n\t', error);
//                 });
//         })
//         .catch(function (error) {
//             res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
//             res.json({
//                 success: false,
//                 error: error
//             });
//             console.log('Error login user: ', error);
//         });
// });
//
// app.post('/phoneRegister', (req, res) => {
//     const registerPhone = req.body.registerPhone;
//     const registerPassword = req.body.registerPassword;
//     const confirmPassword = req.body.confirmPassword;
//     console.log(registerPhone)
//
//     if (!registerPhone) return res.status(400).json({
//         success: false,
//         message: 'missing phone number'
//     });
//     if (!registerPassword) return res.status(400).json({
//         success: false,
//         message: 'missing password'
//     });
//     if (!confirmPassword) return res.status(400).json({
//         success: false,
//         message: 'missing confirm password'
//     });
//     if (registerPassword !== confirmPassword) return res.status(400).json({
//         success: false,
//         message: 'password confirm failed'
//     });
//     //參考https://firebase.google.com/docs/auth/admin/manage-users?authuser=0#create_a_user
//     admin.auth().createUser({
//         phoneNumber: registerPhone
//     })
//         .then(function (userRecord) {
//             // See the UserRecord reference doc for the contents of userRecord.
//             const uid = userRecord.uid;
//             res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
//             res.json({
//                 success: true,
//                 message: userRecord
//             });
//             console.log('Successfully created new user:', uid);
//         })
//         .catch(function (error) {
//             res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
//             res.json({
//                 success: false,
//                 message: error
//             });
//             console.log('Error creating new user:', error);
//         });
// });
//
// // https://stackoverflow.com/questions/46893766/firebase-auth-signinwithphonenumber-express-on-node-js
// app.post('/phoneToken', (req, res) => {
//     firebase.auth().settings.appVerificationDisabledForTesting = false;
//
//     const loginPhone = req.body.loginPhone;
//     const testVerificationCode = "123456";
//     // const loginPassword = req.body.loginPassword;
//
//     if (!loginPhone) return res.status(400).json({
//         success: false,
//         message: 'missing phone number'
//     });
//     // if (!loginPassword) return res.status(400).json({
//     //     success: false,
//     //     message: 'missing password'
//     // });
//     const appVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container');
//     firebase.auth().signInWithPhoneNumber(loginPhone, appVerifier)
//         .then(function (user) {
//             user.user.getIdToken()
//                 .then(function (idToken) {
//                     const expiresIn = 60 * 60 * 24 * 7 * 1000;
//                     admin.auth().createSessionCookie(idToken, {
//                         expiresIn
//                     })
//                         .then(function (sessionCookie) {
//                             const options = {
//                                 maxAge: expiresIn,
//                                 httpOnly: true,
//                                 secure: true
//                             };
//                             res.cookie('__session', sessionCookie, options);
//                             res.json({
//                                 success: true,
//                                 message: '登入成功',
//                                 stats: 1
//                             });
//                             console.log('Successfully login user : ', user.user.uid);
//                         })
//                         .catch(function (error) {
//                             res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
//                             res.json({
//                                 success: false,
//                                 message: 'createSessionCookie'
//                             });
//                             console.log('Error login user : createSessionCookie\n\t', error);
//                         });
//                 })
//                 .catch(function (error) {
//                     res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
//                     res.json({
//                         success: false,
//                         message: 'idToken'
//                     });
//                     console.log('Error login user: idToken\n\t', error);
//                 });
//         })
//         .catch(function (error) {
//             res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
//             res.json({
//                 success: false,
//                 error: error
//             });
//             console.log('Error login user: ', error);
//         });
// });
// app.post('/phone', (req, res) => {
//     let token = req.body.token;
//     if (!token) return res.status(400).json({
//         error: 'missing email'
//     });
//     // console.log(token);
//
//     const expiresIn = 60 * 60 * 24 * 7 * 1000;
//     admin.auth().createSessionCookie(token, {
//         expiresIn
//     })
//         .then(function (sessionCookie) {
//             let options = {
//                 maxAge: expiresIn,
//                 httpOnly: true,
//                 secure: true
//             };
//             res.cookie('__session', sessionCookie, options);
//             res.json({
//                 success: true,
//                 message: '登入成功'
//             })
//         })
//         .catch(function (error) {
//             res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
//             res.json({
//                 success: false,
//                 error: error,
//                 a: 'createSessionCookie'
//             })
//         });
// });
//
// app.post('/sendSMS', function (req, res) {
//     const {
//         phoneNumber,
//         recaptchaToken
//     } = req.body;
//     console.log(phoneNumber, recaptchaToken);
//     const identityToolkit = google.identitytoolkit({
//         auth: 'AIzaSyB31V6WewUi-iY12231Ixahquf68uGaoCo',
//         version: 'v3',
//     });
//     const response = identityToolkit.relyingparty.sendVerificationCode({
//         phoneNumber,
//         recaptchaToken: recaptchaToken
//         // recaptchaToken: recaptcha,
//     });
//
//     // save sessionInfo into db. You will need this to verify the SMS code
//     // const sessionInfo = response.data.sessionInfo;
//     console.log(response);
//     res.json({"test": "test"})
// });
//
// app.get('/signIn', function (req, res) {
//     firebase.auth().signInWithPopup(provider).then((result) => {
//         console.log(result.additionalUserInfo.isNewUser);
//     });
// });
//
// const verifySessionCookie = async (sessionCookie) => {
//     let isVerify = false;
//     await admin.auth().verifySessionCookie(
//         sessionCookie, true)
//         .then((decodedClaims) => {
//             isVerify = true;
//             console.log('Auth - verifySessionCookie success : ', decodedClaims);
//         })
//         .catch(error => {
//             console.log('Auth - verifySessionCookie false : ', error);
//         });
//     return isVerify;
// };
//
// app.post('/getUserInfo', async (req, res) => {
//     let returnJson = {
//         success: false,
//         uid: req.body.userId
//     };
//     try {
//         // let userIdStr = userId.toString().trim();
//         let userIdStr = req.body.userId;
//         console.log("get firestore user : ", userIdStr);
//
//         if (userIdStr.length < 1) {
//             console.warn('firebaseGetUserData no userId : ', userId);
//             // returnJson.userStats = 0;
//             returnJson.uid = userId;
//             returnJson.success = false;
//             res.json(returnJson);
//         }
//
//         let firestore = ShortcutFunction.lazyFirebaseAdmin().firestore();
//         let doc = await firestore.collection('users').doc(userIdStr).get();
//         if (!doc.exists) {
//             console.log('No such document!');
//             returnJson.userStats = 0;
//             returnJson.success = true;
//         } else {
//             returnJson.data = doc.data();
//             returnJson.userStats = doc.data().userStats;
//             returnJson.success = true;
//             let create = doc.createTime;
//             console.log("createTime...:", (JSON.stringify(create, null, '\t')));
//             console.log("createTime...:", (create.seconds));
//             console.log("createTime...:", (create.nanoseconds));
//             let update = doc.updateTime;
//             console.log("updateTime...:", (JSON.stringify(update, null, '\t')));
//             console.log("updateTime...:", (update.seconds));
//             console.log("updateTime...:", (update.nanoseconds));
//             console.log("id...:", (doc.ref));
//             console.log("id...2:", (doc.ref._path.segments));
//             console.log("id...3:", (doc.id));
//             console.log(`Retrieved data: ${JSON.stringify(doc, null, '\t')}`);
//         }
//         console.log('getFirestoreUser : ', userIdStr, '\n', (JSON.stringify(returnJson, null, '\t')));
//         res.json(returnJson);
//     } catch (error) {
//         console.warn('firebaseGetUserData', error);
//         res.json({success: false});
//     }
// });
//
//
//
// module.exports = functions.https.onRequest(app);