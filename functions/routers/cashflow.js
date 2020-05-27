const modules = require('../util/modules');
const router = modules.express.Router();

/* 取得14天後到期紅利 */
router.post(
  '/dividend_expire',
  require('../controller/cashflow/dividendExpireController')
);
/* 計算14天後到期紅利 */
router.put(
    '/dividend_expire',
    require('../controller/cashflow/dividendExpireController')
  );
/* 扣除到期紅利 */
router.delete(
    '/dividend_expire',
    require('../controller/cashflow/dividendExpireController')
  );
module.exports = router;
