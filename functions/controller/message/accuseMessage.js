const modules = require('../../util/modules');
const admin = modules.firebaseAdmin;

/**
 * @api {post} /messages/accuse Accuse message
 * @apiVersion 1.0.0
 * @apiName accuseMessage
 * @apiGroup Messages
 * @apiPermission login user
 *
 * @apiParam (Request body) {String} channelId channel ID
 * @apiParam (Request body) {String} messageId ID which is accused of having comment something illegal
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
async function accuseMessage(req, res) {
    try {
        if (!req.body.messageId || !req.body.channelId) return res.status(400).send();
        const accuserSnapshot = await modules.getSnapshot('users', req.token.uid);
        if (!accuserSnapshot.exists) return res.status(400).send();
        const messageSnapshot = await modules.getSnapshot(req.body.channelId, req.body.messageId);
        if (!messageSnapshot.exists) return res.status(400).send();
        const accuser = await accuserSnapshot.data();
        const message = await messageSnapshot.data();
        if (accuser.status < 1) return res.status(400).send();
        if (accuser.uid === message.user.uid) return res.status(400).send();

        const accuseCredit = accuser.accuseCredit ? accuser.accuseCredit : 0;
        const nowTimeStamp = admin.firestore.Timestamp.now();
        let event = {message: message.message.message, updateTime: nowTimeStamp};
        event[accuser.uid] = {
            accuser: accuser.uid,
            createTime: nowTimeStamp,
            credit: accuseCredit,
            defendant: message.user.uid,
            status: 0
        };
        modules.firestore.collection('accuse_messages').doc(message.message.messageId).set(event, {merge: true}).then(ref => {
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

module.exports = accuseMessage;
