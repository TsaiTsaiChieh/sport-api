const modules = require('../util/modules');
const data = require('./lineup.json');
const lineupsURL = 'https://api.betsapi.com/v1/event/lineup';
async function getLineups (req, res) {
  // step 1: get all event id which status is upcoming(2)
  const upcomingEvents = [];
  const upcomingEventsSnapshot = await modules.firestore
    .collection(modules.db.sport_18)
    .get();

  upcomingEventsSnapshot.docs.forEach(async function (doc) {
    const ele = doc.data();
    // if (ele.status === 2) {
    //   const { data } = await modules.axios(
    //     `${lineupsURL}?token=${modules.betsToken}&event_id=${ele.id}`
    //   );
    // }
    // if (ele.status === 2 && ele.id === '1706128') {
    //   modules
    //     .getDoc(modules.db.sport_18, ele.id)
    //     .set({ home: data.results.home, away: data.results.away });
    // }
  });
  console.log(upcomingEvents.length);

  res.json(upcomingEvents);
  // return data;
}
module.exports = getLineups;
