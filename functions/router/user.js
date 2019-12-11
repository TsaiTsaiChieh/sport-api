const express = require('express');
const router = express.Router();


router.post('/getUserProfile', require('../controller/user/getUserProfile'));
router.post('/modifyUserProfile', require('../controller/user/modifyUserProfile'));
router.get('/checkUnique/', require('../controller/user/checkUnique'));

module.exports = router;