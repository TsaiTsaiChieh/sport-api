const modules = require('../../util/modules');

async function godlists(req, res) {
    const godLists = [];

    try {
        // god_recommend 取出是 大神資料 且 有販售
        const godListsQuery = await modules.firestore.collection('god_recommend')
            .where('sell', '==', '1')
            .get();
        
        const sortedArr = godListsQuery.docs.map(function(doc) {  // 轉換成array
            return doc.data()
        });

        sortedArr.sort(function compare(a, b) { // 進行 order 排序
            return a.order > b.order; // 升 小->大
        });

        sortedArr.forEach(async function(data) {
            godLists.push( repackage(data) );
        });

        await Promise.all(godLists);
    }catch(err){
        console.log('Error in  home/godlists by YuHsien:  %o', err);
        return res.status(500);
    }

    return res.status(200).json({godlists: godLists});
}

function repackage(ele) {
    data = {
        league_win_lists: {},
        uid: ele.uid,
        avatar: ele.avatar,
        displayname: ele.displayname
    };

    // 大神聯盟戰績表
    // 該聯盟有賣牌才能出現
    if(ele.sell_NBA == '1'){
        data.league_win_lists['NBA'] = { // 聯盟 戰績表
            rank: ele.NBA_rank,
            win_rate: ele.NBA_win_rate,
            predict_rate: ele.NBA_predict_rate, //預測結果 近x過x
            continune: ele.NBA_continue //預測結果 連贏
        };
    }
    
    if(ele.sell_MLB == '1'){
        data.league_win_lists['MLB'] = { // 聯盟 戰績表
            rank: ele.MLB_rank,
            win_rate: ele.MLB_win_rate,
            predict_rate: ele.MLB_predict_rate, //預測結果 近x過x
            continune: ele.MLB_continue //預測結果 連贏
        };
    }

    return data;
}

module.exports = godlists;
/**
 * @api {get} /godlists Get God Lists
 * @apiVersion 1.0.0
 * @apiName godlists
 * @apiGroup home
 * @apiPermission None
 *
 * @apiSuccess {JSON} result Available List of God lists
 *
 * @apiSuccessExample Success-Response:
 *  HTTP/1.1 200 OK
 {
    "godlists": [
        {
            "league_win_lists": {
                "NBA": {
                    "rank": "2",
                    "win_rate": 80,
                    "predict_rate": [
                        7,
                        5,
                        5
                    ],
                    "continune": 8
                },
                "MLB": {
                    "rank": "1",
                    "win_rate": 80,
                    "predict_rate": [
                        6,
                        5,
                        5
                    ],
                    "continune": 8
                }
            },
            "uid": "2WMRgHyUwvTLyHpLoANk7gWADZn1",
            "displayname": "台中大哥大"
        },
        ...
    ]
}
 *
 * @apiError 500 Internal Server Error
 *
 * @apiErrorExample Error-Response:
     *     HTTP/1.1 500 Internal Server Error
 */
