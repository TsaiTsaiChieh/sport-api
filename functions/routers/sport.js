const express = require('express');
const router = express.Router();

router.get('/', require('../controller/sport/getSports'));
module.exports = router;
