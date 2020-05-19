const model = require('../../model/home/bannerContentModel');
async function bannerContent(req, res) {
  let id = Number(req.params.id);
  if (isNaN(id) || !Number.isInteger(id) || id < 0 || id > 9999999) {
    res.status(400).json({ error: 'no id' });
    return;
  } else {
    id = Number(req.params.id);
  }
  model({ req: req, id: id })
    .then(function(body) {
      res.json(body);
    })
    .catch(function(err) {
      res.status(err.code).json(err);
    });
}
module.exports = bannerContent;
