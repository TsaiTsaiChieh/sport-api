const envValues = require('../../config/env_values');

/**
 * @api {get} /auth/logout Logout User
 * @apiVersion 1.0.0
 * @apiName logout
 * @apiGroup Auth
 * @apiPermission none
 *
 * @apiSuccess {Boolean} success logout result
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": "true"
 *     }
 */
function logout(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.clearCookie('__session', {path: '/', domain: envValues.domain});
    return res.json({success: true});
}

module.exports = logout;
