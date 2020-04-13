const express = require('express');
const router = express.Router();
const verification = require('../util/verification');

router.get('/', require('../controller/sport/getSports'));
router.get(
  '/prematch',
  verification.confirmLogin,
  require('../controller/sport/prematchController')
);
router.get('/matches', require('../controller/sport/matchesController'));

module.exports = router;
