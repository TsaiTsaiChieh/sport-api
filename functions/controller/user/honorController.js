// const modules = require('../../util/modules');
const honorModel = require('../../model/user/honorModel');

async function honor(req, res) {
  try {
    res.json(await honorModel(req));
  } catch (err) {
    console.error('[honorController]', err);
    res.status(err.code || 500).json(err.err || { code: 500, msg: '執行異常！' });
  }
}
module.exports = honor;
