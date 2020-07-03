const { to } = require('./modules');
const { redisConfig } = require('../config/redisConfig');
const Redis = require('ioredis');
const redis = new Redis(redisConfig.REDISPORT, redisConfig.REDISHOST, {
  maxRetriesPerRequest: 1
});
redis.on('error', (err) => console.error('[REDIS]', err));

// Cache
function Cache() {}
Cache.get = async function(key) {
  const [err, res] = await to(redis.get(key));
  if (err) {console.error('[REDIS][Cache.get]', err); return null;}
  return JSON.parse(res);
};

Cache.set = async function(key, value) {
  value = JSON.stringify(value);
  const [err] = await to(redis.set(key, value));
  if (err) {console.error('[REDIS][Cache.set]', err); }
};

// Special Delete
const deleteScript = `
  local all_keys = {};
  local keys = {};
  local done = false;
  local cursor = "0"
  repeat
      local result = redis.call("SCAN", cursor, "match", KEYS[1], "count", KEYS[2])
      cursor = result[1];
      keys = result[2];
      for i, key in ipairs(keys) do
          all_keys[#all_keys+1] = key;
      end
      if cursor == "0" then
          done = true;
      end
  until done
  for i, key in ipairs(all_keys) do
      redis.call("DEL", key);
  end
  return true;
`;

redis.defineCommand('specialDel', {
  numberOfKeys: 2,
  lua: deleteScript
});

// 底下是使用 npm redis 的版本 不支援 promise
// redisClient
// redisClient.set("hello", "world"), function(err) { console.error(err); });
// redisClient.get("hello", function(err, res) { console.error(err, res); });
// const redisClient = redis.createClient(redisConfig.REDISPORT, redisConfig.REDISHOST);
// redisClient.on('error', (err) => console.error('[REDIS]', err));

// promisify
// await redisGet(key)
// await redisSet(key, value)
// const { promisify } = require('util');
// const redisGet = promisify(redisClient.get).bind(redisClient);
// const redisSet = promisify(redisClient.set).bind(redisClient);
// const redisEval = promisify(redisClient.eval).bind(redisClient);

// Cache
// await Cache.get(key) => value with object
// await Cache.set(key, value)
// function Cache() {}
// Cache.get = function(key) {
//   return new Promise((resolve, reject) => {
//     redisClient.get(key, function(err, res) {
//       if (err) {console.error('[REDIS]', err); return resolve(null);} // return reject(err);
//       return resolve(JSON.parse(res));
//     });
//   });
// };

// Cache.set = function(key, value) {
//   value = JSON.stringify(value);
//   return new Promise((resolve, reject) => {
//     redisClient.set(key, value, function(err) {
//       if (err) {console.error('[REDIS]', err); } // return reject(err);
//       resolve();
//     });
//   });
// };

const redisUtil = {
  redis,
  Cache
  // redisClient,
  // redisGet,
  // redisSet,
  // redisEval
};

module.exports = redisUtil;
