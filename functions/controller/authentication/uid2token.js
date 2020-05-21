
const modules = require('../../util/modules');
const firebase = modules.firebase;
const firebaseAdmin = modules.firebaseAdmin;
const envValues = require('../../config/env_values');

async function uid2token(req, res) {
  const firebaseUid = req.body.uid;

  const customToken = await firebaseAdmin.auth().createCustomToken(firebaseUid)
    .catch(function(error) {
      console.log('Error creating custom token:', error);
      res.status(401).json(error);
    });

  firebase.initializeApp(envValues.firebaseConfig);

  // 用自定token登入
  const signInInfo = await firebase.auth().signInWithCustomToken(customToken)
    .catch(function(error) {
      console.log('Error custom token signInWithCustomToken:', error);
      res.status(401).json(error);
    });

  res.status(200).json(signInInfo);
}

module.exports = uid2token;
