const db = require('../../util/dbUtil');
const modules = require('../../util/modules');

function favoritePlayerModel(args) {
  return new Promise(async function(resolve, reject) {
    try {
      let favorite_player = {};
      let favorite_player_list = [];
      const uid = args.token.uid;
      if (args.method === 'POST') {
        favorite_player = await db.sequelize.query(
        `
        SELECT uf.god_uid as god_uid, 
               u.avatar, 
               u.display_name, 
               vl.name,
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
          FROM user__favoriteplayers uf, 
               users u,
               view__leagues vl
         WHERE u.uid = uf.uid
           AND uf.uid=$uid
           AND uf.league=vl.name
         `,
        {
          bind: { uid: uid },
          type: db.sequelize.QueryTypes.SELECT
        });
        
        favorite_player.forEach(function(ele) {
            favorite_player_list.push(repackage(ele));
        });
        
      } else if (args.method === 'DELETE') {
        const god_uid = args.body.god_uid;
        favorite_player = await db.sequelize.query(
          `
          DELETE FROM user__favoriteplayers
           WHERE god_uid=$god_uid
             AND uid=$uid
           `,
          {
            bind: { uid: uid, god_uid: god_uid },
            type: db.sequelize.QueryTypes.DELETE
          });
          
      }
      resolve(favorite_player_list);
    } catch (err) {
      console.log('error happened...', err);
      reject({ code: 500, error: err });
    }
  });
}

function repackage(ele){
  const data = {
    god_uid: ele.god_uid,
    avatar: ele.avatar,
    display_name: ele.display_name,
    league_name: ele.name,
    league_id: modules.leagueCodebook(ele.name).id
  };

  /* 欄位無資料防呆 */
  data.win_bets = ele.this_month_win_bets == null ? null : ele.this_month_win_bets.toString();
  data.rank = ele.rank_id == null ? null : ele.rank_id.toString();

  return data;
}
module.exports = favoritePlayerModel;
