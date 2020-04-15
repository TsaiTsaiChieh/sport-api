const modules = require('../util/modules');
let firestoreName = 'pagetest_MLB';
async function inserttest() {
  let data = await modules.firestore.collection(firestoreName).get();
  let totalData = [];
  data.forEach((doc) => {
    totalData.push(doc.data());
  });

  for (let i = 0; i < 4; i++) {
    console.log(totalData[i].bets_id);
    modules.firestore
      .collection(firestoreName)
      .doc(totalData[i].bets_id)
      .set(
        {
          history: {
            event0: {
              away: 2,
              home: 0,
              scheduled: 1583890705000,
              spread: { 34407289: { handicap: 1 } },
              totals: { 34408065: { handicap: 5 } },
            },
            event1: {
              away: 1,
              home: 3,
              scheduled: 1584890705000,
              spread: { 34407289: { handicap: 2 } },
              totals: { 34408065: { handicap: 6 } },
            },
            event2: {
              away: 4,
              home: 1,
              scheduled: 1585890705000,
              spread: { 34407289: { handicap: 4 } },
              totals: { 34408065: { handicap: 7 } },
            },
            event3: {
              away: 4,
              home: 2,
              scheduled: 1586890705000,
              spread: { 34407289: { handicap: 1 } },
              totals: { 34408065: { handicap: 4 } },
            },
            event4: {
              away: 5,
              home: 2,
              scheduled: 1587890705000,
              spread: { 34407289: { handicap: 7 } },
              totals: { 34408065: { handicap: 12 } },
            },
          },
          stat: {
            away: {
              avg: 0.342,
              h: 2,
              hr: 7,
              obp: 8,
              r: 1,
              slg: 2,
            },
            home: { avg: 0.289, h: 1, hr: 6, obp: 9, r: 2, slg: 3 },
          },
          lineups: {
            away: {
              pitcher: {
                era: 0.168,
                first_name: 'Maxwell',
                id: '2527770b-cf48-42b9-81fa-9323756fb311',
                jersey_number: 31,
                k: 19,
                last_name: 'Scherzer',
                win: 0,
                loss: 1,
              },
            },
            home: {
              pitcher: {
                era: 0.153,
                first_name: 'Zachary',
                id: 'dc22b8c1-fc07-4f68-ae4c-254e9dcc74c1',
                jersey_number: 56,
                k: 11,
                last_name: 'Eflin',
                win: 3,
                loss: 1,
              },
            },
          },
        },
        { merge: true }
      );
  }
  console.log('ok');
}
inserttest();
