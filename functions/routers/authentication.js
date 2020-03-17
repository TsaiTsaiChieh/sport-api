const express = require('express');
const router = express.Router();
const line_login = require("line-login");
const envValues = require('../config/env_values');
const session = require("express-session");
const session_options_line = {
    secret: envValues.lineConfig.channelSecret,
    resave: false,
    saveUninitialized: false
};

const lineLogin = new line_login({
    channel_id: envValues.lineConfig.channelID,
    channel_secret: envValues.lineConfig.channelSecret,
    callback_url: envValues.lineConfig.callbackURL,
    scope: "openid profile email",
    prompt: "consent",
    bot_prompt: "normal"
});

router.use(session(session_options_line));

router.get("/lineLogin", lineLogin.auth());
router.get("/lineLoginHandler", require('../controller/authentication/lineHandler'));
router.post('/login', require('../controller/authentication/firebaseLogin'));
router.get('/logout', require('../controller/authentication/logout'));
router.get('/verifySessionCookie', require('../controller/authentication/verifySessionCookie'));

module.exports = router;