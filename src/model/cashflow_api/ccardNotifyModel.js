async function ccardNotifyModel(res) {
  return new Promise(async function(resolve, reject) {
    try {
      resolve('@RRN|PAY_STATUS');
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = ccardNotifyModel;
