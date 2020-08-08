const path = require('path');
const fs = require('fs');
const setting = {
  db_name: {
    dev: process.env.SQL_DATABASE
    // dev: 'Page'
  },
  db_user: process.env.SQL_USER,
  db_password: process.env.SQL_PASSWORD,
  dialect: 'mysql',
  pool: {
    max: 3000,
    min: 10, // Minimum number of connection in pool
    acquire: 3000, // The maximum time, in milliseconds, that pool will try to get connection before throwing error
    idle: 10000 // The maximum time, in milliseconds, that a connection can be idle before being released
  },
  timezone: '+08:00'
};
if (process.env.INSTANCE_CONNECTION_NAME && process.env.NODE_ENV === 'production') {
  setting.dialectOptions = { socketPath: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`, connectTimeout: 60000 };
  // setting.socketPath = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
} else {
  setting.host = '35.188.137.1';
  const SSL = {
    key: fs.readFileSync(path.join(__dirname, '../auth/client-key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../auth/client-cert.pem')),
    ca: fs.readFileSync(path.join(__dirname, '../auth/server-ca.pem')),
    // ref: https://stackoverflow.com/questions/52465530/sequelize-connection-timeout-while-using-serverless-aurora-looking-for-a-way-to
    connectTimeout: 60000 // The milliseconds before a timeout occurs during the initial connection to the MySQL server.
  };
  setting.dialectOptions = { ssl: SSL };
}
module.exports = { setting };
