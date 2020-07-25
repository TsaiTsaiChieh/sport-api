const firebaseAdmin = require('../../util/firebaseUtil');

/**
 * @api {get} /user/getRanks Get Rank List
 * @apiVersion 1.0.0
 * @apiName getRanks
 * @apiGroup User
 * @apiPermission None
 *
 * @apiSuccess {JSON} result Available List of Ranks
 *
 * @apiSuccessExample Success-Response:
 *  HTTP/1.1 200 OK
 {
    "1": {
        "name": "鑽石大神"
    },
    "2": {
        "name": "黃牌大神"
    },
    "3": {
        "name": "銀牌大神"
    },
    "4": {
        "name": "銅牌大神"
    }
}
 *
 * @apiError 500 Internal Server Error
 *
 * @apiErrorExample Error-Response:
     *     HTTP/1.1 500 Internal Server Error
 */
async function getRanks(req, res) {
  let returnJson = {};
  try {
    const firestore = firebaseAdmin().firestore();
    const snapshot = await firestore.collection('rank').get();
    returnJson = {};
    snapshot.forEach(function(doc) {
      returnJson[doc.id] = doc.data();
    });
  } catch (e) {
    console.log(e);
    return res.status(500);
  }
  res.status(200).json(returnJson);
}

module.exports = getRanks;
