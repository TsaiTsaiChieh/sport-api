const modules = require('../../util/modules');
/* 施工中
    簡易資料測試 http://localhost:5000/topic_test.html
*/
async function hotTopics(req, res) {
  const topics = [];
  try {
    const testQuery = await modules.firestore.collection('topics')
      // .where('sell', '==', '1')
      .get();
    console.log(testQuery)

    const sortedArr = testQuery.docs.map(function(doc) {  // 轉換成array
      return doc.data()
    });

    // sortedArr.sort(function compare(a, b) { // 進行 order 排序
    //   return a.order > b.order; // 升 小->大
    // });

    sortedArr.forEach(async function(data) {
      topics.push(data);
    });

    await Promise.all(topics);
  }catch(err){
    console.log('Error in home/hotTopics by IFYU:  %o', err);
    return res.status(500);
  }

  return res.status(200).json({test: topics});
}

module.exports = hotTopics;
