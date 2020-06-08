const modules = require('../util/modules');
const db = require('../util/dbUtil');
const competitionID = '5469'; //KBO
const leagueID = '349';
async function prematch_statscore() {
  return new Promise(async function (resolve, reject) {
    const unix = Math.floor(Date.now() / 1000);
    const date2 = modules.convertTimezoneFormat(unix, {
      format: 'YYYY-MM-DD 00:00:00',
      op: 'add',
      value: 2,
      unit: 'days'
    });
    const date1 = modules.convertTimezoneFormat(unix, {
      format: 'YYYY-MM-DD 00:00:00'
    });
		let gg = "Hanwha Eagles - Kiwoom Heroes";
		console.log(gg.split('-')[0].trim()); //db.home_team
		console.log(gg.split('-')[1].trim()); //db.away_team
		
    //console.log(modules.convertTimezone(date1));
    //console.log(modules.convertTimezone(date2));

    //const URL = `https://api.statscore.com/v2/events?token=${modules.statscoreToken.token}&date_from=${date1}&date_to=${date2}&competition_id=${competitionID}`;
    //const data = await axiosForURL(URL);
    //const eventLength =
    //  data.api.data.competitions[0].seasons[0].stages[0].groups[0].events
    //    .length;

    //const ele = queryForMatches(modules.convertTimezone(date1),modules.convertTimezone(date2))

    //for (let i = 0; i < eventLength; i++) {
    //  let eventID =
    //    data.api.data.competitions[0].seasons[0].stages[0].groups[0].events[i]
    //      .id;
    //  let startDate = modules.convertTimezone(data.api.data.competitions[0].seasons[0].stages[0].groups[0].events[i]
    //      .start_date) + 28800; // 加八個小時
    //  let homeTeamName =
    //    data.api.data.competitions[0].seasons[0].stages[0].groups[0].events[i]
    //      .participants[0].name; //KT wiz
    //  let awayTeamName =
    //    data.api.data.competitions[0].seasons[0].stages[0].groups[0].events[i]
    //			.participants[1].name; //KIA Tigers

    //}
  });
}

async function axiosForURL(URL) {
  return new Promise(async function (resolve, reject) {
    try {
      const { data } = await modules.axios(URL);
      return resolve(data);
    } catch (err) {
      return reject(
        new AppErrors.AxiosError(`${err} at prematchFunctions_KBO by DY`)
      );
    }
  });
}
async function queryForMatches(date1, date2) {
  return new Promise(async function (resolve, reject) {
    try {
      const queries = await db.sequelize.query(
        // take 169 ms
        `(
							
				)`,
        {
          type: db.sequelize.QueryTypes.SELECT
        }
      );
      return resolve(queries);
    } catch (err) {
      return reject(`${err.stack} by DY`);
    }
  });
}
module.exports = prematch_statscore;
// 賽事有幾場：aa.api.data.competitions[0].seasons[0].stages[0].groups[0].events.length
// 主隊 aa.api.data.competitions[0].seasons[0].stages[0].groups[0].events[0].participants[0].name
// 客隊 aa.api.data.competitions[0].seasons[0].stages[0].groups[0].events[0].participants[1].name
//---
// HITS stat[0].value
// ERRORS stat[1].value
// Stolen bases stat[2].value
// Caught stealing stat[3].value
// Home run hits stat[4].value
// Grand slams stat[5].value
// Base on balls stat[6].value
// Single stat[7].value
// Double stat[8].value
// Triple stat[9].value
// Challenges stat[10].value
// Challenges correct stat[11].value
// Pitches stat[12].value
// Strikes stat[13].value
// Outs stat[14].value
// Balls stat[15].value
// Strikeouts stat[16].value
// Strikes temporary stat[17].value 球數
// Outs temporary stat[18].value
// Balls temporary correct stat[19].value
// 1st base stat[20].value 壘包資訊
// 2nd base stat[21].value
// 3rd base stat[22].value
//----
// 是否為贏家 results[0].value
// 是否正在進行 results[1].value
// 總得分 results[2].value
// 第一局得分 results[3].value
// 第二局得分 results[4].value
// 第三局得分 results[5].value
// 第四局得分 results[6].value
// 第五局得分 results[7].value
// 第六局得分 results[8].value
// 第七局得分 results[9].value
// 第八局得分 results[10].value
// 第九局得分 results[11].value
// 第十局得分 results[12].value
// 第十一局得分 results[13].value
// 第十二局得分 results[14].value
// 第十三局得分 results[15].value
// 第十四局得分 results[16].value
// 第十五局得分 results[17].value
// 第十六局得分 results[18].value
// 第十七局得分 results[19].value
// 第十八局得分 results[20].value
// 第十九局得分 results[21].value
// 第二十局得分 results[22].value
// 第二一局得分 results[23].value
// 第二二局得分 results[24].value
// 第二三局得分 results[25].value
