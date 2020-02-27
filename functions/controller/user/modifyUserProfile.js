const userUtils = require('../../util/userUtil');
const modules = require('../../util/modules');
const admin = modules.firebaseAdmin;
const envValues = require('../../config/env_values');



async function modifyUserProfile(req, res) {
    let sessionCookie = req.cookies.__session;
    console.log("session Cookie...", sessionCookie);
    if (!sessionCookie) {
        res.status(401).send();
        return;
    }
    let uid = req.token.uid;
    const userSnapshot = await modules.getSnapshot('users', uid);
    const userProfile = await userSnapshot.data();
    let userStatus = userSnapshot.exists ? userProfile.status : 0;
    let data = {};
    let nowTimeStamp = await admin.firestore.Timestamp.now();
    switch (userStatus) {
        case 0: //新會員
            const args = {};
            args.displayName = req.body.displayName;
            args.name = req.body.name;
            args.phone = req.body.phone;
            args.email = req.body.email;
            args.birthday = req.body.birthday;
            args.avatar = req.body.avatar;
            args.signature = req.body.signature;
            const schema = {
                type: 'object',
                required: ['displayName', 'name', 'phone', 'email', 'birthday'],
                properties: {
                    displayName: {type: 'string', minLength: 2, maxLength: 15},
                    name: {type: 'string', minLength: 2, maxLength: 10},
                    phone: {type: 'string', minLength: 10, maxLength: 15},
                    email: {type: 'string', format: 'email'},
                    birthday: {type: 'integer'},
                    avatar: {type: 'string', format: 'url'},
                    signature: {type: 'string', maxLength: 50}
                }
            };
            const valid = modules.ajv.validate(schema, args);
            console.log(modules.ajv.errors);
            // if (!valid) return res.status(400).json(modules.ajv.errors);
            if (!valid) {
                res.status(400).json(modules.ajv.errors)
                return;
            }
            const uniqueNameSnapshot = await modules.firestore.collection('uniqueName').doc(args.displayName).get();
            const uniqueEmailSnapshot = await modules.firestore.collection('uniqueEmail').doc(args.email).get();
            const uniquePhoneSnapshot = await modules.firestore.collection('uniquePhone').doc(args.phone).get();
            if (uniqueNameSnapshot.exists || uniqueEmailSnapshot.exists || uniquePhoneSnapshot.exists) {
                res.status(400).json({success: false, message: 'user name , email or phone exists'});
                return;
            } else {
                modules.firestore.collection('uniqueName').doc(args.displayName).set({uid: uid});
                modules.firestore.collection('uniqueEmail').doc(args.email).set({uid: uid});
                modules.firestore.collection('uniquePhone').doc(args.phone).set({uid: uid});
            }
            data.uid = uid;
            data.displayName = args.displayName;    //only new user can set displayName, none changeable value
            data.name = args.name;                  //only new user can set name(Actual name), none changeable value
            data.phone = args.phone;
            data.email = args.email;
            data.birthday = admin.firestore.Timestamp.fromDate(new Date(req.body.birthday));
            if (!args.avatar) data.avatar = `${envValues.productURL}statics/default-profile-avatar.jpg`;
            data.status = 1;
            data.signature = "";
            data.blockMessage = nowTimeStamp;
            data.createTime = nowTimeStamp;
            data.denys = [];
            data.coin = 0;  //搞幣
            data.dividend = 0;  //搞紅利
            data.ingot = 0; //搞錠
            data.titles = [];
            data.defaultTitle = {};
            data.point = 0;
            data.blockCount = 0;
            data.accuseCredit = 20; //檢舉信用值預設20，limit 100
            admin.auth().updateUser(uid, {
                // email: req.body.email,
                // phoneNumber: req.body.phone,
                displayName: req.body.displayName
            });
            admin.auth().setCustomUserClaims(uid, {role: 1});
            break;
        case 1: //一般會員
            console.log("normal user");
            break;
        case 2: //大神
            console.log("godlike user");
            break;
        case -1: //鎖帳號會員
            console.log("blocked user");
            res.status(400).json({success: false, message: 'blocked user'});
            break;
        case 9: //管理員
            console.log("manager user");
            break;
        default:
            throw 'user status error';
    }
    if (req.body.avatar) {
        data.avatar = req.body.avatar;
        admin.auth().updateUser(uid, {
            photoURL: req.body.avatar
        });
    }
    // if (req.body.email) data.email = req.body.email;
    // if (req.body.phone) data.phone = req.body.phone;
    if (req.body.signature) data.signature = req.body.signature;
    if (req.body.title) data.defaultTitle = req.body.title;
    data.updateTime = nowTimeStamp;
    let resultJson = {};
    const refCode = req.body.refCode;
    const userReferrer = userSnapshot.exists ? userProfile.referrer : undefined;
    if (refCode && !userReferrer && refCode !== uid) {
        // refCode regular expression test
        // /^[a-zA-Z0-9]{28}$/g.test(refCode)
        // /^[U][a-f0-9]{32}$/g.test(refCode)
        if (/^[a-zA-Z0-9]{28}$/g.test(refCode) === true || /^[U][a-f0-9]{32}$/g.test(refCode) === true) {
            const referrerSnapshot = await modules.getSnapshot('users', refCode);
            if (referrerSnapshot.exists) {
                const referrerProfile = await referrerSnapshot.data();
                // process Ref Point
                // deny if refer each other
                if (referrerProfile.referrer !== uid && referrerProfile.status > 0) {
                    console.log("set refCode give point: ", refCode);
                    const userPoint = userSnapshot.exists ? userProfile.point : 0;
                    data.point = userPoint + 200;
                    data.referrer = refCode;
                    resultJson.refPoint = data.point;
                }
            }
        }
    }
    console.log("user profile updated : ", JSON.stringify(data, null, '\t'));
    modules.firestore.collection('users').doc(uid).set(data, {merge: true}).then(async ref => {
        const userResult = await userUtils.getUserProfile(uid);
        resultJson.data = userResult;
        resultJson.success = true;
        console.log('Added document with ID: ', ref);
        res.status(200).json(resultJson);
    }).catch(e => {
        console.log('Added document with error: ', e);
        res.status(500).json({success: false, message: "update failed"});
    });
    // res.json({success: true, result: writeResult});
}


module.exports = modifyUserProfile;
