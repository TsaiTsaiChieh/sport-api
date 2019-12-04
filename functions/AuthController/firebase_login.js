const express = require('express');
const router = express.Router();
const envValues = require('../Configs/env_values');
const shortcutFunction = require('../shortcut_function');
const admin = shortcutFunction.lazyFirebaseAdmin(envValues.cert);
const userUtils = require('../Utils/userUtil');

router.post('/', async (req, res) => {
    let returnJson = {success: false};
    let token = req.body.token;
    // let uid = req.body.uid;
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (!token) {
        console.log('Error login user: missing token');
        return res.status(400).json(returnJson);
    }
    admin.auth().verifyIdToken(token)
        .then((decodedIdToken) => {
            // Create session cookie and set it.
            let expiresIn = 60 * 60 * 24 * 7 * 1000;
            admin.auth().createSessionCookie(token, {expiresIn})
                .then(async function (sessionCookie) {
                    let firestoreUser = await userUtils.getUserProfile(decodedIdToken.uid);
                    returnJson.success = true;
                    if (firestoreUser) {
                        console.log("firestoreUser exist");
                        returnJson.uid = firestoreUser.uid;
                        returnJson.userStats = firestoreUser.userStats;
                        returnJson.userInfo = firestoreUser.data;
                    }
                    // let options = {maxAge: expiresIn, httpOnly: true};
                    let options = {maxAge: expiresIn, httpOnly: true, secure: true};
                    res.cookie('__session', sessionCookie, options);
                    return res.json(returnJson)
                })
                .catch(function (error) {
                    console.log('Error login user: \n\t', error);
                    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
                    return res.json({success: false})
                });
        });
});
module.exports = router;