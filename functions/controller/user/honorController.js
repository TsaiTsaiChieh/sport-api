const modules = require('../../util/modules');
const honorModel = require('../../model/user/honorModel');

async function honor(req, res) {
    try {
        res.json(await honorModel(req.params.uid));
    } catch (err) {
        res.status(err.code).json(err.err);
    }
}
module.exports = honor;
