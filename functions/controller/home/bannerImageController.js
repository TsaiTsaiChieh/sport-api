/* eslint-disable promise/catch-or-return */
/* eslint-disable promise/always-return */
const db = require('../../util/dbUtil');
const Op = require('sequelize').Op;
/* 施工中
    [不可用]簡易資料測試 http://localhost:5000/test/bannerImage.html
    改mysql 原有後台等等全部失效需重寫
*/
function dbFind() {
  return new Promise(async function(resolve, reject) {
    try {
      const result = await db.sequelize.models.home__banner.findAll({
        order: ['sort'],
        where: {
          status: 1,
          sort: {
            [Op.ne]: null
          }
        }
      });
      resolve(result);
    } catch (error) {
      console.error(error);
      reject('get home banners failed');
    }
  });
}
async function bannerImage(req, res) {
  try {
    const banners = await dbFind();
    res.json({ code: 200, banners: banners });
  } catch (err) {
    console.log('Error in home/bannerImage by IFYU:  %o', err);
    return res.status(500).json({ code: 500, error: err });
  }
}
module.exports = bannerImage;
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
