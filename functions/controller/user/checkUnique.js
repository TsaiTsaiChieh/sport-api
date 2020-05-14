const userUtils = require('../../util/userUtil');

/**
 * @api {get} /user/checkUnique Check Unique profile
 * @apiVersion 1.0.0
 * @apiName checkUnique
 * @apiGroup User
 * @apiPermission none
 *
 * @apiParam (Request body) {String} type uniqueName,uniqueEmail,uniquePhone
 * @apiParam (Request body) {String} value string value of name, email or phone number
 *
 * @apiSuccess {JSON} result api result
 *
 * @apiSuccessExample exist:
 *  HTTP/1.1 200 OK
 {
    "success": true,
    "isExist": true
}
 *
 * @apiSuccessExample Not exist:
 *  HTTP/1.1 200 OK
 {
    "success": true,
    "isExist": false
}
 *
 * @apiError parameter parameter error
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 parameter error
 {
    "success": false
}
 */// Unique collections: uniqueName,uniqueEmail,uniquePhone
async function checkUnique(req, res) {
  try {
    const collection = req.body.type;
    const value = req.body.value;
    if (!collection || !value) return res.status(400).json({ success: false });
    const collections = ['uniqueName', 'uniqueEmail', 'uniquePhone'];
    if (collections.indexOf(collection) < 0) return res.status(400).json({ success: false });
    return res.json(await userUtils.checkUniqueCollection(collection, value));
  } catch (e) {
    console.log(e);
    return res.status(500).json({ success: false });
  }
}

module.exports = checkUnique;
