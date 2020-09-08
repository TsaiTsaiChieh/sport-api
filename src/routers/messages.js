const verification = require('../util/verification');
const { checkMuted } = require('../util/checkBlacklist');
const express = require('express');
const router = express.Router();

// Just test
router.get('/list', function(req, res) {
  const data = { success: true, list: ['public'] };
  res.json(data);
});

router.get(
  '/:id',
  verification.token,
  require('../controller/message/getMessageWithIdController')
);
router.post(
  '/',
  verification.token,
  checkMuted,
  require('../controller/message/createMessageController')
);

router.delete(
  '/:id',
  verification.token,
  require('../controller/message/deleteMessageWithId')
);
router.post(
  '/accuse/',
  verification.token,
  require('../controller/message/accuseMessage')
);

module.exports = router;
