const verification = require('../util/verification');
const modules = require('../util/modules');
const router = modules.express.Router();

// Just test
router.get('/list', function(req, res) {
  let data = { success: true, list: ['public7771111'] };
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
