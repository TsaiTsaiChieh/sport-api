const express = require('express');
const router = express.Router();
const verification = require('../util/verification');
const { checkBucketed } = require('../util/checkBlacklist');

router.get('/', function(req, res) {
  const data = { msg: 'Please use POST.' };
  res.json(data);
});

router.get(
  '/types/',
  verification.getToken,
  require('../controller/topics/getTypesController')
);
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
router.get(
  '/reply/:rid',
  require('../controller/topics/getReplyController')
);
router.post(
  '/',
  require('../controller/topics/getTopicsController')
);
router.post(
  '/createTopic',
  verification.token,
  checkBucketed,
  require('../controller/topics/createTopicController')
);
router.post(
  '/editArticle',
  verification.token,
  require('../controller/topics/editArticleController')
);
router.post(
  '/deleteArticle',
  verification.token,
  require('../controller/topics/deleteArticleController')
);
router.post(
  '/createReply',
  verification.token,
  checkBucketed,
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
router.post(
  '/favoriteArticle',
  verification.token,
  require('../controller/topics/favoriteArticleController')
);
router.get(
  '/getFavoriteArticle/:page',
  verification.token,
  require('../controller/topics/getFavoriteArticleController')
);
router.post(
  '/donate',
  verification.token,
  require('../controller/topics/donateController')
);

module.exports = router;
