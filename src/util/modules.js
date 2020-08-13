const Moment = require('moment');
const MomentRange = require('moment-range');
const moment = MomentRange.extendMoment(Moment);
require('moment-timezone');
const { zone_tw } = require('../config/env_values');
const UTF8 = 8;
const oneDayMinusOneUnix = 86399;
const to = require('await-to-js').default;
const AppErrors = require('./AppErrors');
const NP = require('number-precision');
const periods = require('../config/periods.json');

const winston = require('winston');
const useFormat = winston.format.combine(
  winston.format((info) => { // winston.format((info, opts)
    let level = info.level.toUpperCase();
    if (level === 'VERBOSE') { level = 'DEBUG'; }
    info.severity = level;
    delete info.level;
    return info;
  })(),
  winston.format.json());
const { LoggingWinston } = require('@google-cloud/logging-winston');
const loggingWinston = new LoggingWinston();
const logger = winston.createLogger({
  level: 'debug',
  format: useFormat,
  transports: [
    new winston.transports.Console(),
    loggingWinston
  ]
});

// 輸入的時間為該時區 ，輸出轉為 GMT 時間
/*
  date: 2020-07-01 or 20200701
  [operation]: {
        op: 'add',
        value: 1,
        unit: 'days'
      }
  zone: 'America/Los_Angeles' or 'Asia/Taipei'
*/
function convertTimezone(date, operation, zone = zone_tw) {
  if (operation) {
    if (operation.op === 'add') {
      return moment.tz(date, zone).add(operation.value, operation.unit).unix();
    }
    if (operation.op === 'subtract') {
      return moment
        .tz(date, zone)
        .subtract(operation.value, operation.unit)
        .unix();
    }
  }
  return moment.tz(date, zone).unix();
};

// 輸入的時間為 unix ，輸出轉為 YYYYMMDD 格式
/*
  unix: Math.floor(Date.now() / 1000)
  [operation]: {
        op: 'add',
        value: 1,
        unit: 'days'
      }
  zone: 'America/Los_Angeles' or 'Asia/Taipei'
*/
function convertTimezoneFormat(unix, operation, zone = zone_tw) {
  unix = unix * 1000;
  const datetime = moment.tz(unix, zone);
  if (!operation) return datetime.format('YYYYMMDD');
  /* 處理時間計算 */
  if (operation.op === 'add') {
    datetime.add(operation.value, operation.unit);
  } else if (operation.op === 'subtract') {
    datetime.subtract(operation.value, operation.unit);
  }
  /* 處理時間格式 */
  if (operation.format) return datetime.format(operation.format);
  else return datetime.format('YYYYMMDD');
}

/*
  sdate: 2020-07-01 or 20200701
  op: 沒填寫會有預設值
    num: 正負數值為加減 unit
    unit: days、weeks 等 以 moment 提供格式為主
*/
function convertDateYMDToGTM0Unix(sdate, op) {
  let { num, unit, zone } = Object.assign(
    {},
    { num: 0, unit: 'days', zone: zone_tw },
    op
  );
  num = !isNaN(parseFloat(num)) && isFinite(num) ? num : 0; // 數字否，不是給0
  return moment.tz(sdate, zone).add(num, unit).unix();
}
/*
  sdateUnix: Date.now() or unix() or moment 型態 長度 33
  op: 沒填寫會有預設值
    format: YYYYMMDD or YYYY-MM-DD 以 moment 提供格式為主
    num: 正負數值為加減 unit
    unit: days、weeks 等 以 moment 提供格式為主
*/
function convertGTM0UnixToDateYMD(sdateUnix, op) {
  let { format, num, unit, zone } = Object.assign(
    {},
    { format: 'YYYYMMDD', num: 0, unit: 'days', zone: zone_tw },
    op
  );
  sdateUnix = sdateUnix.toString().length === 10 ? sdateUnix * 1000 : sdateUnix;
  num = !isNaN(parseFloat(num)) && isFinite(num) ? num : 0; // 數字否，不是給0
  return moment.tz(sdateUnix, zone).add(num, unit).format(format);
}

/*
  sdateUnix: Date.now() or unix() or moment 型態 長度 33
  日期區間結合 MomentRange 減少錯誤
*/
function coreDateInfo(sdateUnix, zone = zone_tw) {
  sdateUnix = sdateUnix.toString().length === 10 ? sdateUnix * 1000 : sdateUnix;
  const mdate = moment.tz(sdateUnix, zone);
  const dateYYYYMMDD = mdate.format('YYYYMMDD');
  const dateBeginUnix = moment.tz(dateYYYYMMDD, zone).unix();
  const dateEndUnix = moment.tz(dateYYYYMMDD, zone).add(1, 'days').unix() - 1;

  return {
    mdate: mdate,
    dateYYYYMMDD: dateYYYYMMDD,
    dateBeginUnix: dateBeginUnix,
    dateEndUnix: dateEndUnix
  };
}
/*
  sdateUnix: Date.now() or unix() or moment 型態 長度 33
*/
function date3Info(sdateUnix, zone = zone_tw) {
  sdateUnix = sdateUnix.toString().length === 10 ? sdateUnix * 1000 : sdateUnix;
  const sdateInfo = coreDateInfo(sdateUnix, zone);
  const yesterdayInfo = coreDateInfo(
    moment.tz(sdateUnix, zone).subtract(1, 'days').unix(),
    zone
  );
  const tomorrowInfo = coreDateInfo(
    moment.tz(sdateUnix, zone).add(1, 'days').unix(),
    zone
  );

  return {
    mdate: sdateInfo.mdate,
    dateYYYYMMDD: sdateInfo.dateYYYYMMDD,
    dateBeginUnix: sdateInfo.dateBeginUnix,
    dateEndUnix: sdateInfo.dateEndUnix,
    myesterday: yesterdayInfo.mdate,
    yesterdayYYYYMMDD: yesterdayInfo.dateYYYYMMDD,
    yesterdayBeginUnix: yesterdayInfo.dateBeginUnix,
    yesterdayEndUnix: yesterdayInfo.dateEndUnix,
    mtomorrow: tomorrowInfo.mdate,
    tomorrowYYYYMMDD: tomorrowInfo.dateYYYYMMDD,
    tomorrowBeginUnix: tomorrowInfo.dateBeginUnix,
    tomorrowEndUnix: tomorrowInfo.dateEndUnix
  };
}
/*
  sdate: 2020-07-01 or 20200701
*/
function date3YMDInfo(sdate, zone = zone_tw) {
  return date3Info(moment.tz(sdate, zone)); // 有 unix() 也可以  moment.tz(sdate, zone).unix()
}
/*
  sdateUnix: Date.now() or unix() or moment 型態 長度 33
*/
function date3UnixInfo(sdateUnix, zone = zone_tw) {
  return date3Info(sdateUnix, zone);
}

function createError(code, error) {
  const err = {};
  err.code = code;
  err.error = error;
  return err;
}

function dateFormat(date) {
  return {
    year: date.substring(0, 4),
    month: date.substring(5, 7),
    day: date.substring(8, 10)
  };
}

/**
 * @description 回傳頭銜期數、開始/結束日期和該期是第幾個星期
 * @params date = new Date();
 */
function getTitlesPeriod(date, format = 'YYYYMMDD') {
  const now = moment(date).utcOffset(UTF8).unix();
  for (let i = 0; i < periods.length; i++) {
    const ele = periods[i];
    const beginUnix = ele.begin.unix;
    const endUnix = ele.end.unix;
    const middleUnix = ele.middle.unix;

    if (beginUnix <= now && now <= endUnix) {
      const lastPeriod = periods[i - 1];
      return {
        period: lastPeriod.period,
        date: lastPeriod.begin.format,
        end: lastPeriod.end.format,
        weekPeriod: now < middleUnix ? 1 : 2,
        periodBeginDateBeginUnix: lastPeriod.begin.unix,
        periodBeginDateEndUnix: lastPeriod.begin.unix + oneDayMinusOneUnix,
        periodEndDateBeginUnix: lastPeriod.end.unix,
        periodEndDateEndUnix: lastPeriod.end.unix + oneDayMinusOneUnix
      };
    };
  }
}

/**
 * @description 回傳 下一期數、開始/結束日期和 目前日期 位於 該期是第幾個星期
 * @params date = new Date();
 */
function getTitlesNextPeriod(sdate, format = 'YYYYMMDD') {
  const t = getTitlesPeriod(sdate, format);
  if (t === 0) return 0;

  const periodBeginDateUnix = convertDateYMDToGTM0Unix(t.date, {
    num: 2,
    unit: 'weeks'
  });
  const periodEndDateUnix = convertDateYMDToGTM0Unix(t.end, {
    num: 2,
    unit: 'weeks'
  });
  const periodBeginDate = coreDateInfo(periodBeginDateUnix);
  const periodEndDate = coreDateInfo(periodEndDateUnix);

  return {
    period: t.period + 1,
    date: periodBeginDate.mdate.format(format),
    end: periodEndDate.mdate.format(format),
    weekPeriod: t.weekPeriod,
    periodBeginDateBeginUnix: periodBeginDate.dateBeginUnix,
    periodBeginDateEndUnix: periodBeginDate.dateEndUnix,
    periodEndDateBeginUnix: periodEndDate.dateBeginUnix,
    periodEndDateEndUnix: periodEndDate.dateEndUnix
    // inputDateWeekOfYear: t.inputDateWeekOfYear,
    // inputDateDayOfYear: t.inputDateDayOfYear
  };
}

// titles
// {
//   continue:
//   predict_rate1:
//   predict_rate2:
//   predict_rate3:
//   win_bets_continue:
//   matches_rate1:
//   matches_rate2:
//   matches_continue
// }
function getTitles(titles, num = 1) {
  switch (num) {
    case 1:
      return { 1: titles.continue };
    case 2:
      return {
        2: [titles.predict_rate1, titles.predict_rate2, titles.predict_rate3]
      };
    case 3:
      return { 3: [titles.predict_rate1, titles.predict_rate3] };
    case 4:
      return { 4: titles.win_bets_continue };
    case 5:
      return { 5: [titles.matches_rate1, titles.matches_rate2] };
    case 6:
      return { 6: titles.matches_continue };
  }
}

// titles
// {
//   continue:
//   predict_rate1:
//   predict_rate2:
//   predict_rate3:
//   win_bets_continue:
//   matches_rate1:
//   matches_rate2:
//   matches_continue
// }
function getAllTitles(titles) {
  return {
    1: titles.continue,
    2: [titles.predict_rate1, titles.predict_rate2, titles.predict_rate3],
    3: [titles.predict_rate1, titles.predict_rate3],
    4: titles.win_bets_continue,
    5: [titles.matches_rate1, titles.matches_rate2],
    6: titles.matches_continue
  };
}

function userStatusCodebook(role) {
  switch (role) {
    case 1:
      return 'GOD';
    case 9:
      return 'ADMIN';
    default:
      return 'NORMAL';
  }
}

// 將陣列裡面的 object 依照 attrib 來進行分類成 array
function groupBy(arr, prop) {
  const map = new Map(Array.from(arr, (obj) => [obj[prop], []]));
  arr.forEach((obj) => map.get(obj[prop]).push(obj));
  return Array.from(map.values());
}

// groupsby 多 group 欄位參數 且 排序(多欄位) 且 可限制筆數
// 輸入參數
//   prop: [o.uid, o.league_id] // group 欄位
//   order: ['date_timestamp', ...] // date_timestamp：小到大  -date_timestamp：大到小
//   limit: 30 // -1 全部
// 回傳
//   { uid: 'Xw4dOKa4mWh3Kvlx35mPtAOX2P52', league_id: '2274', lists: [ {...}, ... ]}
function groupsByOrdersLimit(array, prop, order, limit = -1) {
  const groups = {};
  array.forEach(function(o) {
    // 組出 prop 的 json 字串 做為 groups key 值
    var group = JSON.stringify(
      prop.map((m) => {
        return o[m];
      })
    );
    groups[group] = groups[group] || [];
    groups[group].push(o);
  });

  // eslint-disable-next-line no-unused-vars
  for (let [key, o] of Object.entries(groups)) {
    o.sort(fieldSorter(order));
    o = o.slice(0, limit); // 取幾筆
  }

  return Object.keys(groups).map(function(group) {
    const res = {};
    const t = JSON.parse(group); // 把 json 字串 轉回 object
    for (const [key, value] of Object.entries(t)) {
      res[prop[key]] = value;
    }

    res.lists = groups[group];
    return res;
  });
}

// sort an array of objects by multiple fields
// https://stackoverflow.com/a/30446887
const fieldSorter = (fields) => (a, b) =>
  fields
    .map((o) => {
      let dir = 1;
      if (o[0] === '-') {
        dir = -1;
        o = o.substring(1);
      }
      return a[o] > b[o] ? dir : a[o] < b[o] ? -dir : 0;
    })
    .reduce((p, n) => p || n, 0);

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 * https://www.itranslater.com/qa/details/2115518846294557696
 */
// function mergeDeep(target, ...sources) {
//   if (!sources.length) return target;
//   const source = sources.shift();

//   if (isObject(target) && isObject(source)) {
//     for (const key in source) {
//       if (isObject(source[key])) {
//         if (!target[key]) Object.assign(target, { [key]: {} });
//         mergeDeep(target[key], source[key]);
//       } else {
//         Object.assign(target, { [key]: source[key] });
//       }
//     }
//   }

//   return mergeDeep(target, ...sources);
// }

const mergeDeep = (target, source) => {
  const isDeep = (prop) =>
    isObject(source[prop]) &&
    Object.prototype.hasOwnProperty.call(target, prop) &&
    isObject(target[prop]);
  const replaced = Object.getOwnPropertyNames(source)
    .map((prop) => ({
      [prop]: isDeep(prop)
        ? mergeDeep(target[prop], source[prop])
        : source[prop]
    }))
    .reduce((a, b) => ({ ...a, ...b }), {});

  return {
    ...target,
    ...replaced
  };
};

// 一般 NBA MLB
// home_alias = 'CHA'
//
// home: {
//     team_name: 'CHA',
//     alaias: 'CHA',
//     alias_ch: '黃蜂',
//     player_name: null
// }
//
// 電競足球
// home_alias = 'Atletico Madrid (Boulevard_Prospect)'
//
// home: {
//   team_name: 'Atletico Madrid (Boulevard_Prospect)',
//   alaias: 'Atletico Madrid',
//   alias_ch: 'Atletico Madrid',
//   player_name: 'Boulevard_Prospect'
// }
//
// team_name: ele.home_alias,
// alias: sliceTeamAndPlayer(ele.home_alias).team,
// alias_ch: sliceTeamAndPlayer(ele.home_alias_ch).team,
// player_name: sliceTeamAndPlayer(ele.home_alias).player_name,
//
// 將電競足球的隊名和球員分開
function sliceTeamAndPlayer(name) {
  if (name.includes('(')) {
    const index = name.indexOf('(');
    return {
      team: name.slice(0, index).trim(),
      player_name: name.slice(index).replace('(', '').replace(')', '').trim()
    };
  }
  return {
    team: name.trim(),
    player_name: null
  };
}

function godUserPriceTable(rank) {
  rank = Number.parseInt(rank);
  switch (rank) {
    case 1:
      return 179;
    case 2:
      return 169;
    case 3:
      return 159;
    case 4:
      return 149;
    default:
      return 149;
  }
}

function validateProperty(data, propertyName) {
  const property = data[propertyName];
  if (property === undefined) {
    throw new AppErrors.PropertyMissingError(
      `${propertyName} 資料欄位缺漏 (undefined)`
    );
  }
  return property;
}

module.exports = {
  createError,
  moment,
  dateFormat,
  getTitlesPeriod,
  getTitlesNextPeriod,
  getTitles,
  getAllTitles,
  userStatusCodebook,
  UTF8,
  convertTimezone,
  convertTimezoneFormat,
  convertDateYMDToGTM0Unix,
  convertGTM0UnixToDateYMD,
  coreDateInfo,
  date3YMDInfo,
  date3UnixInfo,
  groupBy,
  groupsByOrdersLimit,
  fieldSorter,
  mergeDeep,
  sliceTeamAndPlayer,
  to,
  godUserPriceTable,
  validateProperty,
  NP,
  logger
};
