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
            winratelists: [
                {
                    leaguewinlists: [
                        {
                            league: 'NBA',
                            winrate: '88'
                        },
                        {
                            league: 'MLB',
                            winrate: '82'
                        }
                    ],
                    useruid: 'MyOPA8SzgVUq8iARhOa8mzQLC3e2',
                    headpicurl: 'https://chat.doinfo.cc/statics/default-profile-avatar.jpg',
                    display: '炸裂設計師',
                    perdictrate: ['11', '9'],
                    continu: "9"
                },
                {
                    leaguewinlists: [
                        {
                            league: 'NBA',
                            winrate: '84'
                        },
                        {
                            league: 'MLB',
                            winrate: '82'
                        }
                    ],
                    useruid: 'MyOPA8SzgVUq8iARhOa8mzQLC3e2',
                    headpicurl: 'https://chat.doinfo.cc/statics/default-profile-avatar.jpg',
                    display: '胥霄荔',
                    perdictrate: ['5', '5'],
                    continu: "8"
                },
                {
                    leaguewinlists: [
                        {
                            league: 'NBA',
                            winrate: '80'
                        },
                        {
                            league: 'MLB',
                            winrate: '81'
                        }
                    ],
                    useruid: 'MyOPA8SzgVUq8iARhOa8mzQLC3e2',
                    headpicurl: 'https://chat.doinfo.cc/statics/default-profile-avatar.jpg',
                    display: '冒元有',
                    perdictrate: ['4', '4'],
                    continu: "5"
                },
                {
                    leaguewinlists: [
                        {
                            league: 'NBA',
                            winrate: '75'
                        },
                        {
                            league: 'MLB',
                            winrate: '76'
                        }
                    ],
                    useruid: 'MyOPA8SzgVUq8iARhOa8mzQLC3e2',
                    headpicurl: 'https://chat.doinfo.cc/statics/default-profile-avatar.jpg',
                    display: '红天巧',
                    perdictrate: ['5', '5'],
                    continu: "8"
                },
                {
                    leaguewinlists: [
                        {
                            league: 'NBA',
                            winrate: '7a'
                        },
                        {
                            league: 'MLB',
                            winrate: '73'
                        }
                    ],
                    useruid: 'MyOPA8SzgVUq8iARhOa8mzQLC3e2',
                    headpicurl: 'https://chat.doinfo.cc/statics/default-profile-avatar.jpg',
                    display: 'Annie Boone',
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
 * @api {get} /winratelists Get Winrate Lists
 * @apiVersion 1.0.0
 * @apiName winratelists
 * @apiGroup home
 * @apiPermission None
 *
 * @apiSuccess {JSON} result Available List of Winrate lists
 *
 * @apiSuccessExample Success-Response:
 *  HTTP/1.1 200 OK
 {
    winratelists: [
        {
            leaguewinlists: [
                {
                    league: 'NBA',
                    winrate: '88'
                },
                {
                    league: 'MLB',
                    winrate: '82'
                }
            ],
            useruid: 'MyOPA8SzgVUq8iARhOa8mzQLC3e2',
            headpicurl: 'https://chat.doinfo.cc/statics/default-profile-avatar.jpg',
            display: '炸裂設計師',
            perdictrate: ['11', '9'],
            continu: "9"
        },
        {
            leaguewinlists: [
                {
                    league: 'NBA',
                    winrate: '84'
                },
                {
                    league: 'MLB',
                    winrate: '82'
                }
            ],
            useruid: 'MyOPA8SzgVUq8iARhOa8mzQLC3e2',
            headpicurl: 'https://chat.doinfo.cc/statics/default-profile-avatar.jpg',
            display: '胥霄荔',
            perdictrate: ['5', '5'],
            continu: "8"
        },
        {
            leaguewinlists: [
                {
                    league: 'NBA',
                    winrate: '80'
                },
                {
                    league: 'MLB',
                    winrate: '81'
                }
            ],
            useruid: 'MyOPA8SzgVUq8iARhOa8mzQLC3e2',
            headpicurl: 'https://chat.doinfo.cc/statics/default-profile-avatar.jpg',
            display: '冒元有',
            perdictrate: ['4', '4'],
            continu: "5"
        },
        {
            leaguewinlists: [
                {
                    league: 'NBA',
                    winrate: '75'
                },
                {
                    league: 'MLB',
                    winrate: '76'
                }
            ],
            useruid: 'MyOPA8SzgVUq8iARhOa8mzQLC3e2',
            headpicurl: 'https://chat.doinfo.cc/statics/default-profile-avatar.jpg',
            display: '红天巧',
            perdictrate: ['5', '5'],
            continu: "8"
        },
        {
            leaguewinlists: [
                {
                    league: 'NBA',
                    winrate: '7a'
                },
                {
                    league: 'MLB',
                    winrate: '73'
                }
            ],
            useruid: 'MyOPA8SzgVUq8iARhOa8mzQLC3e2',
            headpicurl: 'https://chat.doinfo.cc/statics/default-profile-avatar.jpg',
            display: 'Annie Boone',
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
