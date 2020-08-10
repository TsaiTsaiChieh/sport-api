const db = require('../../util/dbUtil');
const modules = require('../../util/modules');
const leagueUtil = require('../../util/leagueUtil');

function favoritePlayerModel(args) {
  return new Promise(async function(resolve, reject) {
    try {
      let favorite_player = {};
      const favorite_player_list = [];
      const uid = args.token.uid;

      if (args.method === 'POST') {
        /* 取前一個月時間 */
        const end = modules.moment().format('YYYY-MM-DD');
        const begin = modules.moment().subtract(1, 'week').format('YYYY-MM-DD');
        // console.log(begin);
        favorite_player = await db.sequelize.query(
        `
        SELECT uf.god_uid as god_uid, 
                        u.avatar, 
                        u.display_name, 
                        vl.name,
                        vl.league_id,
                        uwl.this_month_win_rate,
                        uwl.this_month_win_bets
          FROM user__favoriteplayers uf
         INNER JOIN users u ON uf.god_uid = u.uid
         INNER JOIN view__leagues vl ON vl.name = uf.league
          LEFT JOIN users__win__lists uwl ON uwl.uid = uf.god_uid AND uwl.league_id = vl.league_id
         WHERE uf.uid = :uid
          
         `,
        {
          logging: true,
          replacements: { begin: begin, end: end, uid: uid },
          type: db.sequelize.QueryTypes.SELECT
        });

        favorite_player.forEach(function(ele) {
          favorite_player_list.push(repackage(ele));
        });
        resolve(favorite_player_list);
      } else if (args.method === 'DELETE') {
        const items = args.body.items;
        const league = args.body.league_name;
        const uids = items.join("','");

        favorite_player = await db.sequelize.query(
          `
          DELETE FROM user__favoriteplayers
           WHERE god_uid in ('${uids}')
             AND uid=$uid
             AND league=$league
           `,
          {
            logging: true,
            bind: { uid: uid, league: league },
            type: db.sequelize.QueryTypes.DELETE
          });

        resolve({ code: '200', msg: 'success' });
      }
    } catch (err) {
      console.log('error happened...', err);
      reject({ code: 500, error: err });
    }
  });
}

function repackage(ele) {
  const data = {
    god_uid: ele.god_uid,
    avatar: ele.avatar,
    display_name: ele.display_name,
    league_name: ele.name,
    league_id: leagueUtil.leagueCodebook(ele.name).id
  };

  /* 欄位無資料防呆 */
  data.win_bets = ele.this_month_win_bets == null ? null : ele.this_month_win_bets.toString();
  data.win_rate = ele.this_month_win_bets == null ? null : ele.this_month_win_rate.toString();

  return data;
}
module.exports = favoritePlayerModel;
