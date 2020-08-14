const { Sequelize } = require('sequelize');
const to = require('await-to-js').default;
const { logger } = require('./loggerUtil');

const { redisConfig } = require('../config/env_values');
const Redis = require('ioredis');
const redis = new Redis(redisConfig.REDISPORT, redisConfig.REDISHOST, {
  maxRetriesPerRequest: 1
});
redis.on('error', (err) => logger.warn('[REDIS]', err));

// Cache
function Cache() {}
Cache.get = async function(key) {
  const [err, res] = await to(redis.get(key));
  if (err) {logger.warn('[Error][REDIS][Cache.get]', err); return null;}
  return JSON.parse(res);
};

Cache.set = async function(key, value) {
  value = JSON.stringify(value);
  const [err] = await to(redis.set(key, value));
  if (err) {logger.warn('[Error][REDIS][Cache.set]', err); }
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

async function CacheQuery(sequelize, sql, params, redisKey) {
  const cacheData = await Cache.get(redisKey);
  if (cacheData) return cacheData; // not empty return cache data

  const [err, lists] = await to(sequelize.query(sql, params));
  if (err) throw err;

  if (lists) await Cache.set(redisKey, lists); // not empty set cache data
  return lists;
}

// 特製 findOne 結合 Redis Cache redisKey 使用 where parms 參數
Sequelize.Model.findOneCache = async function() {
  let redisKey;
  for (const parms of Object.values(arguments)) {
    if (parms.where) {
      redisKey = [this.name, JSON.stringify(parms.where)].join(':');
    }
  }
  const cacheValue = await Cache.get(redisKey);
  if (cacheValue) return JSON.parse(cacheValue);

  const result = await Sequelize.Model.findOne.apply(this, arguments);
  Cache.set(redisKey, JSON.stringify(result));
  return result;
};

// 底下是使用 npm redis 的版本 不支援 promise
// redisClient
// redisClient.set("hello", "world"), function(err) { logger.warn(err); });
// redisClient.get("hello", function(err, res) { logger.warn(err, res); });
// const redisClient = redis.createClient(redisConfig.REDISPORT, redisConfig.REDISHOST);
// redisClient.on('error', (err) => logger.warn('[REDIS]', err));

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
//       if (err) {logger.warn('[REDIS]', err); return resolve(null);} // return reject(err);
//       return resolve(JSON.parse(res));
//     });
//   });
// };

// Cache.set = function(key, value) {
//   value = JSON.stringify(value);
//   return new Promise((resolve, reject) => {
//     redisClient.set(key, value, function(err) {
//       if (err) {logger.warn('[REDIS]', err); } // return reject(err);
//       resolve();
//     });
//   });
// };

const redisUtil = {
  redis,
  Cache,
  CacheQuery
  // redisClient,
  // redisGet,
  // redisSet,
  // redisEval
};

module.exports = redisUtil;
