const modules = require('../../util/modules');
const model = require('../../model/user/predictionHistoryModel');

async function predictionHistory(req, res) {
  const now = new Date();
  const schema = {
    type: 'object',
    required: ['uid'],
    properties: {
      uid: {
        type: 'string',
        pattern: modules.acceptNumberAndLetter,
        // 當使用者登入時，query 不帶 uid 參數，default 為登入者 uid
        // 當使用者登入時，query 可帶他人的 uid 參數，看他人的歷史紀錄
        // 使用者可不登入，query 帶他人 uid 來看他人的歷史紀錄
        default: req.query.uid ? req.query.uid
          : (req.token ? req.token.uid : req.token)
      }
    }
  };

  const valid = modules.ajv.validate(schema, req.query);
  if (!valid) return res.status(modules.httpStatus.BAD_REQUEST).json(modules.ajv.errors);

  const args = {
    now,
    uid: schema.properties.uid.default
  };

  try {
    return res.json(await model(args));
  } catch (err) {
    console.error('Error in controller/user/predictionHistoryController by TsaiChieh', err);
    res.status(err.code)
      .json(err.isPublic
        ? { error: err.name, devcode: err.status, message: err.message }
        : err.code);
  }
}

module.exports = predictionHistory;
