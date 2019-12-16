const modules = require('../../util/modules');


/**
 * @api {get} /sport Get Sport List
 * @apiVersion 1.0.0
 * @apiName sport
 * @apiGroup Sport
 * @apiPermission None
 *
 * @apiSuccess {JSON} Available List of Sports and Leagues
 *
 * @apiSuccessExample Success-Response:
 *  HTTP/1.1 200 OK
 {
    "baseball": {
        "id": 16,
        "name": "棒球",
        "leagues": {
            "KBO": {
                "eng": "Korea Baseball Organization",
                "name": "韓國職棒",
                "description": "韓國棒球委員會"
            },
            "MLB": {
                "eng": "美國職業棒球大聯盟",
                "name": "MLB",
                "description": "美國職業棒球大聯盟"
            },
            "NPB": {
                "eng": "Nippon Professional Baseball",
                "name": "日本職棒",
                "description": "社團法人日本野球機構"
            },
            "ABL": {
                "eng": "Australian Baseball League",
                "name": "澳洲職棒",
                "description": "澳洲棒球聯盟"
            },
            "CPBL": {
                "eng": "Chinese Professional Baseball League",
                "name": "中華職棒",
                "description": "中華職業棒球大聯盟"
            },
            "LMB": {
                "eng": "Liga Mexicana de Beisbol",
                "name": "墨西哥職棒",
                "description": "墨西哥棒球聯盟"
            }
        }
    },
    "basketball": {
        "id": 18,
        "name": "籃球",
        "leagues": {
            "SBL": {
                "eng": "Super Basketball League",
                "name": "SBL",
                "description": "超級籃球聯賽"
            },
            "JPBL": {
                "eng": "Basketball Japan League",
                "name": "日本職籃",
                "description": "日本職業籃球聯盟"
            },
            "KBL": {
                "eng": "Korean Basketball League",
                "name": "韓國職籃",
                "description": "韓國籃球聯賽"
            },
            "NBL": {
                "eng": "National Basketball League",
                "name": "澳洲職籃",
                "description": "澳大利亞國家籃球聯賽"
            },
            "NBA": {
                "eng": "National Basketball Association",
                "name": "NBA",
                "description": "美國職業籃球聯賽"
            },
            "WNBA": {
                "eng": "Women's National Basketball Association",
                "name": "WNBA",
                "description": "國家女子籃球協會"
            },
            "CBA": {
                "eng": "Chinese Basketball Association",
                "name": "中國職籃",
                "description": "中國男子籃球職業聯賽"
            }
        }
    },
    "ice_hockey": {
        "name": "冰球",
        "leagues": {
            "NHL": {
                "eng": "National Hockey League",
                "name": "NHL",
                "description": "國家冰球聯盟"
            }
        },
        "id": 17
    },
    "soccer": {
        "leagues": {
            "ALL": {
                "name": "足球"
            }
        },
        "id": 1,
        "name": "足球"
    }
}
 *
 * @apiError 500 Internal Server Error
 *
 * @apiErrorExample Error-Response:
     *     HTTP/1.1 500 Internal Server Error
 */
async function getSports(req, res) {
    let returnJson = {};
    try {
        const snapshot = await modules.firestore.collection('sports').get();
        snapshot.forEach(function (doc) {
            // console.log("...", doc.id, " => ", doc.data());
            returnJson[doc.id]= doc.data();
        });

    } catch (e) {
        console.log(e);
        return res.status(500);
    }
    return res.status(200).json(returnJson);
}

module.exports = getSports;