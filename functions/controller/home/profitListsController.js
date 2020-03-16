const modules = require('../../util/modules');

async function godlists(req, res) {
    let returnJson = {};

    try {
        //   const snapshot = await modules.firestore.collection('sports').get();
        //   snapshot.forEach(function (doc) {
        //       // console.log("...", doc.id, " => ", doc.data());
        //       returnJson[doc.id]= doc.data();
        //   });

        returnJson = {
            profitlists: [
                {
                    leaguewinlists: [
                        {
                            league: 'NBA',
                            winrate: '11'
                        },
                        {
                            league: 'MLB',
                            winrate: '10'
                        }
                    ],
                    useruid: 'MyOPA8SzgVUq8iARhOa8mzQLC3e2',
                    headpicurl: 'https://chat.doinfo.cc/statics/default-profile-avatar.jpg',
                    display: '覃娣纯',
                    perdictrate: ['5', '5'],
                    continu: "8"
                },
                {
                    leaguewinlists: [
                        {
                            league: 'NBA',
                            winrate: '10'
                        },
                        {
                            league: 'MLB',
                            winrate: '7'
                        }
                    ],
                    useruid: 'MyOPA8SzgVUq8iARhOa8mzQLC3e2',
                    headpicurl: 'https://chat.doinfo.cc/statics/default-profile-avatar.jpg',
                    display: '欧厚',
                    perdictrate: ['5', '5'],
                    continu: "8"
                },
                {
                    leaguewinlists: [
                        {
                            league: 'NBA',
                            winrate: '8'
                        },
                        {
                            league: 'MLB',
                            winrate: '5'
                        }
                    ],
                    useruid: 'MyOPA8SzgVUq8iARhOa8mzQLC3e2',
                    headpicurl: 'https://chat.doinfo.cc/statics/default-profile-avatar.jpg',
                    display: '虎克',
                    perdictrate: ['5', '5'],
                    continu: "8"
                },
                {
                    leaguewinlists: [
                        {
                            league: 'NBA',
                            winrate: '7'
                        },
                        {
                            league: 'MLB',
                            winrate: '4'
                        }
                    ],
                    useruid: 'MyOPA8SzgVUq8iARhOa8mzQLC3e2',
                    headpicurl: 'https://chat.doinfo.cc/statics/default-profile-avatar.jpg',
                    display: '申筠志',
                    perdictrate: ['5', '5'],
                    continu: "8"
                },
                {
                    leaguewinlists: [
                        {
                            league: 'NBA',
                            winrate: '2'
                        },
                        {
                            league: 'MLB',
                            winrate: '1'
                        }
                    ],
                    useruid: 'MyOPA8SzgVUq8iARhOa8mzQLC3e2',
                    headpicurl: 'https://chat.doinfo.cc/statics/default-profile-avatar.jpg',
                    display: '禹清',
                    perdictrate: ['5', '5'],
                    continu: "8"
                }
            ]
        };

    } catch (e) {
        console.log('homeController godlists Error:  %o', e);
        return res.status(500);
    }

    return res.status(200).json(returnJson);
}

module.exports = godlists;
/**
 * @api {get} /profitlists Get Profit Lists
 * @apiVersion 1.0.0
 * @apiName profitlists
 * @apiGroup home
 * @apiPermission None
 *
 * @apiSuccess {JSON} result Available List of Profit lists
 *
 * @apiSuccessExample Success-Response:
 *  HTTP/1.1 200 OK
 {
    profitlists: [
        {
            leaguewinlists: [
                {
                    league: 'NBA',
                    winrate: '11'
                },
                {
                    league: 'MLB',
                    winrate: '10'
                }
            ],
            useruid: 'MyOPA8SzgVUq8iARhOa8mzQLC3e2',
            headpicurl: 'https://chat.doinfo.cc/statics/default-profile-avatar.jpg',
            display: '覃娣纯',
            perdictrate: ['5', '5'],
            continu: "8"
        },
        {
            leaguewinlists: [
                {
                    league: 'NBA',
                    winrate: '10'
                },
                {
                    league: 'MLB',
                    winrate: '7'
                }
            ],
            useruid: 'MyOPA8SzgVUq8iARhOa8mzQLC3e2',
            headpicurl: 'https://chat.doinfo.cc/statics/default-profile-avatar.jpg',
            display: '欧厚',
            perdictrate: ['5', '5'],
            continu: "8"
        },
        {
            leaguewinlists: [
                {
                    league: 'NBA',
                    winrate: '8'
                },
                {
                    league: 'MLB',
                    winrate: '5'
                }
            ],
            useruid: 'MyOPA8SzgVUq8iARhOa8mzQLC3e2',
            headpicurl: 'https://chat.doinfo.cc/statics/default-profile-avatar.jpg',
            display: '虎克',
            perdictrate: ['5', '5'],
            continu: "8"
        },
        {
            leaguewinlists: [
                {
                    league: 'NBA',
                    winrate: '7'
                },
                {
                    league: 'MLB',
                    winrate: '4'
                }
            ],
            useruid: 'MyOPA8SzgVUq8iARhOa8mzQLC3e2',
            headpicurl: 'https://chat.doinfo.cc/statics/default-profile-avatar.jpg',
            display: '申筠志',
            perdictrate: ['5', '5'],
            continu: "8"
        },
        {
            leaguewinlists: [
                {
                    league: 'NBA',
                    winrate: '2'
                },
                {
                    league: 'MLB',
                    winrate: '1'
                }
            ],
            useruid: 'MyOPA8SzgVUq8iARhOa8mzQLC3e2',
            headpicurl: 'https://chat.doinfo.cc/statics/default-profile-avatar.jpg',
            display: '禹清',
            perdictrate: ['5', '5'],
            continu: "8"
        }
    ]
 }
 *
 * @apiError 500 Internal Server Error
 *
 * @apiErrorExample Error-Response:
     *     HTTP/1.1 500 Internal Server Error
 */
