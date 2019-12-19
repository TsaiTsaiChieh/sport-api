const express = require('express');
const router = express.Router();
const verification = require('../util/verification');


router.get('/getRanks/', require('../controller/user/getRanks'));
router.post('/getUserProfile', require('../controller/user/getUserProfile'));
router.post('/modifyUserProfile', require('../controller/user/modifyUserProfile'));
router.post('/checkUnique/', require('../controller/user/checkUnique'));
router.post('/accuse/', verification.token, require('../controller/user/accuseUser'));

module.exports = router;
