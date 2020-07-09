async function ccardNotifyModel(res) {
  return new Promise(async function(resolve, reject) {
    try {
      resolve({'status':'200'});
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = ccardNotifyModel;
