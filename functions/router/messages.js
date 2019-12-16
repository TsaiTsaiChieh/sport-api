const express = require('express');
const router = express();
const verification = require('../util/verification');
const modules = require('../util/modules');

// Just test
router.get('/list', async (req, res) => {
  // let data = { success: true, list: ['public'] };
  // res.json(data);
  const messageSnapshot = await modules.getSnapshot(
      'chat_public',
      'XPrNaAWujYedEw3XMJZg'
  );
  console.log(messageSnapshot.data());
});
router.get('/?', require('../controller/message/getLastMessag'));
router.get(
    '/:id',
    verification.token,
    require('../controller/message/getMessageWithId')
);
router.post(
    '/',
    verification.token,
    require('../controller/message/createMessage')
);
router.delete(
    '/:id',
    verification.token,
    require('../controller/message/deleteMessageWithId')
);
module.exports = router;