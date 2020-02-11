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
router.get('/test', async (req, res) => {
  // request:league_id（球種）, day(哪天比賽), page
  try {
    // just example data, league_id is 1 (football)
    const result = await modules.axios.get(
      'https://betsapi.com/api-doc/samples/bet365_upcoming.json'
    );
    console.log(result.data);
    res.send(result.data);
  } catch (err) {
    console.log(err);
  }
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
router.post(
  '/accuse/',
  verification.token,
  require('../controller/message/accuseMessage')
);
module.exports = router;
