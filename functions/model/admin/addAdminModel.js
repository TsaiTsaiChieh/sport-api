const modules = require('../../util/modules');

function addAdmin(args) {
  return new Promise(function(resolve, reject) {
    // console.log(args.uid);
    modules.firebaseAdmin.auth().setCustomUserClaims(args.uid, {});
    resolve(args.uid);
  });
}

module.exports = addAdmin;
