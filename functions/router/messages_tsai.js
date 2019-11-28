const express = require('express');
const router = express();

const MessageController = require('../controller/messageController');

// Just test
router.get('/list', (req, res) => {
  let data = { success: true, list: ['public'] };
  res.json(data);
});
router.get('/:key', MessageController.getMessageWithKey);
router.post('/', MessageController.postMessage);
router.delete('/:key', MessageController.deleteMessage);
module.exports = router;
