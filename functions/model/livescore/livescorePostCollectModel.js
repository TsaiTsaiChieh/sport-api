// const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
const Collection = db.Collection;
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
  // index is const, taking about 160ms
  const matchQuery = await db.sequelize.query(
    `
      SELECT *
        FROM matches
       WHERE bets_id = :eventID 
       
     `,
    {
      replacements: {
        eventID: args.eventID
      },
      type: db.sequelize.QueryTypes.SELECT
    }
  );
  const UID = args.token.uid;
  if (matchQuery.length > 0) {
    await Collection.upsert({
      bets_id: args.eventID,
      uid: UID,
      league_id: matchQuery[0].league_id,
      scheduled: matchQuery[0].scheduled,
      scheduled_tw: matchQuery[0].scheduled * 1000
    });
  }
  return 'Post OK';
}
module.exports = postCollect;
