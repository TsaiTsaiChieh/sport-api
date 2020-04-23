/* console.log上色小工具
const log = require('../../util/loggingUtil');
log.succ('123')
*/
const util = require('util');
const logging = {
  info: function(data) {
    if (typeof data === 'object') data = util.inspect(data, { depth: null });
    console.log('\x1b[1;34m[Info]\x1b[0m \x1b[34m%s\x1b[0m', data);
  },
  succ: function(data) {
    if (typeof data === 'object') data = util.inspect(data, { depth: null });
    console.log('\x1b[1;32m[Succ]\x1b[0m \x1b[32m%s\x1b[0m', data);
  },
  warn: function(data) {
    if (typeof data === 'object') data = util.inspect(data, { depth: null });
    console.log('\x1b[1;33m[Warn]\x1b[0m \x1b[33m%s\x1b[0m', data);
  },
  err: function(data) {
    if (typeof data === 'object') data = util.inspect(data, { depth: null });
    console.log('\x1b[1;31m[Error]\x1b[0m \x1b[31m%s\x1b[0m', data);
  },
  data: function(data) {
    if (typeof data === 'object') data = util.inspect(data, { depth: null });
    const arr = data.toString().split('\n');
    for (var key in arr) {
      console.log('\x1b[35m', arr[key], '\x1b[0m');
    }
  }
};
module.exports = logging;
