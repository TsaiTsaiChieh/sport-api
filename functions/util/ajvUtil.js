const Ajv = require('ajv');

module.exports = new Ajv({ allErrors: true, useDefaults: true });
