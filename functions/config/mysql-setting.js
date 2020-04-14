const path = require('path');
const modules = require('../util/modules');
const isEmulator = process.env.FUNCTIONS_EMULATOR;
const instance = 'sportslottery-test:us-central1:do-sports';
const SSL = {
  key: modules.fs.readFileSync(path.join(__dirname, '../auth/client-key.pem')),
  cert: modules.fs.readFileSync(
    path.join(__dirname, '../auth/client-cert.pem')
  ),
  ca: modules.fs.readFileSync(path.join(__dirname, '../auth/server-ca.pem')),
  // ref: https://stackoverflow.com/questions/52465530/sequelize-connection-timeout-while-using-serverless-aurora-looking-for-a-way-to
  connectTimeout: 60000 // The milliseconds before a timeout occurs during the initial connection to the MySQL server.
};
const host = isEmulator ? '35.188.137.1' : `/cloudsql/${instance}`;
const dialectOptions = isEmulator ? { ssl: SSL } : { socketPath: host,connectTimeout: 60000 };
const setting = {
  db_name: {
    TC_test: 'TC_test',
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
  timezone: 'Asia/Taipei'
};
module.exports = { setting };
