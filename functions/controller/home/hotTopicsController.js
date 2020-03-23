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
    .orderBy('ranking.viewCount', 'desc') //依瀏覽數排列
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
            "avatar: "https://firebasestorage.googleapis.com/v0/b/sport19y0715.appspot.com/o/default%2Favatar%2Fdefault-profile-avatar.jpg?alt=media&token=7753385f-5457-4fe2-af8e-acef75fcccd8",
            "displayName": "紅色警報",
            "content": "好棒棒",
            "uid": "MyOPA8SzgVUq8iARhOa8mzQLC3e2"
          }
        ],
        "user": {
          "displayName": "台中大哥大",
          "avatar": "https://png.pngtree.com/png-clipart/20190629/original/pngtree-cartoon-dinosaur-hand-drawn-cute-commercial-elements-png-image_4068875.jpg",
          "uid": "2WMRgHyUwvTLyHpLoANk7gWADZn1"
        },
        "content": {
          "title": "MLB／大谷翔平二刀流復活！ 天使隊同意可回日本",
          "img": "https://img-s-msn-com.akamaized.net/tenant/amp/entityid/BB11nW8X.img",
          "time": {
            "_seconds": 1584406800,
            "_nanoseconds": 0
          },
          "type": "MLB",
          "content": "大聯盟天使隊今天由總教練Joe Maddon宣布，由於受到武漢肺炎感染威脅，最快5月中才有可能開幕，而日籍好手大谷翔平，確定在球季一開始就會以投打「二刀流」身分重回場上。",
          "category": "賽事分析"
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
