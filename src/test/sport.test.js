// const modules = require('../../util/modules'); // 不可以用這個，會造成 jest 執行結束後，仍然無法正常結束
const moment = require('moment');
const request = require('supertest');

const localhost = 'localhost:5000';
const sportslottery_test = 'https://us-central1-sportslottery-test.cloudfunctions.net/api';
const apidosports = 'https://api-dosports.web.app';

const url = localhost // 依照需求自行切換測試網址

// 可以自行替換登入後 cookie token 值
const token = '';

describe('/sport Endpoints', () => {
  const today = moment().utcOffset(8).add(7, 'days').format('YYYY-MM-DD'); // 7天後
  const league = 'NBA';

  it(`/sport/prematch?date=${today}&league=${league}`, async () => {
    const res = await request(url)
      .get(`/sport/prematch?date=${today}&league=${league}`);

    expect(res.statusCode).toEqual(200);
    expect(typeof res.body).toEqual(typeof []);
  });

  it(`/sport/prematch?date=${today}&league=CCC 聯盟錯誤`, async () => {
    const res = await request(url)
      .get(`/sport/prematch?date=${today}&league=CCC`);

    expect(res.statusCode).toEqual(400);
    expect(res.body[0]).toHaveProperty('keyword');
  });
});
