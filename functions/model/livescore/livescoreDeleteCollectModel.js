// const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
function postCollect(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const result = await reResult(args.eventID, args.token);

      resolve(result);
    } catch (err) {
      console.error('Error in livescore/livescorePostCollectModel by DY', err);
      reject({ code: 500, error: err });
    }
  });
}
async function reResult(eventID, token) {
  const result = await repackage(eventID, token);

  return await Promise.all(result);
}
async function repackage(eventID, token) {
  try {
    await db.sequelize.query(
      `
      DELETE 
        FROM user__collections
       WHERE uid = '${token.uid}' and
       bets_id = ${eventID}
     `,
      {
        type: db.sequelize.QueryTypes.DELETE
      }
    );
    return 'Delete OK';
  } catch (err) {
    console.log(err + ' livescoreDelete by DY');
  }
}
module.exports = postCollect;
