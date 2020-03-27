const modules = require('../../util/modules');
const dbEngine = require('../../util/databaseEngine');
function getTitlesAndSignature(args) {
  return new Promise(async function(resolve, reject) {
    try {
      // check if user exists
      const user = await dbEngine.findUser(args.uid);
      const result = await getUserTitles(user);
      return resolve(result);
    } catch (err) {
      return reject({ code: err.code, error: err });
    }
  });
}

async function getUserTitles(user) {
  const titles = user.titles ? user.titles : [];
  const record = await getTitleRecord(user.uid);
  return {
    uid: user.uid,
    signature: user.signature,
    titles: titles,
    record
  };
}

async function getTitleRecord(uid) {
  const usersTitlesSnapshot = await modules.getSnapshot('users_titles', uid);
  if (!usersTitlesSnapshot.exists) {
    return {
      rank1_count: 0,
      rank2_count: 0,
      rank3_count: 0,
      rank4_count: 0
    };
  }
  if (usersTitlesSnapshot.exists) {
    const record = usersTitlesSnapshot.data();
    return {
      rank1_count: record.rank1_count,
      rank2_count: record.rank2_count,
      rank3_count: record.rank3_count,
      rank4_count: record.rank4_count
    };
  }
}
module.exports = getTitlesAndSignature;
