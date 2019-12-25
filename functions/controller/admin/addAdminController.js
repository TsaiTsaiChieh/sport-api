const modules = require('../../util/modules');
const addAdminModel = require('../../model/admin/addAdminModel');

async function addAdmin(req, res) {
  try {
    res.json(await addAdminModel(req.body));
  } catch (err) {
    console.log('err in controller', err);
    res.status(err.code).json(err);
  }

  // addAdminModel(req.body)
  //   .then(function(body) {
  //     res.json(body);
  //   })
  //   .catch(function(err) {
  //     res.status(err.code).json(err);
  //   });
}

module.exports = addAdmin;
