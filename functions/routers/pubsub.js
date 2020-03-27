const modules = require('../util/modules');
const router = modules.express.Router();

// router.get('/backup', require('../pubsub/backupFirestore').backupFirestore);
// router.get('/restore', require('../pubsub/backupFirestore').restoreFirestore);
router.get('/prematch', require('../pubsub/prematch'));
router.get('/handicap', require('../pubsub/handicap'));
router.get('/lineups', require('../pubsub/lineups'));
router.get('/checkmatch_NBA', require('../pubsub/checkmatch_NBA'));
router.get('/checkmatch_MLB', require('../pubsub/checkmatch_MLB'));
router.get('/title_period', require('../pubsub/titlePeriod'));

module.exports = router;
