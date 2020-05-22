// const modules = require('../../util/modules');
const AppErrors = require('../../util/AppErrors');
const db = require('../../util/dbUtil');

async function teamEvent(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const teamEvent = await queryTeamEvent(args);
      const result = await repackage(args, teamEvent);
      resolve(result);
    } catch (err) {
      reject(err);
    }
  });
}

function queryTeamEvent(args) {
  return new Promise(async function(resolve, reject) {
    // 比例為所有人
    // 盤口僅顯示過盤的那個
    try {
      const queries = await db.sequelize.query(
        `(
          // SELECT 
          //   FROM matches game,
          //        match_   
         )`,
        {
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      return resolve(queries);
    } catch (err) {
      return reject(`${err.stack} by DY`);
    }
  });
}

async function repackage(args, teamHandicap) {
  try {
  } catch (err) {
    console.error(`${err.stack} by DY`);
    throw AppErrors.RepackageError(`${err.stack} by DY`);
  }
}
module.exports = teamEvent;
