const modules = require('../util/modules');
const router = modules.express.Router();
const verification = require('../util/verification');

router.get('/', function(req, res) {
  const data = { msg: 'Please use POST.' };
  res.json(data);
});

router.get(
  '/article/:aid',
  verification.getToken,
  require('../controller/topics/getArticleController')
);
router.get(
  '/replies/:aid/:page',
  verification.getToken,
  require('../controller/topics/getRepliesController')
);
router.post(
  '/',
  require('../controller/topics/getTopicsController')
);
router.post(
  '/createTopic',
  verification.token,
  require('../controller/topics/createTopicController')
);
router.post(
  '/editArticle',
  verification.token,
  require('../controller/topics/editArticleController')
);
router.post(
  '/createReply',
  verification.token,
  require('../controller/topics/createReplyController')
);
router.post(
  '/likeArticle',
  verification.token,
  require('../controller/topics/likeArticleController')
);
router.post(
  '/likeReply',
  verification.token,
  require('../controller/topics/likeReplyController')
);

module.exports = router;
