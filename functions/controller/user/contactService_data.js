/* eslint-disable promise/always-return */
const db = require('../../util/dbUtil');
async function contactService(req, res) {
  try {
    const result = await db.sequelize.models.service__contact.findAll({
      distinct: true,
      raw: true
    });
    res.json(result);
  } catch (error) {
    console.log(error);
    res.send('get topics failed');
  }
};

module.exports = contactService;
