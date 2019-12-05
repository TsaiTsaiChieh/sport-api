const userUtils = require('../../util/userUtil');
const modules = require('../../util/modules');
const firebaseAdmin = modules.firebaseAdmin;

async function modifyUserProfile(req, res) {
    let sessionCookie = req.cookies.__session;
    firebaseAdmin.auth().verifySessionCookie(
        sessionCookie, true)
        .then((decodedClaims) => {
            console.log('Auth - verifySessionCookie success : ', decodedClaims);
            let uid = decodedClaims.uid;
            userUtils.getUserProfile(uid).then(async firestoreUser => {
                let data = {};
                switch (firestoreUser.userStats) {
                    case 0: //新會員
                        if (!req.body.displayName || !req.body.name || !req.body.phone || !req.body.email || !req.body.birthday)
                            res.status(400).json({success: false, message: 'missing info'});
                        data.displayName = req.body.displayName;    //only new user can set displayName, none changeable value
                        data.name = req.body.name;                  //only new user can set name(real name), none changeable value
                        data.phone = req.body.phone;
                        data.email = req.body.email;
                        data.birthday = modules.firestore.Timestamp.fromDate(new Date(req.body.birthday)); //only new user can set birthday, none changeable value
                        if (!req.body.avatar) data.avatar = "https://this.is.defaultAvatar.jpg";
                        data.userStats = 1;
                        data.signature = "";
                        data.blockMessage = 0;
                        data.denys = [];
                        data.coin = 0;  //搞幣
                        data.dividend = 0;  //搞紅利
                        data.ingot = 0; //搞錠
                        data.title = "一般會員";
                        data.point = 0;
                        break;
                    case 1: //一般會員
                        console.log("normal user");
                        break;
                    case 2: //大神
                        console.log("godlike user");
                        break;
                    case 3: //鎖帳號會員
                        console.log("blocked user");
                        res.status(400).json({success: false, message: 'blocked user'});
                        break;
                    case 9: //管理員
                        console.log("manager user");
                        break;
                    default:
                        throw 'userStats error';
                }
                if (req.body.avatar) data.avatar = req.body.avatar;
                if (req.body.email) data.email = req.body.email;
                if (req.body.phone) data.phone = req.body.phone;
                if (req.body.signature) data.signature = req.body.signature;
                let refCode = req.body.refCode;
                if (refCode) {
                    // refCode regular expression test
                    // /^[a-zA-Z0-9]{28}$/g.test(refCode)
                    // /^[U][a-f0-9]{32}$/g.test(refCode)
                    if (/^[a-zA-Z0-9]{28}$/g.test(refCode) === true || /^[U][a-f0-9]{32}$/g.test(refCode) === true) {
                        await userUtils.getUserProfile(refCode).then(referrer => {
                            if (referrer.data) {
                                // process Ref Point
                                // deny if refer each other
                                console.log("set refCode : ", refCode);
                                if (referrer.data.referrer !== uid && refCode !== uid) {
                                    if (firestoreUser.userStats === 0) {
                                        console.log("set refCode give point: ", refCode);
                                        data.point = 333;
                                        data.referrer = refCode;
                                    } else {
                                        if (!firestoreUser.data.referrer) {
                                            data.point = 666;
                                            data.referrer = refCode;
                                        }
                                    }
                                }
                            }
                        });
                    }
                }
                res.setHeader('Access-Control-Allow-Origin', '*');
                console.log("user profile updated : ", JSON.stringify(data, null, '\t'));

                modules.firestore.collection('users').doc(uid).set(data, {merge: true}).then(ref => {
                    console.log('Added document with ID: ', ref);
                    res.json({success: true, result: ref});
                }).catch(e => {
                    console.log('Added document with error: ', e);
                    res.json({success: false, message: "update failed"});
                });
                // res.json({success: true, result: writeResult});
            }).catch(error => {
                console.log('Auth - getUserProfile false : ', error);
                res.json({success: false, message: "getUserProfile failed"});
            });
        })
        .catch(error => {
            console.log('Auth - verifySessionCookie false : ', error);
            res.json({success: false, message: "verifySessionCookie failed"});
        });
}

module.exports = modifyUserProfile;