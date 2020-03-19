const modules = require('../util/modules');
const verification = require('../util/verification');
const router = modules.express.Router();
router.get('/livescore', require('../controller/home/livescoreController'));
module.exports = router;
