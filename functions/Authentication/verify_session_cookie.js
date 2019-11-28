const express = require('express');
const router = express.Router();
const shortcutFunction = require('../shortcut_function');
const envValues = require('../Configs/env_values');
const admin = shortcutFunction.lazyFirebaseAdmin(envValues.cert);

router.get('/', async function (req, res) {
    let sessionCookie = req.cookies.__session;
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (!sessionCookie) res.json({success: false});
    await admin.auth().verifySessionCookie(
        sessionCookie, true)
        .then((decodedClaims) => {
            console.log('Auth - verifySessionCookie success : ', decodedClaims);
            res.json({success: true});
        })
        .catch(error => {
            console.log('Auth - verifySessionCookie false : ', error);
            res.json({success: false});
        });
});

module.exports = router;