const userUtils = require('../../util/userUtil');
const modules = require('../../util/modules');
const firebaseAdmin = modules.firebaseAdmin;

async function getUserProfile(req, res) {
    let sessionCookie = req.cookies.__session;
    if (!sessionCookie) return res.status(401).json({success: false, message: "authentication failed"});
    firebaseAdmin.auth().verifySessionCookie(
        sessionCookie, true)
        .then((decodedClaims) => {
            console.log('getUserProfile - verifySessionCookie success : ', decodedClaims);
            let uid = decodedClaims.uid;
            userUtils.getUserProfile(uid).then(async firestoreUser => {
                res.setHeader('Access-Control-Allow-Origin', '*');
                return res.status(200).json(firestoreUser)
            }).catch(error => {
                console.log('getUserProfile - getUserProfile false : ', error);
                return res.status(500).json({success: false, message: "getUserProfile failed"});
            });
        })
        .catch(error => {
            console.log('getUserProfile - verifySessionCookie false : ', error);
            return res.status(401).json({success: false, message: "verifySessionCookie failed"});
        });
}


module.exports = getUserProfile;