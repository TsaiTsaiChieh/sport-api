const express = require('express');
const router = express.Router();


router.get('/getRanks/', require('../controller/user/getRanks'));
router.post('/getUserProfile', require('../controller/user/getUserProfile'));
router.post('/modifyUserProfile', require('../controller/user/modifyUserProfile'));
router.post('/checkUnique/', require('../controller/user/checkUnique'));

module.exports = router;