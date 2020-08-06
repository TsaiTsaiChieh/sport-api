const express = require('express');
const router = express.Router();

// 一次性專區
router.get('/backup', require('../pubsub/backupFirestore').backupFirestore);
router.get('/restore', require('../pubsub/backupFirestore').restoreFirestore);
router.get('/prematch', require('../pubsub/prematch'));
router.get('/prematch_esport', require('../pubsub/prematch_esport'));
router.get('/handicap', require('../pubsub/handicap'));
router.get('/handicap_esport', require('../pubsub/handicap_esport'));
// router.get('/dy', require('../pubsub/dy'));
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
// router.get('/god', require('../pubsub/god'));

// 金流
// router.get('/cashflow', require('../pubsub/cashflow'));

// router.get('/create_tables', require('../pubsub/mysql/createTables'));
// test statscore
router.get('/auth_statscore', require('../pubsub/auth_statscore'));
router.get(
  '/prematch_statscore_MLB',
  require('../pubsub/prematch_statscore_MLB')
);
router.get(
  '/checkmatch_statscore_MLB',
  require('../pubsub/checkmatch_statscore_MLB')
);
router.get(
  '/prematch_statscore_KBO',
  require('../pubsub/prematch_statscore_KBO')
);
router.get(
  '/checkmatch_statscore_KBO',
  require('../pubsub/checkmatch_statscore_KBO')
);
router.get(
  '/prematch_statscore_CPBL',
  require('../pubsub/prematch_statscore_CPBL')
);
router.get(
  '/checkmatch_statscore_CPBL',
  require('../pubsub/checkmatch_statscore_CPBL')
);
router.get(
  '/prematch_statscore_NPB',
  require('../pubsub/prematch_statscore_NPB')
);
router.get(
  '/checkmatch_statscore_NPB',
  require('../pubsub/checkmatch_statscore_NPB')
);
router.get(
  '/prematch_statscore_Soccer',
  require('../pubsub/prematch_statscore_Soccer')
);
router.get(
  '/checkmatch_statscore_Soccer',
  require('../pubsub/checkmatch_statscore_Soccer')
);
router.get(
  '/prematch_statscore_CBA',
  require('../pubsub/prematch_statscore_CBA')
);
router.get(
  '/checkmatch_statscore_CBA',
  require('../pubsub/checkmatch_statscore_CBA')
);

router.get(
  '/prematch_statscore_NBA',
  require('../pubsub/prematch_statscore_NBA')
);

router.get(
  '/checkmatch_statscore_NBA',
  require('../pubsub/checkmatch_statscore_NBA')
);
router.get('/checkmatch_another', require('../pubsub/checkmatch_another'));
// 爬蟲專區
router.get('/KBO_crawler', require('../pubsub/crawlers/prematch_KBO'));
router.get('/CPBL_crawler', require('../pubsub/crawlers/prematch_CPBL'));
router.get('/NPB_crawler', require('../pubsub/crawlers/prematch_NPB'));
router.get('/MLB_crawler', require('../pubsub/crawlers/prematch_MLB'));
// 更新先發名單
// router.get('/lineup_CPBL', require('../pubsub/lineup_statscore_CPBL'));
// router.get('/lineup_MLB', require('../pubsub/lineup_statscore_MLB'));
// router.get('/lineup_KBO', require('../pubsub/lineup_statscore_KBO'));
// router.get('/lineup_NPB', require('../pubsub/lineup_statscore_NPB'));

module.exports = router;
