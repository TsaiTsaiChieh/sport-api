const modules = require('../util/modules');
const router = modules.express.Router();
const verification = require('../util/verification');

router.get('/', function(req, res) {
  let data = { msg: 'Please use POST.' };
  res.json(data);
});

router.post(
  '/',
  require('../controller/topics/getTopicsController')
);
router.post(
  '/createTopic',
  verification.token,
  require('../controller/topics/createTopicController')
);

module.exports = router;
