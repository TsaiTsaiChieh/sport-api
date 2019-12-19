const userUtils = require('../../util/userUtil');
const modules = require('../../util/modules');


/**
 * @api {post} /user/accuse Accuse user
 * @apiVersion 1.0.0
 * @apiName accuse
 * @apiGroup User
 * @apiPermission login user
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
async function accuseUser(req, res) {
    try {
        //對象
        //原因[打廣告，內容不實，灌水洗版，人身攻擊，其它]
        //照片
        let collection = req.body.type;
        let value = req.body.value;
        if (!collection || !value) return res.status(400).json({success: false});
        const collections = ['uniqueName', 'uniqueEmail', 'uniquePhone'];
        if (collections.indexOf(collection) < 0) return res.status(400).json({success: false});
        return res.json(await userUtils.checkUniqueCollection(collection, value));
    } catch (e) {
        console.log(e);
        return res.status(500).json({success: false});
    }
}

module.exports = accuseUser;
