// @ts-nocheck
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
const functions = require('firebase-functions');
//const myfunc = require( './myfunc' );
// <<<<<<< Updated upstream
// const longsingShortcutFunction = require( './shortcut_function' );
// const envValues = require( '././env_values' );
// const cookie = require( 'cookie' );
// const rp = require( 'request-promise' );
// const users = require( './users' );
// =======
const ShortcutFunction = require('./shortcut_function');
const envValues = require('././env_values');
const cookie = require('cookie');
const rp = require('request-promise');
const users = require('./users');
// >>>>>>> Stashed changes

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
const express = require("express");
const {
    google
} = require('googleapis');


// const admin = require("firebase-admin");
// const serviceAccount = require("./auth/sport19y0715-d23e597f8c95.json");
//
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     databaseURL: "https://sport19y0715.firebaseio.com"
// });

//const admin = myfunc.fadmin( mycfg.cert );
const admin = ShortcutFunction.lazyFirebaseAdmin(envValues.cert);

// const admin = require("firebase-admin");
// const serviceAccount = require("./auth/sport19y0715-d23e597f8c95.json");

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     databaseURL: "https://sport19y0715.firebaseio.com"
// });

const firebase = require('firebase');

firebase.initializeApp(envValues.firebaseConfig);

const app = express();
app.use(express.json());

// app.disable("x-powered-by");
app.post('/api', (req, res) => {
    console.log("api....");
    res.json({
        message: 'Hello API2'
    });
    // return res.status(200);
    // res.status(200).send("hello");
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

        if (!registerEmail) return res.status(400).json({
            success: false,
            message: 'missing email'
        });
        if (!registerPassword) return res.status(400).json({
            success: false,
            message: 'missing password'
        });
        if (!confirmPassword) return res.status(400).json({
            success: false,
            message: 'missing confirm password'
        });
        if (registerPassword !== confirmPassword) return res.status(400).json({
            success: false,
            message: 'password confirm failed'
        });

        //參考https://firebase.google.com/docs/auth/admin/manage-users?authuser=0#create_a_user
        admin.auth().createUser({
            email: registerEmail,
            password: registerPassword,
            // displayName:displayName
        })
            .then(function (userRecord) {
                // See the UserRecord reference doc for the contents of userRecord.
                // var uid = userRecord.uid;
                res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
                res.json({
                    success: true,
                    message: userRecord
                });
                console.log('Successfully created new user:', userRecord.uid);
            })
            .catch(function (error) {
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

    if (!loginEmail) return res.status(400).json({
        success: false,
        message: 'missing email'
    });
    if (!loginPassword) return res.status(400).json({
        success: false,
        message: 'missing password'
    });
    firebase.auth().signInWithEmailAndPassword(loginEmail, loginPassword)
        .then(function (user) {
            user.user.getIdToken()
                .then(function (idToken) {
                    const expiresIn = 60 * 60 * 24 * 7 * 1000;
                    admin.auth().createSessionCookie(idToken, {
                        expiresIn
                    })
                        .then(function (sessionCookie) {
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
                        .catch(function (error) {
                            res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
                            res.json({
                                success: false,
                                message: 'createSessionCookie'
                            });
                            console.log('Error login user : createSessionCookie\n\t', error);
                        });
                })
                .catch(function (error) {
                    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
                    res.json({
                        success: false,
                        message: 'idToken'
                    });
                    console.log('Error login user: idToken\n\t', error);
                });
        })
        .catch(function (error) {
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
    console.log(registerPhone)

    if (!registerPhone) return res.status(400).json({
        success: false,
        message: 'missing phone number'
    });
    if (!registerPassword) return res.status(400).json({
        success: false,
        message: 'missing password'
    });
    if (!confirmPassword) return res.status(400).json({
        success: false,
        message: 'missing confirm password'
    });
    if (registerPassword !== confirmPassword) return res.status(400).json({
        success: false,
        message: 'password confirm failed'
    });
    //參考https://firebase.google.com/docs/auth/admin/manage-users?authuser=0#create_a_user
    admin.auth().createUser({
        phoneNumber: registerPhone
    })
        .then(function (userRecord) {
            // See the UserRecord reference doc for the contents of userRecord.
            const uid = userRecord.uid;
            res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.json({
                success: true,
                message: userRecord
            });
            console.log('Successfully created new user:', uid);
        })
        .catch(function (error) {
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
    const testVerificationCode = "123456";
    // const loginPassword = req.body.loginPassword;

    if (!loginPhone) return res.status(400).json({
        success: false,
        message: 'missing phone number'
    });
    // if (!loginPassword) return res.status(400).json({
    //     success: false,
    //     message: 'missing password'
    // });
    const appVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container');
    firebase.auth().signInWithPhoneNumber(loginPhone, appVerifier)
        .then(function (user) {
            user.user.getIdToken()
                .then(function (idToken) {
                    const expiresIn = 60 * 60 * 24 * 7 * 1000;
                    admin.auth().createSessionCookie(idToken, {
                        expiresIn
                    })
                        .then(function (sessionCookie) {
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
                        .catch(function (error) {
                            res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
                            res.json({
                                success: false,
                                message: 'createSessionCookie'
                            });
                            console.log('Error login user : createSessionCookie\n\t', error);
                        });
                })
                .catch(function (error) {
                    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
                    res.json({
                        success: false,
                        message: 'idToken'
                    });
                    console.log('Error login user: idToken\n\t', error);
                });
        })
        .catch(function (error) {
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
    if (!token) return res.status(400).json({
        error: 'missing email'
    });
    // console.log(token);

    const expiresIn = 60 * 60 * 24 * 7 * 1000;
    admin.auth().createSessionCookie(token, {
        expiresIn
    })
        .then(function (sessionCookie) {
            let options = {
                maxAge: expiresIn,
                httpOnly: true,
                secure: true
            };
            res.cookie('__session', sessionCookie, options);
            res.json({
                success: true,
                message: '登入成功'
            })
        })
        .catch(function (error) {
            res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.json({
                success: false,
                error: error,
                a: 'createSessionCookie'
            })
        });
});

app.post('/sendSMS', function (req, res) {
    const {
        phoneNumber,
        recaptchaToken
    } = req.body;
    console.log(phoneNumber, recaptchaToken);
    const identityToolkit = google.identitytoolkit({
        auth: 'AIzaSyB31V6WewUi-iY12231Ixahquf68uGaoCo',
        version: 'v3',
    });
    const response = identityToolkit.relyingparty.sendVerificationCode({
        phoneNumber,
        recaptchaToken: recaptchaToken
        // recaptchaToken: recaptcha,
    });

    // save sessionInfo into db. You will need this to verify the SMS code
    // const sessionInfo = response.data.sessionInfo;
    console.log(response);
    res.json({"test": "test"})
});

app.post('/login', function (req, res) {
    let returnJson = {success: false};
    let token = req.body.token;
    let uid = req.body.uid;
    if (!token) {
        console.log('Error login user: missing token');
        return res.status(400).json(returnJson);
    }
    let expiresIn = 60 * 60 * 24 * 7 * 1000;
    admin.auth().createSessionCookie(token, {expiresIn})
        .then(async function (sessionCookie) {
            let options = {maxAge: expiresIn, httpOnly: true};
            // let options = {maxAge: expiresIn, httpOnly: true, secure: true};
            res.cookie('__session', sessionCookie, options);

            let firestoreUser = await getUserProfile(uid);
            returnJson.success = true;
            if (firestoreUser) {
                console.log("firestoreUser exist");
                returnJson.uid = firestoreUser.uid;
                returnJson.userStats = firestoreUser.stats;
                returnJson.userInfo = firestoreUser.data;
            } else {
                returnJson.userStats = 0;
                console.log("firestoreUser exist not");
            }
            console.log("ready login");
            res.json(returnJson)
        })
        .catch(function (error) {
            console.log('Error login user: \n\t', error);
            res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.status(400).json({success: false})
        });
});

app.post('/logout', function (req, res) {
    let cookies = req.get('cookie') || '__session=';
    if (cookies) {
        firebase.auth().signOut().then(function () {
            console.log('logout out user');
            res.clearCookie('__session');
            // res.setHeader('Access-Control-Allow-Origin', '*');
            res.json({success: true});
        }).catch(function (error) {
            // An error happened.
        });
    }
});

app.get('/signIn', function (req, res) {
    firebase.auth().signInWithPopup(provider).then((result) => {
        console.log(result.additionalUserInfo.isNewUser);
    });
});

app.get('/verifySessionCookie', async function (req, res) {
    let cookies = req.get('cookie') || '__session=';
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (cookies) {
        let sessionCookie = cookie.parse(cookies).__session;
        console.log('verifySessionCookie - ', sessionCookie);
        if (await verifySessionCookie(sessionCookie)) {
            res.json({success: true});
        } else {
            res.json({success: false});
        }
        // admin.auth().verifySessionCookie(
        //     sessionCookie, true)
        //     .then((decodedClaims) => {
        //         console.log('Auth - verifySessionCookie success : ', decodedClaims);
        //         res.json({success: true})
        //     })
        //     .catch(error => {
        //         console.log('Auth - verifySessionCookie false : ', error);
        //         res.json({success: false})
        //     });
    }
});

async function verifySessionCookie(sessionCookie) {
    admin.auth().verifySessionCookie(
        sessionCookie, true)
        .then((decodedClaims) => {
            console.log('Auth - verifySessionCookie success : ', decodedClaims);
            return true;
        })
        .catch(error => {
            console.log('Auth - verifySessionCookie false : ', error);
            return false;
        });
}

/**
 * Line login , reference from :
 * https://firebase.googleblog.com/2016/11/authenticate-your-firebase-users-with-line-login.html
 */
// app.post('/verifyToken', (req, res) => {
//     if (!req.body.token) {
//         return res.status(400).send('Access Token not found');
//     }
//     const reqToken = req.body.token;
//
//     // Send request to LINE server for access token verification
//     const options = {
//         url: 'https://api.line.me/v1/oauth/verify',
//         headers: {
//             'Authorization': `Bearer ${reqToken}`
//         }
//     };
//     request(options, (error, response, body) => {
//         if (!error && response.statusCode === 200) {
//             const lineObj = JSON.parse(body);
//             // Don't forget to verify the token's channelId to prevent spoof attack
//             if ((typeof lineObj.mid !== 'undefined')
//                 && (lineObj.channelId === myLINEChannelId)) {
//                 // Access Token Validation succeed with LINE server
//                 // Generate Firebase token and return to device
//                 const firebaseToken = generateFirebaseToken(lineObj.mid);
//
//                 // Update Firebase user profile with LINE profile
//                 firebase.auth().signInWithCredential()
//                 admin.updateUserProfile(reqToken, firebaseToken, lineObj.mid, () => {
//                     const ret = {
//                         firebase_token: firebaseToken
//                     };
//                     return res.status(200).send(ret);
//                 });
//             }
//         }
//
//         const ret = {
//             error_message: 'Authentication error: Cannot verify access token.'
//         };
//         return res.status(403).send(ret);
//
//     });
// });

// Generate a Request option to access LINE APIs
function generateLineApiRequest(apiEndpoint, lineAccessToken) {
    return {
        url: apiEndpoint,
        headers: {'Authorization': `Bearer ${lineAccessToken}`},
        json: true,
    };
}


/**
 * Look up Firebase user based on LINE's mid. If the Firebase user does not exist,
 * fetch LINE profile and create a new Firebase user with it.
 * reference from https://github.com/firebase/functions-samples/blob/master/line-auth/functions/index.js
 * @returns {Promise<UserRecord>} The Firebase user record in a promise.
 */
async function getFirebaseUser(lineMid, lineAccessToken) {
    // Generate Firebase user's uid based on LINE's mid
    const firebaseUid = `line:${lineMid}`;

    // LINE's get user profile API endpoint
    const getProfileOptions = generateLineApiRequest(envValues.lineConfig.profileURL, lineAccessToken);

    try {
        const response = await admin.auth().getUser(firebaseUid);
        // Parse user profile from LINE's get user profile API response
        const displayName = response.displayName;
        const photoURL = response.pictureUrl;

        console.log('Create new Firebase user for LINE user mid = "', lineMid, '"');
        // Create a new Firebase user with LINE profile and return it
        return admin.auth().createUser({
            uid: firebaseUid,
            displayName: displayName,
            photoURL: photoURL,
        });
    } catch (error) {
        // If user does not exist, fetch LINE profile and create a Firebase new user with it
        if (error.code === 'auth/user-not-found') {
            return rp(getProfileOptions);
        }
        // If error other than auth/user-not-found occurred, fail the whole login process
        throw error;
    }
}

/**
 * Verify LINE access token and return a custom auth token allowing signing-in
 * the corresponding Firebase account.
 *
 * Here are the steps involved:
 *  1. Verify with LINE server that a LINE access token is valid
 *  2. Check if a Firebase user corresponding to the LINE user already existed.
 *  If not, fetch user profile from LINE and generate a corresponding Firebase user.
 *  3. Return a custom auth token allowing signing-in the Firebase account.
 *
 * @returns {Promise<string>} The Firebase custom auth token in a promise.
 */
async function verifyLineToken(lineAccessToken) {
    // Send request to LINE server for access token verification
    const verifyTokenOptions = generateLineApiRequest(envValues.lineConfig.verifyURL, lineAccessToken);
    // const verifyTokenOptions = generateLineApiRequest('https://api.line.me/v1/oauth/verify', lineAccessToken);

    // STEP 1: Verify with LINE server that a LINE access token is valid
    const response = await rp(verifyTokenOptions);
    // Verify the token’s channelId match with my channelId to prevent spoof attack
    // <IMPORTANT> As LINE's Get user profiles API response doesn't include channelID,
    // you must not skip this step to make sure that the LINE access token is indeed
    // issued for your channel.
    // TODO: consider !== here
    // if (response.channelId !== functions.config().line.channelid) {
    //     throw new Error('LINE channel ID mismatched');
    // }

    // STEP 2: Access token validation succeeded, so look up the corresponding Firebase user
    const lineMid = response.mid;
    const userRecord = await getFirebaseUser(lineMid, lineAccessToken);
    // STEP 3: Generate Firebase Custom Auth Token
    const token = await admin.auth().createCustomToken(userRecord.uid);
    console.log('Created Custom token for UID "', userRecord.uid, '" Token:', token);
    return token;
}

// Verify LINE token and exchange for Firebase Custom Auth token
app.post('/verifyToken', async (req, res) => {
    // exports.verifyToken = functions.https.onRequest(async (req, res) => {
    if (req.body.token === undefined) {
        const ret = {
            error_message: 'Access Token not found',
        };
        return res.status(400).send(ret);
    }

    const reqToken = req.body.token;

    try {
        // Verify LINE access token with LINE server then generate Firebase Custom Auth token
        const customAuthToken = await verifyLineToken(reqToken);
        const ret = {
            firebase_token: customAuthToken,
        };
        return res.status(200).send(ret);
    } catch (err) {
        // If LINE access token verification failed, return error response to client
        const ret = {
            error_message: 'Authentication error: Cannot verify access token.',
        };
        console.error('LINE token verification failed: ', err);
        return res.status(403).send(ret);
    }
});

app.post('/getUserInfo', async (req, res) => {
    let userId = req.body.uid;
    let returnJson = {
        success: false,
        uid: userId
    };
    try {
        let userIdStr = userId.toString().trim();

        if (userIdStr.length < 1) {
            console.warn('firebaseGetUserData no userId : ', userId);
            returnJson.stat = 0;
            returnJson.uid = userId;
            res.status(200).json(returnJson);
        }

        let firestore = ShortcutFunction.lazyFirebaseAdmin().firestore();

        let docRef = firestore
            .collection('users')
            .doc(userIdStr)
            .get();
        //docSnapshot.exists

        let data = {};

        let userExists = docRef.exists;

        if (userExists) {
            data = docRef.data();
            returnJson.stat = 1;
        } else {
            returnJson.stat = 0;
            //return returnJson;
        }
        returnJson.data = data;

        returnJson.success = true;
        //doc = this.setNoValue(docSnapshot.data(), {});
    } catch (error) {
        console.warn('firebaseGetUserData', error);
        returnJson.stat = error;
    }

    //let cityRef = db.collection('cities').doc('SF');
    //let getDoc = cityRef.get()
    console.log('getFirestoreUser\n', returnJson);
    res.status(200).json(returnJson);
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
        console.log("get firestore user : ", userIdStr);

        if (userIdStr.length < 1) {
            console.warn('firebaseGetUserData no userId : ', userId);
            // returnJson.userStats = 0;
            returnJson.uid = userId;
            returnJson.success = false;
            return returnJson;
        }

        let firestore = ShortcutFunction.lazyFirebaseAdmin().firestore();
        let doc = await firestore.collection('users').doc(userIdStr).get();
        if (!doc.exists) {
            console.log('No such document!');
            returnJson.userStats = 0;
            returnJson.success = true;
        } else {
            returnJson.data = doc.data();
            returnJson.userStats = doc.data().userStats;
            returnJson.success = true;
        }
        console.log('getFirestoreUser : ', userIdStr, '\n', (JSON.stringify(returnJson, null, '\t')));
        return await returnJson;
    } catch (error) {
        console.warn('firebaseGetUserData', error);
        returnJson.success = false;
    }
}

app.post('/modifyUserProfile', async function (req, res) {
    try {
        let cookies = req.get('cookie') || '__session=';
        let uid = req.body.uid;
        if (!uid) res.status(400).json({success: false, message: 'missing uid'});
        let nowTimestamp = ShortcutFunction.timestampUTCmsInt();
        let firestoreUser = await getUserProfile(uid);
        let data = {};
        console.log(",.asdldfkalsklfdaklasdfllkl");
        console.log(firestoreUser.userStats);
        switch (firestoreUser.userStats) {
            case 0: //新會員
                if (!req.body.displayName || !req.body.name || !req.body.phone || !req.body.email || !req.body.birthday)
                    res.status(400).json({success: false, message: 'missing info'});
                data.createTime = nowTimestamp;
                data.updateTime = nowTimestamp;
                data.displayName = req.body.displayName;    //only new user can set displayName, none changeable value
                data.name = req.body.name;                  //only new user can set name(real name), none changeable value
                data.phone = req.body.phone;
                data.email = req.body.email;
                data.birthday = req.body.birthday;          //only new user can set birthday, none changeable value
                if (!req.body.avatar) data.avatar = "https://this.is.defaultAvatar.jpg";
                data.userStats = 1;
                console.log("new user profile : ", uid);
                break;
            case 1: //一般會員
                break;
            case 2: //大神
                break;
            case 3: //鎖帳號會員
                res.status(400).json({success: false, message: 'blocked user'});
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
        if (true) { //開發中暫停驗證sessionCookie
            // if (await verifySessionCookie(sessionCookie)) {
            let sessionCookie = cookie.parse(cookies).__session;
            let firestore = ShortcutFunction.lazyFirebaseAdmin().firestore();
            firestore.collection('users').doc(uid).set(data, {merge: true}).then(ref => {
                console.log('Added document with ID: ', ref);
                res.json({success: true, result: ref});
            }).catch(e => {
                console.log('Added document with error: ', e);
                res.json({success: false, message: "update failed"});
            });
            // res.json({success: true, result: writeResult});
        } else {
            res.json({success: false, message: "not login"});
        }
    } catch (e) {
        console.log('Added document with error: ', e);
        res.json({success: false, message: "profile faild"});
    }
});

async function uploadAvatar() {
    console.log("compress avatar to 100*100?");
    return "https://uploaded.firestorage.avatar.jpg";
    // let returnJson = {
    //     success: false,
    //     uid: userId
    // };
    // try {
    //     // let userIdStr = userId.toString().trim();
    //     let userIdStr = userId;
    //     console.log("get firestore user : ", userIdStr);
    //
    //     if (userIdStr.length < 1) {
    //         console.warn('firebaseGetUserData no userId : ', userId);
    //         returnJson.userStats = 0;
    //         returnJson.uid = userId;
    //         returnJson.success = false;
    //         return returnJson;
    //     }
    //
    //     let firestore = ShortcutFunction.lazyFirebaseAdmin().firestore();
    //     let doc = await firestore.collection('users').doc(userIdStr).get();
    //     if (!doc.exists) {
    //         console.log('No such document!');
    //         returnJson.userStats = 0;
    //         returnJson.success = true;
    //     } else {
    //         returnJson.data = doc.data();
    //         returnJson.userStats = doc.data().stats;
    //         returnJson.success = true;
    //     }
    //     console.log('getFirestoreUser : ', userIdStr, '\n', (JSON.stringify(returnJson, null, '\t')));
    //     return await returnJson;
    // } catch (error) {
    //     console.warn('firebaseGetUserData', error);
    //     returnJson.success = false;
    // }
}

module.exports = functions.https.onRequest(app);