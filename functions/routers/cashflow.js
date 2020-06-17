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

/* 紅利回饋 */
router.post(
  '/dividend_refund',
  require('../controller/cashflow/dividendRefundController')
);
/* 搞錠轉換現金 */
router.post(
  '/ingot_transfer',
  require('../controller/cashflow/ingotTransferController')
);
module.exports = router;
