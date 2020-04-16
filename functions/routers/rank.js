const modules = require('../util/modules');
const router = modules.express.Router();
const verification = require('../util/verification');

router.get('/god_lists', require('../controller/rank/godListsController') );
router.get('/win_rate_lists', require('../controller/rank/winRateListsController') );
router.get('/win_bets_lists', require('../controller/rank/winBetsListsController') );

module.exports = router;
