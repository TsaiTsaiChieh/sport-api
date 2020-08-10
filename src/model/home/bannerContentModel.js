const db = require('../../util/dbUtil');
const Op = require('sequelize').Op;
function dbFind(id) {
  return new Promise(async function(resolve, reject) {
    try {
      const result = await db.sequelize.models.home__banner.findOne({
        where: {
          id: id,
          status: 1,
          sort: {
            [Op.ne]: null
          }
        }
      });
      resolve(result);
    } catch (error) {
      console.error(error);
      reject('get home banners failed');
    }
  });
}
async function bannerContent(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const banners = await dbFind(args.id);
      if (!banners) {
        reject({ code: 404, error: 'id not found or expired' });
        return;
      }
      resolve({ code: 200, result: banners });
    } catch (error) {
      console.error(error);
      reject({ code: 500, error: error });
    }
  });
}
module.exports = bannerContent;
