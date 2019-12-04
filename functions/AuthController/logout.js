const express = require('express');
const router = express.Router();
// const envValues = require('../Configs/env_values');
// const firebase = require('firebase');
//
// firebase.initializeApp(envValues.firebaseConfig);

// const envValues = require('../Configs/env_values');
// const shortcutFunction = require('../shortcut_function');
// const admin = shortcutFunction.lazyFirebaseAdmin(envValues.cert);

router.post('/', function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.clearCookie('__session');
    res.json({success: true});
    // firebase.auth().signOut().then(function () {
    //     console.log('logout out user');
    //     // res.setHeader('Access-Control-Allow-Origin', '*');
    //     res.json({success: true});
    // }).catch(function (error) {
    //     console.log('logout out user failed : ', error);
    //     res.json({success: false});
    //     // An error happened.
    // });
});

module.exports = router;