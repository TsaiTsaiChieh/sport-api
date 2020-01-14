const modules = require('../util/modules');

async function getHandicap(req, res) {
  let result = await getEventWhichIsUpcoming();
  res.json(result);
}
async function getEventWhichIsUpcoming() {
  let events = [];
  const eventsRef = await modules.firestore
    .collection(modules.db.sport_18)
    .get();
  eventsRef.docs.forEach(async function(doc) {
    events.push(doc.data().id);
  });
  for (let i = 0; i < events.length; i++) {
    const eventSnapshot = modules.getDoc(modules.db.sport_18, events[i]);
    eventSnapshot.set({ handicapFlag: 0 }, { merge: true });
  }

  return events;

  // const query = await eventRef.where('status', '==', 2).get();

  // const query_NBA = await eventRef.where('league.id', '==', '2274').get();
  // let result = ['1'];
  // query_NBA.forEach(function(doc) {
  //   let data = doc.data();
  //   result.push(data);
  //   console.log('NBA:::', data);
  // });
  // return result;
}
module.exports = getHandicap;
