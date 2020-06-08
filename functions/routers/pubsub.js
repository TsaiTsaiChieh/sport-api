const modules = require('../util/modules');
const router = modules.express.Router();

// 一次性專區
router.get('/backup', require('../pubsub/backupFirestore').backupFirestore);
router.get('/restore', require('../pubsub/backupFirestore').restoreFirestore);
router.get('/prematch', require('../pubsub/prematch'));
router.get('/prematch_esport', require('../pubsub/prematch_esport'));
router.get('/handicap', require('../pubsub/handicap'));
router.get('/handicap_esport', require('../pubsub/handicap_esport'));
router.get('/dy', require('../pubsub/insertdbfordy'));

router.get(
  '/settlement',
  require('../pubsub/handicap/settlementAccordingMatch')
);
router.get('/checkmatch_esport', require('../pubsub/checkmatch_eSoccer'));
router.get('/checkmatch_KBO', require('../pubsub/checkmatch_KBO'));
router.get('/checkmatch_abnormal', require('../pubsub/checkmatch_abnormal'));
router.get('/lineups', require('../pubsub/lineups'));
router.get('/title_period', require('../pubsub/titlePeriod'));
// router.get('/tune_db', require('../pubsub/tuneDB'));
router.get('/mysql', require('../pubsub/mysql/connection'));

// 大神
router.get('/god', require('../pubsub/god'));

// router.get('/create_tables', require('../pubsub/mysql/createTables'));
// test statscore
router.get('/test_statscore', require('../pubsub/test_statscore'));
module.exports = router;
