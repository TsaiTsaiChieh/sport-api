const { redis } = require('../../util/redisUtil');

async function redisDel(req, res) {
  try {
    await redis.specialDel(req.body.target, 100);
    res.json({ status: 'success!' });
  } catch (err) {
    console.error('err....', err);
    res.status(err.code).json(err);
  }
}

module.exports = redisDel;
