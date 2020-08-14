const winston = require('winston');

const useFormat = winston.format.combine(
  winston.format((info) => { // winston.format((info, opts)
    let level = info.level.toUpperCase();
    if (level === 'VERBOSE') { level = 'DEBUG'; }
    info.severity = level;
    delete info.level;
    return info;
  })(),
  winston.format.json());

const { LoggingWinston } = require('@google-cloud/logging-winston');
const loggingWinston = new LoggingWinston();
const logger = winston.createLogger({
  level: 'debug',
  format: useFormat,
  transports: [
    new winston.transports.Console(),
    loggingWinston
  ]
});

module.exports = { logger };
