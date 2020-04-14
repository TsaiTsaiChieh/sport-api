const modules = require('../util/modules');
const router = modules.express.Router();
const verification = require('../util/verification');

router.get('/',function(req, res) {
  let data = { success: true };
  res.json(data);
});
router.post(
  '/createTopic',
  verification.token,
  require('../controller/topics/createTopicController')
);

module.exports = router;
