/**
 * @description 回傳頭銜期數、開始/結束日期和該期是第幾個星期
 * @params date = new Date();
 **/
const Moment = require('moment');
const MomentRange = require('moment-range');
const moment = MomentRange.extendMoment(Moment);
require('moment-timezone');
const { zone_tw } = require('../config/env_values');
const UTF8 = 8;
const specificDate = '20200302';
const fs = require('fs');
const { getTitlesPeriod } = require('../util/modules');


function testPeriod(req, res) {
  const period = getTitlesPeriod(new Date());
  console.log(period);
  // const dataArray = exportPeriodFile();
  // res.json(dataArray);
  res.json(period);
}

function exportPeriodFile() {
 const date = moment(specificDate);
  const dataArray = [];
  for (let i = 1; i <= 400; i++) {
    const dynamic2Weeks = moment.tz(date, zone_tw).add(2 * i, 'weeks');
    const data = returnTitlesPeriod(dynamic2Weeks);
    dataArray.push(data);
  }
  fs.writeFile('./periods.json', JSON.stringify(dataArray), function(err) {
    if (err) throw err;
    console.log('--- Period JSON file finish ---');
  });
  return dataArray;
}

function returnTitlesPeriod(date, format = 'YYYYMMDD') {
  const years = [];
  let weeks = 0;
  for (let i = 0; i <= 16; i++) {
    years.push(2020 + i);
  }

  for (let i = 0; i < years.length; i++) {
    const year = years[i];
    const weeksInYear = moment(year).isoWeeksInYear(); // always 53
    weeks += weeksInYear;
  }
  weeks -= moment(specificDate).weeks(); // 減去從 specificDate 已過幾週

  const periodTenYear = Math.ceil(weeks / 2);
  for (let i = 1; i < periodTenYear; i++) {
    const begin = moment(specificDate)
      .utcOffset(UTF8)
      .add(i * 2 - 1, 'weeks')
      .endOf('isoWeek')
      .valueOf();

    const end = moment(specificDate)
      .utcOffset(UTF8)
      .add(i * 2 + 1, 'weeks')
      .endOf('isoWeek')
      .valueOf();

    if (begin <= date && date <= end) {
      const beginDate = moment(specificDate) // 該期開始計算的日期
        .utcOffset(UTF8)
        .add(i * 2 - 2, 'weeks')
        .format(format);
      const beginDateUnix = moment
        .tz(beginDate, format, zone_tw)
        .unix();
      const middleDate = moment(specificDate) // 該期開始計算的日期
        .utcOffset(UTF8)
        .add(i * 2 - 1, 'weeks')
        .format(format);
      const middleDateUnix = moment
        .tz(middleDate, format, zone_tw)
        .unix();
      const endDate = moment(specificDate) // 該期結束計算的日期
        .utcOffset(UTF8)
        .add(i * 2, 'weeks')
        .subtract(1, 'days')
        .format(format);
      const endDateUnix = moment
        .tz(endDate, format, zone_tw)
        .unix();
      return {
        period: i,
        begin: { format: beginDate, unix: beginDateUnix },
        middle: { format: middleDate, unix: middleDateUnix },
        end: { format: endDate, unix: endDateUnix }
      };
    }
  }
}

module.exports = testPeriod;

