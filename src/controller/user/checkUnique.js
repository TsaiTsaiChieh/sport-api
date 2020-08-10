const userUtils = require('../../util/userUtil');
const ajv = require('../../util/ajvUtil');
const httpStatus = require('http-status');
/**
 * @api {get} /user/checkUnique Check Unique profile
 * @apiVersion 1.0.0
 * @apiName checkUnique
 * @apiGroup User
 * @apiPermission none
 *
 * @apiParam (Request body) {String} type uniqueName,uniqueEmail,uniquePhone
 * @apiParam (Request body) {String} value string value of name, email or phone number
 *
 * @apiSuccess {JSON} result api result
 *
 * @apiSuccessExample exist:
 *  HTTP/1.1 200 OK
 {
    "success": true,
    "isExist": true
}
 *
 * @apiSuccessExample Not exist:
 *  HTTP/1.1 200 OK
 {
    "success": true,
    "isExist": false
}
 *
 * @apiError parameter parameter error
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 parameter error
 {
    "success": false
}
 */// Unique collections: uniqueName,uniqueEmail,uniquePhone
async function checkUnique(req, res) {
  try {
    const collection = req.body.type;
    const value = req.body.value;
    let schema;
    if (collection.type === 'uniqueEmail') {
      schema = {
        type: 'object',
        required: ['type', 'value'],
        properties: {
          type: { type: 'string', enum: ['uniqueName', 'uniquePhone', 'uniqueEmail'] },
          value: { type: 'string', minLength: 5, maxLength: 50, format: 'email2' }
        }
      };
    } else {
      schema = {
        type: 'object',
        required: ['type', 'value'],
        properties: {
          type: { type: 'string', enum: ['uniqueName', 'uniquePhone', 'uniqueEmail'] },
          value: { type: 'string', minLength: 2, maxLength: 15, format: 'generalString' }
        }
      };
    }
    console.log(req.body);
    const valid = ajv.validate(schema, req.body);
    if (!valid) {
      return res.status(httpStatus.BAD_REQUEST).json(ajv.errors);
    }
    return res.json(await userUtils.checkUniqueCollection(collection, value));
  } catch (e) {
    console.log(e);
    return res.status(500).json({ success: false });
  }
}

module.exports = checkUnique;
