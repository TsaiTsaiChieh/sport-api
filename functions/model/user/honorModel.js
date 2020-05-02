const modules = require('../../util/modules');
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');

function honorModel(uid) {
  return new Promise(async function(resolve, reject) {
    try {
      const wins = await db.sequelize.query(
        `
        SELECT win_bets, win_rate FROM users__win__lists;
        `,
        {
          type: db.sequelize.QueryTypes.SELECT
        }
      );


      const event = await db.sequelize.query(
        `
        SELECT * 
          FROM 
        (
          SELECT hb.honor_id, hb.rank_id, hb.updatedAt, CONCAT(ml.name, '第', hb.period, '期', r.name) as description
          FROM honor__boards hb, match__leagues ml, ranks r
         WHERE hb.uid = '${uid}'
           AND hb.league_id = ml.league_id
           AND hb.rank_id = r.rank_id
           ) event
         WHERE event.rank_id = 
       `,
        {
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      const honorList = {
        "event":event
      };

      resolve(honorList);
    } catch (err) {
      console.log('Error in  user/honor by henry:  %o', err);
      return reject(errs.errsMsg('500', '500', err.message));
    }
  });
}

module.exports = honorModel;
