// const modules = require('../../util/modules');
const unreadModel = require('../../model/user/unreadModel');

async function transfer(req, res) {
  try {
    res.json(await unreadModel(req));
  } catch (err) {
    console.error('[unreadController]', err);
    res.status(err.code || 500).json(err.err || { code: 500, msg: '執行異常！' });
  }
}
module.exports = transfer;
