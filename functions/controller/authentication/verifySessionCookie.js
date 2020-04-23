/**
 * @api {get} /auth/verifySessionCookie Verify Session Cookie
 * @apiVersion 1.0.0
 * @apiName VerifySessionCookie
 * @apiGroup Auth
 * @apiPermission login user
 *
 * @apiParam (Request cookie) {token} __session token generate from firebase Admin SDK
 *
 * @apiSuccess {Boolean} success verify result success
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": "true"
 *     }
 *
 * @apiError TokenMissing session cookie not exist.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Token Missing
 *     {
 *       "success": "false"
 *     }
 */
function verifySessionCookie(req, res) {
  try {
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error in util/verification token functions', err);
    res.status(401).json({ code: 401, error: 'Unauthorized' });
  }
}

module.exports = verifySessionCookie;
