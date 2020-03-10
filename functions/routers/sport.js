const express = require('express');
const router = express.Router();

router.get('/', require('../controller/sport/getSports'));
router.get('/prematch', require('../controller/sport/prematchController'));

module.exports = router;
