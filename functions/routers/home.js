const modules = require('../util/modules');
const router = modules.express.Router();
const verification = require('../util/verification');

router.get('/godlists', require('../controller/home/godListsController') );
router.get('/winratelists', require('../controller/home/winRateListsController') );
router.get('/winbetslists', require('../controller/home/winBetsListsController') );
router.get('/hotTopics', require('../controller/home/hotTopicsController') );
router.get('/livescore', require('../controller/home/livescoreController'));

module.exports = router;
