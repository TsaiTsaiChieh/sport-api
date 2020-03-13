const modules = require('../util/modules');
const router = modules.express.Router();

router.get('/prematch', require('../pubsub/prematch'));
router.get('/handicap', require('../pubsub/handicap'));
router.get('/lineups', require('../pubsub/lineups'));
router.get('/lineups_MLB', require('../pubsub/lineups_MLB'));

module.exports = router;
