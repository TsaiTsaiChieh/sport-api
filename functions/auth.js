const functions = require('firebase-functions');
const myfunc=require('./myfunc');
const mycfg= require('./mycfg');

// import * as express from "express";
// import * as admin from "firebase-admin";
// import * as functions from "firebase-functions";

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((req, res) => {
//  res.send("Hello from Firebase!");
// });
const express = require("express");

const admin = require("firebase-admin");
const serviceAccount = require("./auth/sport19y0715-d23e597f8c95.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://rextest-ded68.firebaseio.com"
});

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
        message: 'Hello API'
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
    // console.log(req.body);
    // exports.EmailRegister = functions.https.onRequest((req, res) => {
    //     console.log("......2");
    if (req.method === 'POST') {
        const registerEmail = req.body.registerEmail;
        const registerPassword = req.body.registerPassword;
        const confirmPassword = req.body.confirmPassword;
        // var displayName = req.body.displayName;

        if (!registerEmail) return res.status(400).json({
            error: 'missing email'
        });
        if (!registerPassword) return res.status(400).json({
            error: 'missing password'
        });
        if (!confirmPassword) return res.status(400).json({
            error: 'missing password'
        });
        if (registerPassword !== confirmPassword) return res.status(400).json({
            error: 'password not same'
        });

        //參考https://firebase.google.com/docs/auth/admin/manage-users?authuser=0#create_a_user
        admin.auth().createUser({
                email: registerEmail,
                password: registerPassword,
                // displayName:displayName
                rawId: "testID"
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
        error: 'missing email'
    });
    if (!loginPassword) return res.status(400).json({
        error: 'missing password'
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
                                error: error,
                                a: 'createSessionCookie'
                            });
                            console.log('Error login user : createSessionCookie\n\t', error);
                        });
                })
                .catch(function (error) {
                    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
                    res.json({
                        success: false,
                        error: error,
                        a: 'idToken'
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

// app.listen(5000,()=> console.log('Server started on port 5000'));

module.exports = functions.https.onRequest(app);