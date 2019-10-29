const functions = require('firebase-functions');
const myfunc = require('./myfunc');
const mycfg = require('./mycfg');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((req, res) => {
//  res.send("Hello from Firebase!");
// });
const express = require("express");
const {
    google
} = require('googleapis');

const admin = myfunc.fadmin(mycfg.cert, 'https://rextest-ded68.firebaseio.com');
/*
const admin = require("firebase-admin");
const serviceAccount = require("./auth/sport19y0715-d23e597f8c95.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://sport19y0715.firebaseio.com"
});
*/

const firebase = require('firebase');

const firebaseConfig = {
    apiKey: "AIzaSyB31V6WewUi-iY12231Ixahquf68uGaoCo",
    authDomain: "sport19y0715.firebaseapp.com",
    databaseURL: "https://sport19y0715.firebaseio.com",
    projectId: "sport19y0715",
    storageBucket: "sport19y0715.appspot.com",
    messagingSenderId: "179049951227",
    appId: "1:179049951227:web:15b2ae874d653216"
};

firebase.initializeApp(firebaseConfig);


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
app.post('/phone', (req, res) => {

    var token = req.body.token;
    if (!token) return res.status(400).json({
        error: 'missing email'
    });
    // console.log(token);

    var expiresIn = 60 * 60 * 24 * 7 * 1000;
    admin.auth().createSessionCookie(token, {
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
    res.json({
        "test": "test"
    })
});

app.post('/login', function (req, res) {
    let token = req.body.token;
    if (!token) {
        console.log('Error login user: missing token');
        return res.status(400).json({
            success: false,
            message: "登入失敗"
        });
    }
    let expiresIn = 60 * 60 * 24 * 7 * 1000;
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
            console.log('Error login user: \n\t', error);
            res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.json({
                success: false,
                message: "登入失敗"
            })
        });
});

app.post('/logout', function (req, res) {
    res.clearCookie('__session');
    res.json({
        success: true,
        message: '登出成功'
    });
});

app.get('/verifySessionCookie', function (req, res) {
    let cookies = req.get('cookie') || '__session=';
    let sessionCookie = cookie.parse(cookies).__session;

    admin.auth().verifySessionCookie(
            sessionCookie, true)
        .then((decodedClaims) => {
            res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.json({
                success: true,
                decodedClaims: decodedClaims
            })
        })
        .catch(error => {
            res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.json({
                success: false,
                message: error
            })
        });
});

// app.listen(5000,()=> console.log('Server started on port 5000'));

// module.exports = functions.https.onRequest(app);

module.exports = functions.https.onRequest(app);