const modules = require('../util/modules');

function getHandicap(req, res) {
  let result = getEventWhichIsUpcoming();
}
async function getEventWhichIsUpcoming() {
  const eventRef = modules.firestore.collection(modules.db.sport_18);
  const query = await eventRef.where('status', '==', 2).get();
  query.forEach(function(doc) {
    console.log(doc.data());
  });
}
module.exports = getHandicap;
