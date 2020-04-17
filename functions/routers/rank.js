const modules = require('../util/modules');
const router = modules.express.Router();


router.get('/list', function(req, res) {
  let data = { success: true, list: ['public'] };
  res.json(data);
});
router.get('/search_user/:display_name', require('../controller/rank/searchUserController') );
router.get('/search_user_detail/:uid', require('../controller/rank/searchUserDetailController'));
router.get('/default_league', require('../controller/rank/defaultLeagueController'));

module.exports = router;
