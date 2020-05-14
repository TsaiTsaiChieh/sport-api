const db = require('../../util/dbUtil');

async function connection(req, res) {
  try {
    await db.sequelize.authenticate();
    res.send('Connection has been established successfully.');
  } catch (err) {
    res.status(500).json({
      msg: 'Unable to connect to the database',
      error: err
    });
  }
}
module.exports = connection;
