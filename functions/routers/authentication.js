const express = require('express');
const router = express.Router();
const envValues = require('../config/env_values');
const session = require('express-session');
const verification = require('../util/verification');

const session_options_line = {
  secret: envValues.lineConfig.channelSecret,
  resave: false,
  saveUninitialized: false
};

router.get('/lineLogin', session(session_options_line), require('../controller/authentication/lineLogin'));
router.get('/lineLoginHandler', require('../controller/authentication/lineHandler'));
router.post('/login', require('../controller/authentication/firebaseLogin'));
router.get('/logout', require('../controller/authentication/logout'));
router.post('/verifySessionCookie', verification.token, require('../controller/authentication/verifySessionCookie'));
router.post('/uid2token', require('../controller/authentication/uid2token'));

module.exports = router;
