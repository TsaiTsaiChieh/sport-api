const modules = require('../../util/modules');
const db = require('../../util/dbUtil');

function favoritePlayerModel(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const favorite_player = {};
      const uid = args.token.uid;
      if(args.method==='POST'){
      
      favorite_player = await db.sequelize.query(
        `
        SELECT uf.god_uid as uid, u.avatar, u.display_name, uf.type, ROUND(uwl.this_month_win_bets, 2) as this_month_win_bets, ROUND(uwl.this_month_win_rate, 2) as this_month_win_rate
          FROM user__favoritegods uf, users__win__lists uwl, users u
         WHERE uf.god_uid = uwl.uid
           AND u.uid = uf.uid
           AND uf.uid=$uid
         `,
        {
          bind: { uid:uid },
          type: db.sequelize.QueryTypes.SELECT
        });
      
      }else if(args.method==='DELETE'){
        const god_uid=args.body.god_uid;
        favorite_player = await db.sequelize.query(
          `
          DELETE FROM user__favoritegods
           WHERE god_uid=$god_uid
             AND uid=$uid
           `,
          {
            bind: { uid:uid, god_uid:god_uid },
            type: db.sequelize.QueryTypes.SELECT
          });
      }
      resolve(favorite_player);
    } catch (err) {
      console.log('error happened...', err);
      reject({ code: 500, error: err });
    }
  });
}

module.exports = favoritePlayerModel;
