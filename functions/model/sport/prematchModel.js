const modules = require('../../util/modules');
function premath(args) {
  return new Promise(async function(resolve, reject) {
    const basketRef = modules.firestore.collection(modules.db.sport_18);
    // let a = await basketRef.where('league.name', '==', args.league).get();
    // var beginningDate = Date.now() - 604800000;
    // var beginningDateObject = new Date(beginningDate);

    const beginningDate = modules.moment(args.date);
    const endDate = modules.moment(args.date).add(1, 'days');

    try {
      let a = await basketRef
        .where('league.name', '==', args.league)
        .where('scheduled', '>=', beginningDate)
        .where('scheduled', '<', endDate)
        .get();
      a.forEach(function(ele) {
        console.log(ele.data().id);
      });

      resolve(args.date);
    } catch (error) {
      reject(error);
    }
  });
}
module.exports = premath;
