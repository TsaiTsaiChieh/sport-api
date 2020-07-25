const modules = require('../../util/modules');
const ajv = require('../../util/ajvUtil');
const model = require('../../model/home/carouselModel');
async function carouselHome(req, res) {
  const schema = {
    required: ['time'],
    properties: {
      time: {
        type: 'string'
      }
    }
  };

  const valid = ajv.validate(schema, req.query);
  if (!valid) {
    return res.status(modules.httpStatus.BAD_REQUEST).json(ajv.errors);
  }
  try {
    res.json(await model(req.query));
  } catch (err) {
    console.error('Error in controller/home/carouselHome by DY', err);
    res
      .status(err.code)
      .json(
        err.isPublic
          ? { error: err.name, devcode: err.status, message: err.message }
          : err.code
      ); // 再觀察
  }
}

module.exports = carouselHome;
