const modules = require('../../util/modules');
const firebaseAdmin = modules.firebaseAdmin;

async function verifySessionCookie(req, res) {
    let sessionCookie = req.cookies.__session;
    console.log("verifySessionCookie cookie, ", sessionCookie);
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (!sessionCookie) return res.json({success: false});
    await firebaseAdmin.auth().verifySessionCookie(sessionCookie, true)
        .then((decodedClaims) => {
            console.log('Auth - verifySessionCookie success : ', decodedClaims);
            return res.json({success: true});
        })
        .catch(error => {
            console.log('Auth - verifySessionCookie false : ', error);
            return res.json({success: false});
        });
}

module.exports = verifySessionCookie;