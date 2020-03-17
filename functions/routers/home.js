const modules = require('../util/modules');
const router = modules.express.Router();

router.get('/livescore', function(req, res) {
  // inprogress : query from realtime database 只會顯示三場
  // 結束後依照league優先比重輪播（當該聯盟所有比賽都結束則自動更新成下一權重的比賽/手動選擇聯盟）
  // closed : query from firestore

  // 聯盟
  let radar_league_id = '2fa448bc-fc17-4d3d-be03-e60e080fdc26';
  let bets_league_id = '3939';

  // 賽事

  res.json('123');
});
module.exports = router;
