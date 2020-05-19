const modules = require('../util/modules');
const router = modules.express.Router();
// const verification = require('../util/verification');

router.get('/teams', require('../controller/history/teamController'));
router.get(
  '/teamhandicap',
  require('../controller/history/teamhandicapController')
);

module.exports = router;
