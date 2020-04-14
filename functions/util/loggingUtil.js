/* console.log上色小工具
const log = require('../../util/loggingUtil');
log.succ('123')
*/

const logging = {
  info: function(data){
    console.log("\x1b[1;34m[Info]\x1b[0m \x1b[34m%s\x1b[0m", data);
  },
  succ: function(data){
    console.log("\x1b[1;32m[Succ]\x1b[0m \x1b[32m%s\x1b[0m", data);
  },
  warn: function(data){
    console.log("\x1b[1;33m[Warn]\x1b[0m \x1b[33m%s\x1b[0m", data);
  },
  err: function(data){
    console.log("\x1b[1;31m[Error]\x1b[0m \x1b[31m%s\x1b[0m", data);
  },
  data: function(data){
    let arr = data.toString().split('\n')
    for (var key in arr) {
      console.log("\x1b[35m", arr[key], "\x1b[0m");
    }
  }
}
module.exports = logging;
