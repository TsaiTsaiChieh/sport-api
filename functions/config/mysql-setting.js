const path = require('path');
const modules = require('../util/modules');
const isEmulator = process.env.FUNCTIONS_EMULATOR;
const instance = 'sportslottery-test:us-central1:do-sports';
const SSL = {
  key: modules.fs.readFileSync(
      path.join(__dirname,'../auth/client-key.pem')
  ),
  cert: modules.fs.readFileSync(
      path.join(__dirname,'../auth/client-cert.pem')
  ),
  ca: modules.fs.readFileSync(
      path.join(__dirname,'../auth/server-ca.pem')
  )
};
const host = isEmulator ? '35.188.137.1': `/cloudsql/${instance}`;
const dialectOptions = isEmulator ? {ssl:SSL} : {socketPath: host} ;
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
    min: 0,
    acquire: 3000,
    idle: 10000
  },
  timezone: '+08:00'
};
module.exports = { setting };
