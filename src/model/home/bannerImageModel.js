const db = require('../../util/dbUtil');
const Op = require('sequelize').Op;
function dbFind() {
  return new Promise(async function(resolve, reject) {
    try {
      const result = await db.sequelize.models.home__banner.findAll({
        order: ['sort'],
        where: {
          status: 1,
          sort: {
            [Op.ne]: null
          }
        },
        attributes: ['id', 'name', 'sort', 'imgurl', 'title', 'createdAt', 'updatedAt']
      });
      resolve(result);
    } catch (error) {
      console.error(error);
      reject('get home banners failed');
    }
  });
}
async function bannerImage(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const banners = await dbFind();
      resolve({ code: 200, banners: banners });
    } catch (error) {
      console.error(error);
      reject({ code: 500, error: error });
    }
  });
}
module.exports = bannerImage;
