const modules = require('../util/modules');
const router = modules.express.Router();
const verification = require('../util/verification');

router.get('/god_lists', require('../controller/home/godListsController') );
router.get('/win_rate_lists', require('../controller/home/winRateListsController') );
router.get('/win_bets_lists', require('../controller/home/winBetsListsController') );
router.get('/hotTopics', require('../controller/home/hotTopicsController') );
router.get('/livescore', require('../controller/home/livescoreController'));

module.exports = router;
