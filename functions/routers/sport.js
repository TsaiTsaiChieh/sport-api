const express = require('express');
const router = express.Router();
const verification = require('../util/verification');

router.get('/', require('../controller/sport/getSports'));
router.get(
  '/matches',
  verification.confirmLogin_v2,
  require('../controller/sport/matchesController')
);

module.exports = router;
