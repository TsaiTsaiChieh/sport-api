const modules = require('../../util/modules');
const admin = modules.firebaseAdmin;


/**
 * @api {post} /user/accuse Accuse user
 * @apiVersion 1.0.0
 * @apiName accuseUser
 * @apiGroup User
 * @apiPermission login user
 *
 * @apiParam (Request body) {String} defendant UID of user who is accused of having done something illegal
 * @apiParam (Request body) {String} reason reason options : [打廣告，內容不實，灌水洗版，人身攻擊，其它]
 * @apiParam (Request body) {String} evidence image URL
 *
 * @apiSuccess {JSON} result api result
 *
 * @apiSuccessExample success:
 *  HTTP/1.1 200 OK
 {
    "success": true,
    "result": {
        "_writeTime": {
            "_seconds": 1576823386,
            "_nanoseconds": 512028000
        }
    }
}
 *
 * @apiError 400 Bad Request
 * @apiError 401 Unauthorized
 * @apiError 403 Forbidden
 * @apiError 404 Not Found
 * @apiError 500 Internal Server Error
 */
async function accuseUser(req, res) {
    try {
        if (!req.body.defendant || req.body.reason || req.body.evidence) return res.status(400).send();
        const accuserSnapshot = await modules.getSnapshot('users', req.token.uid);
        if (!accuserSnapshot.exists) return res.status(400).send();
        const accuser = await accuserSnapshot.data();
        if (accuser.status < 1) return res.status(400).send();
        const defendant = req.body.defendant;
        if (accuser.uid === defendant) return res.status(400).send();
        const reason = req.body.reason;
        const evidence = req.body.evidence;
        const accuseCredit = accuser.accuseCredit ? accuser.accuseCredit : 0;
        const nowTimeStamp = admin.firestore.Timestamp.now();
        let event = {};
        event[accuser.uid] = {
            accuser: accuser.uid,
            createTime: nowTimeStamp,
            credit: accuseCredit,
            evidence: evidence,
            reason: reason,
            status: 0
        };
        modules.firestore.collection('accuse_users').doc(defendant).set(event, {merge: true}).then(ref => {
            console.log('Added document with ID: ', ref);
            return res.status(200).json({success: true, result: ref});
        }).catch(e => {
            console.log('Added document with error: ', e);
            return res.status(500).json({success: false, message: "update failed"});
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({success: false});
    }
}

module.exports = accuseUser;
