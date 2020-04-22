const modules = require('../util/modules');

function titlePeriod () {
  const specificDate = '20200302';
  let weeks = 0;
  const years = [
    2020,
    2021,
    2022,
    2023,
    2024,
    2025,
    2026,
    2027,
    2028,
    2029,
    2030
  ];
  for (let i = 0; i < years.length; i++) {
    const year = years[i];
    const weeksInYear = modules.moment(year).isoWeeksInYear(); // always 53
    weeks += weeksInYear;
  }
  weeks -= modules.moment().weeks();
  for (let i = 0; i < Math.ceil(weeks / 2); i++) {
    const begin = modules
      .moment(specificDate)
      .utcOffset(8)
      .add(i * 2, 'weeks');
    const end = modules
      .moment(specificDate)
      .utcOffset(8)
      .add(i * 2 + 1, 'weeks')
      .endOf('isoWeek');
    const data = {
      period: i + 1,
      begin_date: begin.format('YYYYMMDD'),
      begin_timestamp: begin.valueOf(),
      end_date: end.format('YYYYMMDD'),
      end_timestamp: end.valueOf()
    };
    modules.addDataInCollectionWithId(
      'titles_period',
      (i + 1).toString(),
      data
    );
  }
}
module.exports = titlePeriod;
