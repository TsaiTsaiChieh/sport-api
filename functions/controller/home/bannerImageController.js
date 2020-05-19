const model = require('../../model/home/bannerImageModel');
async function bannerImage(req, res) {
  model(req)
    .then(function(body) {
      res.json(body);
    })
    .catch(function(err) {
      res.status(err.code).json(err);
    });
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
