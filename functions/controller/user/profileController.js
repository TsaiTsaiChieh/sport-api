
const model = require('../../model/user/profileModel');
// This controller did not have any ajv validation, just pass valid user uid
async function profile(req, res) {
  try {
    res.json(await model(req.token.uid));
  } catch (err) {
    console.error('Error in controller/user/profile function by TsaiChieh', err);
    res.status(err.code).json(err.isPublic ? { error: err.name, devcode: err.status, message: err.message } : err.code);
  }
}
module.exports = profile;
