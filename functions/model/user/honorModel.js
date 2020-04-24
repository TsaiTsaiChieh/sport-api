const modules = require("../../util/modules");
const errs = require("../../util/errorCode");
const db = require("../../util/dbUtil");

function honorModel(args) {
  return new Promise(async function (resolve, reject) {
    try {
      let uid = args;
      const honor = await db.sequelize.query(
        `
      SELECT coin, point, ingot
        FROM users 
       WHERE uid = '${uid}'
       `,
        {
          plain: true,
          type: db.sequelize.QueryTypes.SELECT,
        }
      );

      resolve(honor);
    } catch (err) {
      console.log("Error in  user/honor by henry:  %o", err);
      return reject(errs.errsMsg("500", "500", err.message));
    }
  });
}

module.exports = honorModel;
