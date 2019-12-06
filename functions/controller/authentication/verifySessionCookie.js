const modules = require('../../util/modules');
const firebaseAdmin = modules.firebaseAdmin;

async function verifySessionCookie(req, res) {
    let sessionCookie = req.cookies.__session;
    if (!sessionCookie) return res.status(200).json({success: false, message: "authentication failed"});
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (!sessionCookie) return res.json({success: false});
    await firebaseAdmin.auth().verifySessionCookie(sessionCookie, true)
        .then((decodedClaims) => {
            console.log('Auth - verifySessionCookie success : ', decodedClaims);
            return res.status(200).json({success: true});
        })
        .catch(error => {
            console.log('Auth - verifySessionCookie false : ', error);
            return res.status(401).json({success: false});
        });
}

module.exports = verifySessionCookie;