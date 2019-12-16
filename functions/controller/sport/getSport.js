const modules = require('../../util/modules');


/**
 * @api {get} /sport Get Sport List
 * @apiVersion 1.0.0
 * @apiName sport
 * @apiGroup Sport
 * @apiPermission None
 *
 * @apiSuccess {JSON} user User Profile JSON
 *
 * @apiSuccessExample New User:
 *  HTTP/1.1 200 OK
 {
    "success": true,
    "uid": "lz3c3ju6G0TilDOdgCQt4I7I8ep1",
    "status": 0
 }
 *
 * @apiSuccessExample Success-Response:
 *  HTTP/1.1 200 OK
 {
    "success": true,
    "uid": "zmPF5Aht60Y6GdBbGnrOSlWcgV53",
    "data": {
        "blockMessage": {
            "_seconds": 1575907200,
            "_nanoseconds": 0
        },
        "ingot": 0,
        "avatar": "https://www.techrum.vn/chevereto/images/2016/05/05/Bkm4d.jpg",
        "uid": "zmPF5Aht60Y6GdBbGnrOSlWcgV53",
        "birthday": {
            "_seconds": 1573194036,
            "_nanoseconds": 370000000
        },
        "phone": "+886999999123",
        "dividend": 0,
        "referrer": "bnKcVVaiIaUf3daVMNTTK5gH4hf1",
        "coin": 0,
        "signature": "簽名檔33",
        "status": 1,
        "email": "test3q@email.com",
        "name": "真名",
        "point": 250,
        "displayName": "測試displayName",
        "denys": [],
        "titles": [
            {
                "rank": 1,
                "league": "MLB",
                "sport": 16
            },
            {
                "rank": 3,
                "league": "CPBL",
                "sport": 16
            }
        ],
        "defaultTitle": {
            "rank": 1,
            "league": "MLB",
            "sport": 16
        }
    },
    "status": 1
}
 *
 * @apiError TokenMissing session cookie not exist.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Token Missing
 *     missing token
 */
async function getSport(req, res) {
    let returnJson = {
        success: false,
        isExist: true
    };
    try {
        const snapshot = await modules.firestore.collection('sports').get();
        // console.log("exisit",nameCollection.exists);
        console.log(snapshot.docs.map(doc => doc.data()));
        const documents = [];
        snapshot.forEach(doc => {
            documents[doc.id] = doc.data();
        });

        console.log("documents", documents);
        const promises = [];
        returnJson.data = snapshot;
        snapshot.forEach(function (doc) {
            // doc.data() is never undefined for query doc snapshots
            console.log("...", doc.id, " => ", doc.data());
            console.log("...", doc.id);
            const temp = modules.firestore.collection('sports/' + doc.id + '/league').get();
            // const temp = modules.firestore.collection('sports').doc(doc.id).collection('league').get();
            promises.push(temp);
        });
        const tempSnap = await Promise.all(promises);
        // tempSnap.forEach(function (doc) {
        //     // doc.data() is never undefined for query doc snapshots
        //     console.log(doc.data());
        // });
        console.log("tempsA", tempSnap.length);
        tempSnap.forEach(doc => {
            console.log(doc)
            doc.forEach(function (doc1) {
                // doc.data() is never undefined for query doc snapshots
                console.log("...", doc1.id, " => ", doc1.data());
            });
        })

    } catch (e) {
        console.log(e);
    }
    res.json(returnJson);
}


// async function getSport(req, res) {
//     let returnJson = {
//         success: false,
//         isExist: true
//     };
//     try {
//         const snapshot = await modules.firestore.collection('sports').doc('baseball').collection('league').get();
//         console.log(snapshot.docs.map(doc => doc.data()));
//         const documents = [];
//         snapshot.forEach(doc => {
//             documents[doc.id] = doc.data();
//         });
//         //
//         console.log(documents);
//     } catch (e) {
//         console.log(e);
//     }
//     res.json(returnJson);
// }


// async function getSport(req, res) {
//     let returnJson = {
//         success: false,
//         isExist: true
//     };
//     try {
//         const markers = [];
//         const test = await modules.firestore.collection('sports').get();
//         test.docs.forEach(doc => {
//             markers.push(doc.data());
//         });
//         console.log(markers);
//     } catch (e) {
//         console.log(e);
//     }
//     res.json(returnJson);
// }


module.exports = getSport;