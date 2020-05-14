const db = require('../../util/dbUtil');

function favoritePlayerModel(args) {
  return new Promise(async function(resolve, reject) {
    try {
      let favorite_player = {};
      let win_list = {};
      const uid = args.token.uid;
      if (args.method === 'POST') {
        win_list = await db.sequelize.query(
          `
          SELECT * FROM users__win__lists
          
           `,
          {
            bind: { uid: uid },
            type: db.sequelize.QueryTypes.SELECT
          }
        );
        favorite_player = await db.sequelize.query(
        `
        SELECT uf.god_uid as god_uid, 
               u.avatar, 
               u.display_name, 
               uf.league,
               (
                 SELECT ROUND(uwl.this_month_win_bets, 2)
                   FROM users__win__lists uwl
                  WHERE uf.god_uid = uwl.uid
               ) as this_month_win_bets,
               (
                 SELECT ROUND(uwl.this_month_win_rate, 2) 
                   FROM users__win__lists uwl
                  WHERE uf.god_uid = uwl.uid
               ) as this_month_win_rate 
          FROM user__favoritegods uf, 
               users u
         WHERE u.uid = uf.uid
           AND uf.uid=$uid
         `,
        {
          bind: { uid: uid },
          type: db.sequelize.QueryTypes.SELECT
        });
      } else if (args.method === 'DELETE') {
        const god_uid = args.body.god_uid;
        favorite_player = await db.sequelize.query(
          `
          DELETE FROM user__favoritegods
           WHERE god_uid=$god_uid
             AND uid=$uid
           `,
          {
            bind: { uid: uid, god_uid: god_uid },
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
