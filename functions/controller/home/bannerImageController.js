const modules = require('../../util/modules');
/* 施工中
    簡易資料測試 http://localhost:5000/test/bannerImage.html
*/
async function hotTopics(req, res) {
  const banners = [];
  let result = [];
  let show = [];
  let show_key = [];
  let hide = [];
  let hide_tmp = [];

  try {
    const banners = await modules.firestore.collection('home_banner')
    .get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
        if(doc.id == 'show'){
          let item = doc.data()

          for(let i = 0; i < Object.keys(item).length; i++){
            console.log(item[i])
            if(item[i] != null){
              show.push(item[i])
              show_key.push(item[i].name)
            }
          }
        }else{
          hide_tmp.push(doc.data())
        }
      });
      for(let i = 0; i < hide_tmp.length; i++){
        console.log(hide_tmp[i].name, show_key)
        if(!show_key.includes(hide_tmp[i].name)){
          hide.push(hide_tmp[i])
        }
      }
      result = show;
    });

  }catch(err){
    console.log('Error in home/bannerImage by IFYU:  %o', err);
    return res.status(500).json({ success: false });
  }

  return res.status(200).json({banners: result});
}
module.exports = hotTopics;
/**
 * @api {get} /bannerImage Get Home Banner Image
 * @apiVersion 1.0.0
 * @apiName bannerImage
 * @apiGroup home
 * @apiPermission None
 *
 * @apiSuccess {JSON} result home top banner image
 *
 * @apiSuccessExample Success-Response:
 *  HTTP/1.1 200 OK
 {
  "banners": [
    {
      "name": "1585028776800.jpg",
      "url": "https://firebasestorage.googleapis.com/v0/b/sportslottery-test.appspot.com/o/home_banner%2F1585028776800.jpg?alt=media&token=036371ba-1f79-405b-a134-936b92da7385",
      "link": "https://doinfo.cc/"
    },
  ]
 }
 *
 * @apiError 500 Internal Server Error
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 */
