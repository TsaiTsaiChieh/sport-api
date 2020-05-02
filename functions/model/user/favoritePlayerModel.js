const modules = require('../../util/modules');
const db = require('../../util/dbUtil');

function favoritePlayerModel(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const uid = args;
      console.log(uid);
      const favorite_player = await db.sequelize.query(
        `
          SELECT favorite_player
            FROM users 
         `,
        {
          plain: true,
          type: db.sequelize.QueryTypes.SELECT
        });
      console.log(favorite_player);
      resolve(favorite_player);
    } catch (err) {
      console.log('error happened...', err);
      reject({ code: 500, error: err });
    }
  });
}

module.exports = favoritePlayerModel;
