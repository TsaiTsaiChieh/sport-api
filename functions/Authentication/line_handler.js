const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
const envValues = require('../Configs/env_values');
const userUtils = require('../Utils/userUtil');
const shortcutFunction = require('../shortcut_function');
const admin = shortcutFunction.lazyFirebaseAdmin(envValues.cert);

router.get('/', (req, res) => {
        const lineAccessToken = req.query.code;
        // const lineState = req.query.state;

        // https://api.line.me/oauth2/v2.1/token`
        lineLogin.issue_access_token(lineAccessToken).then((token_response) => {
            let decoded_id_token;
            try {
                decoded_id_token = jwt.verify(
                    token_response.id_token,
                    envValues.lineConfig.channelSecret,
                    {
                        audience: envValues.lineConfig.channelID,
                        issuer: "https://access.line.me",
                        algorithms: ["HS256"]
                    }
                );
                console.log("id token verification succeeded.");
                console.log("test state", JSON.stringify(token_response));
                token_response.id_token = decoded_id_token;

                // if (!secure_compare(decoded_id_token.nonce, req.session.line_login_nonce)) {
                //     res.status(500).send({error: 'login failed! nonce error'});
                // }

                lineLogin.verify_access_token(token_response.access_token).then((verify_response) => {
                    if (verify_response.client_id !== envValues.lineConfig.channelID) {
                        return Promise.reject(new Error('Line channel ID mismatched'));
                    }
                    userUtils.getFirebaseUser(token_response).then(userRecord => {
                        admin.auth().createCustomToken(userRecord.uid).then(token => {
                            const expiresIn = 60 * 5 * 1000;
                            const options = {
                                maxAge: expiresIn,
                            };
                            res.cookie('auth_token', token, options);
                            res.redirect(307, 'https://sport19y0715.web.app/line_login.html');
                        })
                    }).catch(function (err) {
                        console.log("id token verification failed.", err);
                        res.status(500).send({error: 'login failed!'});
                    })
                })
            } catch (exception) {
                console.log("id token verification failed.");
                res.status(500).send({error: 'login failed!'});
            }
        });
    }
);

module.exports = router;