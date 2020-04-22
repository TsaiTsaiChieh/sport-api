const modules = require('../util/modules');
const router = modules.express.Router();

// 一次性專區
router.get('/backup', require('../pubsub/backupFirestore').backupFirestore);
router.get('/restore', require('../pubsub/backupFirestore').restoreFirestore);
router.get('/prematch', require('../pubsub/prematch'));
router.get('/handicap', require('../pubsub/handicap'));
router.get('/lineups', require('../pubsub/lineups'));
router.get('/title_period', require('../pubsub/titlePeriod'));
// router.get('/tune_db', require('../pubsub/tuneDB'));
router.get('/mysql', require('../pubsub/mysql/connection'));
router.get('/esoccer', require('../pubsub/util/prematchFunctions_ESoccer'));
// router.get('/create_tables', require('../pubsub/mysql/createTables'));
module.exports = router;
