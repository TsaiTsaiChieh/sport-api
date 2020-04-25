const modules = require('../../util/modules');
const model = require('../../model/user/godSellInformationModel');

async function godSellInformation(req, res) {
  const schema = {
    type: 'object',
    required: ['league', 'date', 'desc', 'tips'],
    properties: {
      league: {
        type: 'string',
        enum: ['NBA']
      },
      date: {
        type: 'string',
        format: 'date'
      },
      desc: {
        type: 'string',
        pattern:
          '^[ \u4e00-\u9fa5_a-zA-Z0-9\u3105-\u3129\u02CA\u02C7\u02CB\u02D9<>，,。.:：!！;；*＊()（）「」『』@#＃&＆+-=%％]+$', // 允許中英文底線空格特殊符號
        minLength: 0,
        maxLength: 100
      },
      tips: {
        type: 'string',
        pattern:
          '^[ \u4e00-\u9fa5_a-zA-Z0-9\u3105-\u3129\u02CA\u02C7\u02CB\u02D9<>，,。.:：!！;；*＊()（）「」『』@#＃&＆+-=%％]+$', // 允許中英文底線空格特殊符號
        minLength: 0,
        maxLength: 500
      }
    }
  };
  const args = {
    token: req.token,
    league: req.query.league,
    date: req.query.date,
    desc: req.body.desc,
    tips: req.body.tips
  };
  const valid = modules.ajv.validate(schema, args);
  if (!valid) {
    return res.status(modules.httpStatus.BAD_REQUEST).json(modules.ajv.errors);
  }

  try {
    res.json(await model(args));
  } catch (err) {
    console.error(
      'Error in controller/user/godSellInformation function by TsaiChieh',
      err
    );
    res
      .status(err.code)
      .json(
        err.isPublic
          ? { error: err.name, devcode: err.status, message: err.message }
          : err.code
      );
  }
}

module.exports = godSellInformation;
