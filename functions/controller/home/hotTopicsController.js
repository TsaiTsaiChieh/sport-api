const modules = require('../../util/modules');
/* 施工中
    簡易資料測試 http://localhost:5000/topic_test.html
*/
async function hotTopics(req, res) {
  const topics = [];
  try {
    const query = await modules.firestore.collection('topics')
    // .where('foo', '==', 'bar')
    .orderBy('ranking.viewCount', 'desc')
    .limit(2)
    .get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
        topics.push(doc.data())
      });
    });
  }catch(err){
    console.log('Error in home/hotTopics by IFYU:  %o', err);
    return res.status(500);
  }

  return res.status(200).json({topics: topics});
}

module.exports = hotTopics;
