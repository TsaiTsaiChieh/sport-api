const modules = require('../../util/modules');
const admin = modules.firebaseAdmin;


async function accuseUser(req, res) {
    try {
        console.log("accuse...");
        console.log(req.token);
        const accuserSnapshot = await modules.getSnapshot('users', req.token.uid);
        if (!accuserSnapshot.exists) return res.status(400);
        const accuser = await accuserSnapshot.data();
        if (accuser.status < 1) return res.status(400);
        if (accuser.uid === req.token.uid) return res.status(400);

        //對象 defendant
        const defendant = req.body.defendant;

        //原因[打廣告，內容不實，灌水洗版，人身攻擊，其它]
        const reason = req.body.reason;
        //照片
        const evidence = req.body.evidence;
        const accuseCredit = accuser.accuseCredit ? accuser.accuseCredit : 0;
        const nowTimeStamp = admin.firestore.Timestamp.now();
        const accuserUID = accuser.uid;
        let event = {};
        event[accuserUID] = {
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
