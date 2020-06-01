const path = require('path');
const fs = require('fs');
const isEmulator = process.env.FUNCTIONS_EMULATOR;
// 測試站DB
const instance = 'sportslottery-test:us-central1:do-sports';
// 正式站DB
// const instance = 'getsports-gsi:us-central1:getsports-cloudsql';
const SSL = {
  key: fs.readFileSync(path.join(__dirname, '../auth/client-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../auth/client-cert.pem')),
  ca: fs.readFileSync(path.join(__dirname, '../auth/server-ca.pem')),
  // ref: https://stackoverflow.com/questions/52465530/sequelize-connection-timeout-while-using-serverless-aurora-looking-for-a-way-to
  connectTimeout: 60000 // The milliseconds before a timeout occurs during the initial connection to the MySQL server.
};
const host = isEmulator ? '35.188.137.1' : `/cloudsql/${instance}`;
const dialectOptions = isEmulator
  ? { ssl: SSL }
  : { socketPath: host, connectTimeout: 60000 };
const setting = {
  db_name: {
    dev: 'dosport'
  },
  db_user: 'root',
  db_password: 'dosportsSQL',
  host: host,
  dialect: 'mysql',
  dialectOptions: dialectOptions,
  pool: {
    max: 50,
    min: 5, // Minimum number of connection in pool
    acquire: 3000, // The maximum time, in milliseconds, that pool will try to get connection before throwing error
    idle: 30000 // The maximum time, in milliseconds, that a connection can be idle before being released
  },
  timezone: '+08:00'
};
module.exports = { setting };
