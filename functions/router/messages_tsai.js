const express = require('express');
const router = express();
const verification = require('../util/verification');

const MessageController = require('../controller/messageController');

// Just test
router.get('/list', (req, res) => {
  let data = { success: true, list: ['public'] };
  res.json(data);
});
router.get('/:id', MessageController.getMessageWithId);
router.post('/', MessageController.postMessage);
router.delete(
  '/:id',
  verification.token,
  MessageController.deleteMessageWithId
);
// router.delete('/:id', MessageController.deleteMessageWithId);
module.exports = router;
