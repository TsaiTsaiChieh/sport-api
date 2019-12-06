const express = require('express');
const router = express.Router();


router.post('/getUserProfile', require('../controller/user/getUserProfile'));
router.post('/modifyUserProfile', require('../controller/user/modifyUserProfile'));

module.exports = router;