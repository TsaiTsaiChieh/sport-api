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
        const args = {};
        args.defendant = req.body.defendant;
        args.reason = req.body.reason;
        args.evidence = req.body.evidence;
        const schema = {
            type: 'object',
            required: ['defendant', 'reason', 'evidence'],
            properties: {
                defendant: {type: 'string', minLength: 28, maxLength: 33},
                reason: {type: 'string', minLength: 2, maxLength: 50},
                evidence: {type: 'string', format: 'url'}
            }
        };
        const valid = modules.ajv.validate(schema, args);
        if (!valid) return res.status(400).json(modules.ajv.errors);
        // if (!req.body.defendant || req.body.reason || req.body.evidence) return res.status(400).send();
        const accuserSnapshot = await modules.getSnapshot('users', req.token.uid);
        if (!accuserSnapshot.exists) return res.status(400).send();
        const accuser = await accuserSnapshot.data();
        if (accuser.status < 1) return res.status(400).send();
        if (accuser.uid === args.defendant) return res.status(400).send();
        const accuseCredit = accuser.accuseCredit ? accuser.accuseCredit : 0;
        const nowTimeStamp = admin.firestore.Timestamp.now();
        let event = {};
        event[accuser.uid] = {
            accuser: accuser.uid,
            createTime: nowTimeStamp,
            credit: accuseCredit,
            evidence: args.evidence,
            reason: args.reason,
            status: 0
        };
        modules.firestore.collection('accuse_users').doc(args.defendant).set(event, {merge: true}).then(ref => {
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
