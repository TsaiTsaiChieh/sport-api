const userUtils = require('../../util/userUtil');
const modules = require('../../util/modules');
const firebaseAdmin = modules.firebaseAdmin;

async function firebaseLogin(req, res) {
    let returnJson = {success: false};
    let token = req.body.token;
    // let uid = req.body.uid;
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (!token) {
        console.log('Error login user: missing token');
        return res.status(400).json(returnJson);
    }
    firebaseAdmin.auth().verifyIdToken(token)
        .then((decodedIdToken) => {
            // Create session cookie and set it.
            let expiresIn = 60 * 60 * 24 * 7 * 1000;
            firebaseAdmin.auth().createSessionCookie(token, {expiresIn})
                .then(async function (sessionCookie) {
                    let firestoreUser = await userUtils.getUserProfile(decodedIdToken.uid);
                    returnJson.success = true;
                    if (firestoreUser) {
                        console.log("firestoreUser exist");
                        returnJson.uid = firestoreUser.uid;
                        returnJson.userStats = firestoreUser.userStats;
                        returnJson.userInfo = firestoreUser.data;
                    }
                    // let options = {maxAge: expiresIn, httpOnly: true};
                    let options = {maxAge: expiresIn, httpOnly: true, secure: true};
                    res.cookie('__session', sessionCookie, options);
                    return res.json(returnJson)
                })
                .catch(function (error) {
                    console.log('Error login user: \n\t', error);
                    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
                    return res.json({success: false})
                });
        });
}

module.exports = firebaseLogin;