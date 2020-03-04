const modules = require('../util/modules');
const router = modules.express.Router();

router.get('/prematch', require('../pubsub/prematch'));
router.get('/handicap', require('../pubsub/handicap'));
router.get('/lineups', require('../pubsub/lineups'));

module.exports = router;
