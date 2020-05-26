const modules = require('../util/modules');
const router = modules.express.Router();
// const verification = require('../util/verification');

router.get('/god_lists', require('../controller/home/godListsController'));
router.get(
  '/win_rate_lists',
  require('../controller/home/winRateListsController')
);
router.get(
  '/win_bets_lists',
  require('../controller/home/winBetsListsController')
);
router.get('/hotTopics/:page*?', require('../controller/home/hotTopicsController'));
router.get('/bannerImage', require('../controller/home/bannerImageController'));
router.get('/bannerContent/:id', require('../controller/home/bannerContentController'));
router.get('/livescore', require('../controller/home/livescoreController'));
router.get('/carousel', require('../controller/home/carouselController'));
module.exports = router;
