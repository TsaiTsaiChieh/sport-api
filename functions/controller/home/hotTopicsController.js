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
        }
        shown_topic.push(topic.id)
        result = res;
      })
    }
    chkFirstTopic()
  }catch(err){
    console.log('Error in home/hotTopics by IFYU:  %o', err);
    return res.status(500).json({ success: false });
  }

  return res.status(200).json({topics: result});
}
module.exports = hotTopics;
/**
 * @api {get} /hotHopics Get Hot Topics
 * @apiVersion 1.0.0
 * @apiName hotHopics
 * @apiGroup home
 * @apiPermission None
 *
 * @apiSuccess {JSON} result 3 hot topics
 *
 * @apiSuccessExample Success-Response:
 *  HTTP/1.1 200 OK
 {
    "topics": [
        {
          "ranking": {
            "viewCount": 19588
          },
          "reply": [
            {
              "time": {
                "_seconds": 1584414000,
                "_nanoseconds": 0
              },
              "displayName": "紅色警報",
              "content": "好棒棒",
              "uid": "MyOPA8SzgVUq8iARhOa8mzQLC3e2"
            }
          ],
          "user": {
            "uid": "2WMRgHyUwvTLyHpLoANk7gWADZn1",
            "displayName": "台中大哥大"
          },
          "content": {
            "time": {
              "_seconds": 1584406800,
              "_nanoseconds": 0
            },
            "content": "推一場參考多特蒙德[主] VS布拉格斯拉維亞單 0.940…",
            "type": "MLB",
            "category": "賽事分析",
            "title": "推【近20日34過26】【主推近21日過17】【大小分14過12】季後賽8天過..."
          },
          "like": [
            "HppFr8j4sUVSQFKaiTGKjGZmQhw2"
          ],
          "id": "JYiitIwn0bg5B5r5NB0n"
        }, ...
    ]
 }
 *
 * @apiError 500 Internal Server Error
 *
 * @apiErrorExample Error-Response:
     *     HTTP/1.1 500 Internal Server Error
 */
