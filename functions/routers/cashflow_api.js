const modules = require('../util/modules');
const router = modules.express.Router();

/* 信用卡支付 */
// router.post(
//     '/ccard',
//     require('../controller/cashflow_api/ccardController')
// );
/* 信用卡支付(回覆通知) */
router.post(
    '/ccard_notify',
    require('../controller/cashflow_api/ccardNotifyController')
);

module.exports = router;
