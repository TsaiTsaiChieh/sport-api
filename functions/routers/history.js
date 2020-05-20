const modules = require('../util/modules');
const router = modules.express.Router();
// const verification = require('../util/verification');

router.get('/teams', require('../controller/history/teamController'));
router.get(
  '/teamhandicap',
  require('../controller/history/teamhandicapController')
);
router.get('/teamevent', require('../controller/history/teameventController'));
module.exports = router;
