const express = require('express');
const router = express.Router();
const userUtils = require('../../util/userUtil');
const modules = require('../../util/modules');
const admin = modules.firebaseAdmin;


/**
 * @api {post} /user/modifyUserProfile Modify User Profile
 * @apiVersion 1.0.0
 * @apiName modifyUserProfile
 * @apiGroup User
 * @apiPermission login user
 *
 * @apiParam (Request cookie) {JWT} __session token generate from firebase Admin SDK
 * @apiParam (Request body) {URL} avatar URL of avatar from Firestorage
 * @apiParam (Request body) {String} name Actual name (Non changeable)
 * @apiParam (Request body) {String} displayName Nick Name (Unique,Non changeable)
 * @apiParam (Request body) {String} phone mobile number with area code (Unique,Non changeable)
 * @apiParam (Request body) {String} email email address (Unique,Non changeable)
 * @apiParam (Request body) {Number} birthday birthday UTC timestamp (Non changeable)
 * @apiParam (Request body) {String} signature signature
 * @apiParam (Request body) {String} refCode UID of referrer (Non changeable)
 *
 *
 * @apiSuccess {JSON} result Execute Result
 *
 * @apiSuccessExample New User:
 *  HTTP/1.1 200 OK
 {
    "success": true,
    "result": {
        "_writeTime": {
            "_seconds": 1575946694,
            "_nanoseconds": 556654000
        }
    }
 }
 *
 *
 * @apiError TokenMissing session cookie not exist.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Token Missing
 {
    "success": false,
    "message": "getUserProfile failed"
 }
 */
async function modifyUserProfile(req, res) {
    let sessionCookie = req.cookies.__session;
    admin.auth().verifySessionCookie(
        sessionCookie, true)
        .then((decodedClaims) => {
            console.log('Auth - verifySessionCookie success : ', decodedClaims);
            let uid = decodedClaims.uid;
            userUtils.getUserProfile(uid).then(async firestoreUser => {
                let data = {};
                let nowTimeStamp = admin.firestore.Timestamp.now();
                switch (firestoreUser.status) {
                    case 0: //新會員
                        if (!req.body.displayName || !req.body.name || !req.body.phone || !req.body.email || !req.body.birthday)
                            res.status(400).json({success: false, message: 'missing info'});
                        data.displayName = req.body.displayName;    //only new user can set displayName, none changeable value
                        data.name = req.body.name;                  //only new user can set name(Actual name), none changeable value
                        data.phone = req.body.phone;
                        data.email = req.body.email;
                        data.birthday = admin.firestore.Timestamp.fromDate(new Date(req.body.birthday)); //only new user can set birthday, none changeable value
                        if (!req.body.avatar) data.avatar = "https://this.is.defaultAvatar.jpg";
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
                        throw 'user status error';
                }
                if (req.body.avatar) data.avatar = req.body.avatar;
                if (req.body.email) data.email = req.body.email;
                if (req.body.phone) data.phone = req.body.phone;
                if (req.body.signature) data.signature = req.body.signature;
                data.updateTime = nowTimeStamp;
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
                                    if (firestoreUser.status === 0) {
                                        console.log("set refCode give point: ", refCode);
                                        data.point = 0;
                                        data.referrer = refCode;
                                    } else {
                                        if (!firestoreUser.data.referrer) {
                                            data.point = 0;
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
                    res.status(500).json({success: false, message: "update failed"});
                });
                // res.json({success: true, result: writeResult});
            }).catch(error => {
                console.log('Auth - getUserProfile false : ', error);
                res.status(500).json({success: false, message: "getUserProfile failed"});
            });
        })
        .catch(error => {
            console.log('Auth - verifySessionCookie false : ', error);
            res.status(401).json({success: false, message: "verifySessionCookie failed"});
        });
}


module.exports = modifyUserProfile;