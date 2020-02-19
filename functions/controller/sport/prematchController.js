const model = require('../../model/sport/prematchModel');
async function prematch(req, res) {
  console.log(req.query.date);
  try {
    await model(req.query);
  } catch (error) {
    console.log(error);
  }

  res.json(req.query.date);
}
module.exports = prematch;
