const modules = require('../util/modules');
const router = modules.express.Router();

/* 超商代碼 */
// router.post(
//     '/cvs_code',
//     require('../controller/cashflow/cvsCodeController')
// );

/* 超商條碼 */
router.get(
  '/mpg',
  require('../controller/cashflow_neweb/mpgController')
);

router.post(
  '/mpg_notify',
  require('../controller/cashflow_neweb/mpgNotifyController')
);

/* WebATM */
// router.post(
//     '/webatm',
//     require('../controller/cashflow/webAtmController')
// );

/* ATM */
// router.post(
//     '/atm',
//     require('../controller/cashflow/AtmController')
// );
// router.post(
//     '/atm_notify',
//     require('../controller/cashflow/AtmNotifyController')
// )
module.exports = router;
