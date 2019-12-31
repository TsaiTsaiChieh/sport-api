const express = require('express');
const router = express();
const verification = require('../util/verification');
const modules = require('../util/modules');

// Just test
router.get('/list', async (req, res) => {
  let data = { success: true, list: ['public'] };
  res.json(data);
  //   const messageSnapshot = await modules.getSnapshot(
  //       'chat_public',
  //       'XPrNaAWujYedEw3XMJZg'
  //   );
  //   console.log(messageSnapshot.data());
});
// router.get('/test', async (req, res) => {
//   let uid = '40lFV6SJAVYpw0zZbIuUp7gL9Py2';
//   let id = ['JrMbGsx9NA1Lr8IIOdK5', '2yp0R129DR7DaivZv4uq'];
//   let result = await modules.database.ref(`/mask_message/${uid}`).set({
//     messageId: id
//   });
//   res.send(result);
// });
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
router.post(
  '/accuse/',
  verification.token,
  require('../controller/message/accuseMessage')
);
module.exports = router;
