const { User } = require('../../util/dbUtil');
const ezpay_config = require('../../config/invoice/ezpay_config');
async function getUserProfile(req, res) {
  try {
    const uid = req.token.uid;
    const record = await User.findOne({
      where: {
        uid: uid
      },
      raw: true
    });
    console.log(ezpay_config.default_invoice_carrier);

    !record.invoice_carrier === ezpay_config.default_invoice_carrier ? record.carrier_status = 1 : record.carrier_status = 0;

    if (record) {
      return res.json(record);
    } else {
      return res.status(404).json({ message: 'unregistered' });
    }
  } catch (err) {
    console.error('Error in controller/user/getUserProfile by Rex', err);
    return res.status(500).json({ message: 'error' });
  }
}
module.exports = getUserProfile;

/**
 * @api {get} /user/getUserProfile Get User Profile
 * @apiVersion 1.0.0
 * @apiName getUserProfile
 * @apiGroup User
 * @apiPermission login user
 *
 * @apiParam (Request cookie) {JWT} __session token generate from firebase Admin SDK
 *
 * @apiSuccess {JSON} user User Profile JSON
 *
 * @apiSuccessExample New User:
 *  HTTP/1.1 200 OK
 {
    "success": true,
    "uid": "lz3c3ju6G0TilDOdgCQt4I7I8ep1",
    "status": 0
 }
 *
 * @apiSuccessExample Success-Response:
 *  HTTP/1.1 200 OK
 {
    "id": 3,
    "uid": "40lFV6SJAVYpw0zZbIuUp7gL9Py2",
    "status": 1,
    "avatar": "https://firebasestorage.googleapis.com/v0/b/sportslottery-test.appspot.com/o/avatar%2Fdefault-avatar.jpg?alt=media",
    "birthday": 1582502400,
    "birthday_tw": "2020-02-24",
    "display_name": "炸裂設計師",
    "dividend": 0,
    "email": "tmp@tmp.tmp124",
    "name": "測試2號",
    "country_code": null,
    "phone": "0900123480",
    "point": 0,
    "signature": "",
    "fan_count": 2,
    "default_title": "1",
    "default_god_league_rank": null,
    "accuse_credit": 20,
    "block_count": 0,
    "unread_count": 0,
    "block_message": "2020-02-23T16:00:00.000Z",
    "coin": 0,
    "ingot": 0,
    "rank1_count": 0,
    "rank2_count": 16,
    "rank3_count": 0,
    "rank4_count": 0,
    "createdAt": "2020-04-12T16:00:01.000Z",
    "updatedAt": "2020-07-31T03:17:52.000Z"
 }
 *
 * @apiError TokenMissing session cookie not exist.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Token Missing
 *     missing token
 */
