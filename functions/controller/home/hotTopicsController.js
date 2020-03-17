const modules = require('../../util/modules');
/* 施工中
    簡易資料測試 http://localhost:5000/topic_test.html
*/
async function hotTopics(req, res) {
  const topics = [];
  let result = [];
  try {
    const queryTop = await modules.firestore.collection('topics')
    .where('content.category', '==', '賽事分析') //撈一篇最高的賽事分析擺第一篇
    .orderBy('ranking.viewCount', 'desc')
    .limit(1)
    .get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
        let tmp = doc.data();
        tmp.id = doc.id;
        topics.push(tmp)
      });
    });
    const query = await modules.firestore.collection('topics')
    .orderBy('ranking.viewCount', 'desc')
    .limit(3) //撈三篇熱門文
    .get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
        let tmp = doc.data();
        tmp.id = doc.id;
        topics.push(tmp)
      });
    });
    function chkFirstTopic(){ //把非第一篇賽事分析文剔除
      let shown_topic = [];
      let res = [];
      topics.forEach(topic =>{
        if(!shown_topic.includes(topic.id)){
          res.push(topic)
          console.log(topic.id)
        }
        shown_topic.push(topic.id)
        result = res;
      })
    }
    (await chkFirstTopic())
  }catch(err){
    console.log('Error in home/hotTopics by IFYU:  %o', err);
    return res.status(500);
  }

  return res.status(200).json({topics: result});
}

module.exports = hotTopics;
