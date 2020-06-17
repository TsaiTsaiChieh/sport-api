const modules = require('../util/modules');
const router = modules.express.Router();

/* 超商代碼 */
// router.post(
//     '/cvs_code',
//     require('../controller/cashflow/cvsCodeController')
// );

// /* 超商條碼 */
router.post(
    '/cvs_barcode',
    require('../controller/cashflow_neweb/cvsBarcodeController')
);

// /* WebATM */
// router.post(
//     '/webatm',
//     require('../controller/cashflow/webAtmController')
// );

// /* ATM */
// router.post(
//     '/atm',
//     require('../controller/cashflow/AtmController')
// );
module.exports = router;
