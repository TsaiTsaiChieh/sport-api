const modules = require('../util/modules');
const router = modules.express.Router();

/* 取得14天候到期紅利 */
router.post(
  '/dividend_expire',
  require('../controller/cashflow/dividendExpireController')
);
/* 計算14天候到期紅利 */
router.put(
    '/dividend_expire',
    require('../controller/cashflow/dividendExpireController')
  );
module.exports = router;
