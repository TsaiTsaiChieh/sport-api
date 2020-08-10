const db = require('../../util/dbUtil');
function postCollect(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const result = await repackage(args);

      resolve(result);
    } catch (err) {
      console.error('Error in livescore/livescorePostCollectModel by DY', err);
      reject({ code: 500, error: err });
    }
  });
}

async function repackage(args) {
  try {
    await db.sequelize.query(
      `
      DELETE 
        FROM user__collections
       WHERE uid = :uid and
       bets_id = :eventID
     `,
      {
        replacements: {
          uid: args.token.uid,
          eventID: args.eventID
        },
        type: db.sequelize.QueryTypes.DELETE
      }
    );
    return 'Delete OK';
  } catch (err) {
    console.log(err + ' livescoreDelete by DY');
  }
}
module.exports = postCollect;
