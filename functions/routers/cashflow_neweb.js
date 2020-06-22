const modules = require('../util/modules');
const router = modules.express.Router();
/* MPG 付款頁面 */
router.get(
  '/mpg',
  require('../controller/cashflow_neweb/mpgController')
);
router.post(
  '/mpg',
  require('../controller/cashflow_neweb/mpgController')
);

/* MPG 付款成功通知頁面 */
router.get(
  '/mpg_notify',
  require('../controller/cashflow_neweb/mpgNotifyController')
);
router.post(
  '/mpg_notify',
  require('../controller/cashflow_neweb/mpgNotifyController')
);
module.exports = router;
