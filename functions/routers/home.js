const modules = require('../util/modules');
const router = modules.express.Router();
const verification = require('../util/verification');

router.get('/godlists', require('../controller/home/godListsController') );
router.get('/winratelists', require('../controller/home/winRateListsController') );
router.get('/winbetslists', require('../controller/home/winBetsListsController') );
router.get('/hotTopics', require('../controller/home/hotTopicsController') );


router.get('/livescore/:league', async function(req, res) {
  // inprogress : query from realtime database 只會顯示三場
  // 結束後依照league優先比重輪播（當該聯盟所有比賽都結束則自動更新成下一權重的比賽/手動選擇聯盟）
  // closed : query from firestore
  let league = req.params.league;
  console.log(league);

  // 聯盟（前端輸入 / 預設優先權順序）

  let leagueName = `pagetest_${league}`;
  let query = await modules.firestore
    .collection(leagueName)
    .orderBy('scheduled', 'desc')
    .get();

  let eventData = [];
  query.forEach(doc => {
    eventData.push(doc.data());
  });

  let dateNow = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
  dateNow = dateNow.split(' ')[0];

  let scheduled;
  let eventToday = [];
  let closedEvent = [];
  let inprogressEvent = [];
  let scheduledEvent = [];
  let outputJson = [];
  for (let i = 0; i < eventData.length; i++) {
    scheduled = new Date(
      eventData[i].scheduled._seconds * 1000
    ).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
    scheduled = scheduled.split(' ')[0];

    if (scheduled === dateNow) {
      eventToday.push(eventData[i]);
    }
    // 0 目前當天有幾場比賽已結束
    if (scheduled === dateNow && eventData[i].flag.status == 0) {
      closedEvent.push(eventData[i]);
    }

    // 1 目前當天有幾場比賽進行中
    if (scheduled === dateNow && eventData[i].flag.status == 1) {
      outputJson.push(eventData[i]);
    }
    // 2 目前當天有幾場比賽規劃中
    if (scheduled === dateNow && eventData[i].flag.status == 2) {
      scheduledEvent.push(eventData[i]);
    }
  }
  // console.log(closedEvent);
  // console.log(inprogressEvent);
  // console.log(scheduledEvent);
  // outputJson.push(inprogressEvent);
  if (outputJson.length == 0) {
    for (let i = 0; i < 3; i++) {
      if (closedEvent[i]) {
        outputJson.push(closedEvent[i]);
      }
    }
  }
  if (outputJson.length == 1) {
    for (let i = 0; i < 2; i++) {
      if (closedEvent[i]) {
        outputJson.push(closedEvent[i]);
      }
    }
  }
  if (outputJson.length == 2) {
    for (let i = 0; i < 1; i++) {
      if (closedEvent[i]) {
        outputJson.push(closedEvent[i]);
      }
    }
  }
  res.json(outputJson);
});
module.exports = router;
