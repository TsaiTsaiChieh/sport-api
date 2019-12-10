const express = require('express');
const router = express();
const verification = require('../util/verification');
const MessageController = require('../controller/messageController');

// Just test
router.get('/list', (req, res) => {
  let data = { success: true, list: ['public'] };
  res.json(data);
});
router.get('/?', require('../controller/message/getLastMessag'));
router.get(
  '/:id',
  verification.token,
  require('../controller/message/getMessageWithId')
);
router.post('/', verification.token, MessageController.postMessage);
router.delete(
  '/:id',
  verification.token,
  require('../controller/message/deleteMessageWithId')
);
module.exports = router;
