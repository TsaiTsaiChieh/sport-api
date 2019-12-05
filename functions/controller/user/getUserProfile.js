const userUtils = require('../../util/userUtil');
const modules = require('../../util/modules');
const firebaseAdmin = modules.firebaseAdmin;

async function getUserProfile(req, res) {
    let sessionCookie = req.cookies.__session;
    if (!sessionCookie) {
        res.json({success: false, message: "verifySessionCookie failed"});
    } else {
        firebaseAdmin.auth().verifySessionCookie(
            sessionCookie, true)
            .then((decodedClaims) => {
                console.log('getUserProfile - verifySessionCookie success : ', decodedClaims);
                let uid = decodedClaims.uid;
                userUtils.getUserProfile(uid).then(async firestoreUser => {
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    res.json(firestoreUser)
                }).catch(error => {
                    console.log('getUserProfile - getUserProfile false : ', error);
                    res.json({success: false, message: "getUserProfile failed"});
                });
            })
            .catch(error => {
                console.log('getUserProfile - verifySessionCookie false : ', error);
                res.json({success: false, message: "verifySessionCookie failed"});
            });
    }
}


module.exports = getUserProfile;